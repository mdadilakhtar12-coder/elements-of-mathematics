#!/usr/bin/env python3
"""Code review graph for the Kotlin sources.

  build   python3 tools/code-review-graph/build_graph.py build
          writes tools/code-review-graph/graph.json (files, declarations, dependencies)

  review  python3 tools/code-review-graph/build_graph.py review --base origin/main [--out REPORT.md]
          lists the declarations a diff touches and everything that depends on them

Stdlib only. Kotlin is read with a comment/string-aware, brace-level scanner, not a
compiler, so references are matched by identifier and narrowed by package and imports.
Expect some false positives on very common names; a name that is imported or declared
in the same package is always linked.
"""
import argparse
import json
import re
import subprocess
from collections import defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GRAPH_PATH = Path(__file__).resolve().parent / "graph.json"
SKIP_DIRS = {".git", ".gradle", "build"}
CONTAINERS = {"class", "object", "interface"}

DECL_RE = re.compile(
    r"^\s*(?:@\w+(?:\([^)]*\))?\s+)*"
    r"(?:(?:private|internal|public|protected|data|sealed|enum|abstract|open|override|"
    r"suspend|inline|const|lateinit|operator|infix|tailrec|external|annotation|value|companion)\s+)*"
    r"(class|object|interface|fun|val|var|typealias)\s+"
    r"(?:<[^>]*>\s*)?(?:[\w.<>?, ]+\.)?(\w+)"
)
COMPANION_RE = re.compile(r"^\s*(?:(?:private|internal|public|protected)\s+)?companion\s+object\b")
IDENT_RE = re.compile(r"\b[A-Za-z_]\w*\b")
CHAR_RE = re.compile(r"'(?:\\.[^'\n]*|[^'\\\n])'")
HUNK_RE = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@")


def clean(src: str) -> str:
    """Blank out comments and literal text, keeping newlines so line numbers survive.
    Identifiers inside string templates ($name, ${expr}) stay visible as code."""
    out, stack = [], []  # stack items: ["str", is_raw] or ["expr", open_braces]
    i, n, block = 0, len(src), 0
    while i < n:
        c = src[i]
        if block:
            if src.startswith("/*", i):
                block += 1
                i += 2
            elif src.startswith("*/", i):
                block -= 1
                i += 2
            else:
                out.append("\n" if c == "\n" else " ")
                i += 1
            continue
        top = stack[-1] if stack else None
        if top and top[0] == "str":
            closer = '"""' if top[1] else '"'
            nxt = src[i + 1:i + 2]
            if src.startswith(closer, i):
                stack.pop()
                out.append(" ")
                i += len(closer)
            elif not top[1] and c == "\\":
                out.append("  ")
                i += 2
            elif c == "$" and nxt == "{":
                stack.append(["expr", 0])
                out.append("  ")
                i += 2
            elif c == "$" and (nxt.isalpha() or nxt == "_"):
                j = i + 1
                while j < n and (src[j].isalnum() or src[j] == "_"):
                    j += 1
                out.append(" " + src[i + 1:j] + " ")
                i = j
            else:
                out.append("\n" if c == "\n" else " ")
                i += 1
            continue
        if top and top[0] == "expr":
            if c == "{":
                top[1] += 1
            elif c == "}":
                if top[1] == 0:
                    stack.pop()
                    out.append(" ")
                    i += 1
                    continue
                top[1] -= 1
        if src.startswith("//", i):
            j = src.find("\n", i)
            i = n if j == -1 else j
        elif src.startswith("/*", i):
            block = 1
            i += 2
        elif src.startswith('"""', i):
            stack.append(["str", True])
            i += 3
        elif c == '"':
            stack.append(["str", False])
            i += 1
        elif c == "'" and (m := CHAR_RE.match(src, i)):
            out.append(" " * (m.end() - i))
            i = m.end()
        else:
            out.append(c)
            i += 1
    return "".join(out)


def kt_files():
    return sorted(p for p in ROOT.rglob("*.kt") if not SKIP_DIRS & set(p.relative_to(ROOT).parts))


def parse(path: Path) -> dict:
    """Package, imports and declarations of one file. Each declaration sits directly in the
    file or directly in an open class/object/interface body; locals are skipped."""
    rel = path.relative_to(ROOT).as_posix()
    code = clean(path.read_text(encoding="utf-8")).split("\n")
    pkg, imports = "", set()
    for ln in code:
        s = ln.strip()
        if s.startswith("package "):
            pkg = s[len("package "):].strip()
        elif s.startswith("import "):
            imports.add(s[len("import "):].split(" as ")[0].strip())

    local, stack, pending = [], [], None  # stack: (local index, body depth)
    depth = parens = 0  # brace depth; parens keeps constructor parameters out of the way
    for lineno, ln in enumerate(code, 1):
        while stack and depth < stack[-1][1]:
            stack.pop()
        at_level = depth == (stack[-1][1] if stack else 0) and parens == 0
        parent = stack[-1][0] if stack else None
        kind = name = None
        if COMPANION_RE.match(ln):
            kind, name = "object", "Companion"
        elif m := DECL_RE.match(ln):
            kind, name = m.group(1), m.group(2)
        opens, closes = ln.count("{"), ln.count("}")
        if name and at_level:
            local.append({"kind": kind, "name": name, "line": lineno, "parent": parent})
            pending = len(local) - 1 if kind in CONTAINERS else None
        if pending is not None and opens:
            stack.append((pending, depth + 1))
            pending = None
        depth += opens - closes
        parens += ln.count("(") - ln.count(")")

    for d in local:
        d["level"] = 0 if d["parent"] is None else local[d["parent"]]["level"] + 1
    for i, d in enumerate(local):
        d["end"] = len(code)
        for later in local[i + 1:]:
            if later["level"] <= d["level"]:
                d["end"] = later["line"] - 1
                break
    return {"rel": rel, "pkg": pkg, "imports": imports, "code": code, "local": local}


def build():
    """Return (decls, files, edges). decls and files are in memory; edges are sorted triples."""
    files, decls, used_ids = {}, [], set()
    for path in kt_files():
        f = parse(path)
        rel, base = f["rel"], len(decls)
        owner = [None] * (len(f["code"]) + 2)
        for k, d in enumerate(f["local"]):
            g = base + k
            parent = None if d["parent"] is None else base + d["parent"]
            qname = d["name"] if parent is None else f"{decls[parent]['qname']}.{d['name']}"
            node_id = f"{rel}::{qname}"
            if node_id in used_ids:
                node_id = f"{node_id}#{d['line']}"
            used_ids.add(node_id)
            decls.append({"id": node_id, "kind": d["kind"], "name": d["name"], "qname": qname,
                          "file": rel, "pkg": f["pkg"], "line": d["line"], "end": d["end"],
                          "level": d["level"], "parent": parent, "idents": set()})
            for L in range(d["line"], d["end"] + 1):
                owner[L] = g
        for L, g in enumerate(owner):
            if g is not None:
                decls[g]["idents"].update(IDENT_RE.findall(f["code"][L - 1]))
        files[rel] = {"pkg": f["pkg"], "imports": f["imports"], "owner": owner}

    name_index = defaultdict(list)
    fqn_index = {}
    for g, d in enumerate(decls):
        name_index[d["name"]].append(g)
        if d["parent"] is None:
            fqn_index[f"{files[d['file']]['pkg']}.{d['name']}"] = g

    def visible(f, e):
        return (e["pkg"] == f["pkg"] or f"{e['pkg']}.{e['name']}" in f["imports"]
                or f"{e['pkg']}.*" in f["imports"])

    edges = set()
    for d in decls:
        if d["parent"] is not None:
            edges.add((decls[d["parent"]]["id"], d["id"], "contains"))
    for g, d in enumerate(decls):
        f = files[d["file"]]
        for t in d["idents"]:
            for h in name_index.get(t, ()):
                e = decls[h]
                if h == g:
                    continue
                if e["file"] == d["file"]:
                    ok = True
                elif e["parent"] is None:
                    ok = visible(f, e)
                else:
                    top = decls[e["parent"]]
                    ok = top["parent"] is None and top["name"] in d["idents"] and visible(f, top)
                if ok:
                    edges.add((d["id"], e["id"], "references"))
    for rel, f in files.items():
        for imp in f["imports"]:
            if imp.endswith(".*"):
                targets = [r for r, g in files.items() if g["pkg"] == imp[:-2]]
            else:
                targets = [decls[fqn_index[imp]]["file"]] if imp in fqn_index else []
            for t in targets:
                if t != rel:
                    edges.add((f"file:{rel}", f"file:{t}", "imports"))
    return decls, files, sorted(edges)


def write_graph(decls, files, edges, out: Path):
    nodes = [{"id": f"file:{rel}", "kind": "file", "name": rel.rsplit("/", 1)[-1], "file": rel,
              "package": f["pkg"]} for rel, f in sorted(files.items())]
    nodes += [{"id": d["id"], "kind": d["kind"], "name": d["qname"], "file": d["file"],
               "line": d["line"], "end_line": d["end"], "package": d["pkg"],
               "parent": decls[d["parent"]]["id"] if d["parent"] is not None else None}
              for d in sorted(decls, key=lambda d: d["id"])]
    data = {
        "schema": 1,
        "generated_by": "tools/code-review-graph/build_graph.py",
        "stats": {"files": len(files), "declarations": len(decls), "edges": len(edges),
                  "edge_kinds": {k: sum(1 for e in edges if e[2] == k)
                                 for k in ("contains", "references", "imports")}},
        "nodes": nodes,
        "edges": [{"from": a, "to": b, "kind": k} for a, b, k in edges],
    }
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    return data["stats"]


def diff_info(base: str):
    """Changed new-side line numbers per file, and names of declarations the diff removed."""
    text = subprocess.run(["git", "diff", "-U0", "--no-renames", "--no-color", base, "--", "*.kt"],
                          cwd=ROOT, capture_output=True, text=True, check=True).stdout
    changed, removed, cur = defaultdict(set), [], None
    for line in text.splitlines():
        if line.startswith("+++ "):
            cur = None if line.startswith("+++ /dev/null") else line[len("+++ b/"):]
        elif line.startswith("--- "):
            continue
        elif line.startswith("@@") and cur:
            m = HUNK_RE.match(line)
            start, count = int(m.group(1)), int(m.group(2) or 1)
            changed[cur].update(range(start, start + count) if count else [max(start, 1)])
        elif line.startswith("-"):
            body = line[1:]
            # Only top-level and member indentation: deeper lines are locals, which the graph does not index.
            m = DECL_RE.match(body) if len(body) - len(body.lstrip()) <= 4 else None
            if m:
                removed.append(m.group(2))
    return changed, removed


def review(base: str, out: str | None):
    decls, files, edges = build()
    changed, removed = diff_info(base)

    seeds, file_seeds = {}, {}
    for rel, lines in sorted(changed.items()):
        if rel not in files:
            continue
        owner = files[rel]["owner"]
        for L in lines:
            g = owner[L] if L < len(owner) else None
            if g is None:
                file_seeds[f"file:{rel}"] = "changed outside any declaration (package/imports)"
            else:
                seeds[decls[g]["id"]] = "changed"
    seeds.update(file_seeds)

    rev = defaultdict(list)
    for a, b, k in edges:
        rev[b].append((a, k))
    seen = {s: (0, None) for s in seeds}
    queue = deque(sorted(seen))
    while queue:
        cur = queue.popleft()
        for src, _kind in rev[cur]:
            if src not in seen:
                seen[src] = (seen[cur][0] + 1, cur)
                queue.append(src)

    by_id = {d["id"]: d for d in decls}
    declared = {d["name"] for d in decls}
    gone = sorted({n for n in removed if n not in declared})
    still_used = []
    if gone:
        for d in decls:
            hit = sorted(d["idents"] & set(gone))
            if hit:
                still_used.append((d["id"], hit))

    def label(node_id):
        if node_id.startswith("file:"):
            return f"`{node_id[5:]}`"
        return f"`{node_id}`"

    direct = sorted(i for i, (depth, _) in seen.items() if depth == 0 and not i.startswith("file:"))
    impacted = sorted((depth, i, via) for i, (depth, via) in seen.items() if depth > 0)
    touched_files = sorted({seen_id.split("::")[0].removeprefix("file:") for seen_id in seen})

    lines = [
        "# Code review graph report",
        "",
        f"Base: `{base}` · changed Kotlin files: {len(changed)} · changed declarations: {len(direct)} · "
        f"impacted (dependents): {len(impacted)} · files to review: {len(touched_files)}",
        "",
        "## Changed declarations",
    ]
    lines += [f"- {label(i)}" for i in direct] or ["_None — only non-declaration lines changed._"]
    lines += ["", "## Changed files outside any declaration"]
    fl = sorted(i[5:] for i in file_seeds)
    lines += [f"- `{rel}`" for rel in fl] or ["_None._"]
    lines += ["", "## Impacted by these changes (nearest first)", "",
              "| Depth | Declaration | Reached through |", "|---|---|---|"]
    lines += [f"| {depth} | {label(i)} | {label(via)} |" for depth, i, via in impacted[:300]]
    if len(impacted) > 300:
        lines.append(f"\n_…{len(impacted) - 300} more not shown; see the graph for the full list._")
    if not impacted:
        lines.append("| — | _No dependents found._ | |")
    lines += ["", "## Removed or renamed names still referenced"]
    lines += [f"- {label(i)} uses {', '.join(f'`{n}`' for n in hit)}" for i, hit in still_used] \
        or ["_None._"]
    lines += ["", "## Files to review", ""]
    lines += [f"- `{rel}`" for rel in touched_files]
    text = "\n".join(lines) + "\n"
    if out:
        Path(out).write_text(text, encoding="utf-8")
        print(f"Report written to {out}")
    else:
        print(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build", help="write graph.json")
    b.add_argument("--out", default=str(GRAPH_PATH))
    r = sub.add_parser("review", help="report what a diff touches and what depends on it")
    r.add_argument("--base", default="origin/main", help="git revision to diff against")
    r.add_argument("--out", help="write the markdown report to this file instead of stdout")
    args = ap.parse_args()
    if args.cmd == "build":
        decls, files, edges = build()
        stats = write_graph(decls, files, edges, Path(args.out))
        print(json.dumps(stats, indent=1))
    else:
        review(args.base, args.out)


if __name__ == "__main__":
    main()
