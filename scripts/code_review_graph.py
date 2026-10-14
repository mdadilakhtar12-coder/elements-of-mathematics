#!/usr/bin/env python3
"""Build a code review graph for the Kotlin sources under app/src.

Nodes are Kotlin files. An edge A -> B means file A refers to a non-private
top-level declaration that file B defines, either because both files share a
package or because A imports the name. Comments and string literals are
ignored so that words inside them do not create false edges.

Usage:
  python3 scripts/code_review_graph.py              # write docs/code-review-graph.{md,json}
  python3 scripts/code_review_graph.py --impact main # files a change since `main` can affect
"""
import argparse
import json
import os
import re
import subprocess
from collections import defaultdict, deque

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join("app", "src")

PACKAGE = re.compile(r"^package\s+([\w.]+)", re.M)
IMPORT = re.compile(r"^import\s+([\w.]+)(\.\*)?(?:\s+as\s+\w+)?\s*$", re.M)
DECL = re.compile(
    r"^(?P<vis>private|internal|public)?\s*"
    r"(?:(?:data|sealed|enum|abstract|open|annotation|inline|suspend|override|const|lateinit|value)\s+)*"
    r"(?P<kind>class|object|interface|fun|val|var|typealias)\s+"
    r"(?:<[^>]*>\s*)?(?:[\w.]+\.)?(?P<name>\w+)"
)
# Comments and string literals, replaced by spaces so line structure is kept.
NON_CODE = re.compile(
    r'"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|\'(?:\\.|[^\'\\\n])*\''
    r"|//[^\n]*|/\*[\s\S]*?\*/"
)
IDENT = re.compile(r"\b[A-Za-z_]\w*\b")


def strip_non_code(text):
    return NON_CODE.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), text)


def load(root):
    files = {}
    base = os.path.join(root, SRC)
    for dirpath, _, names in os.walk(base):
        for name in names:
            if not name.endswith(".kt"):
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root).replace(os.sep, "/")
            with open(full, encoding="utf-8") as fh:
                text = fh.read()
            pkg = PACKAGE.search(text)
            imports = [m.group(1) for m in IMPORT.finditer(text) if not m.group(2)]
            wildcards = [m.group(1) for m in IMPORT.finditer(text) if m.group(2)]
            decls = {}
            for line in text.splitlines():
                if not line or line[0].isspace():
                    continue
                m = DECL.match(line)
                if m:
                    decls.setdefault(m.group("name"), (m.group("kind"), m.group("vis") or "public"))
            code = strip_non_code(text)
            idents = set(IDENT.findall(code))
            files[rel] = {
                "package": pkg.group(1) if pkg else "",
                "lines": text.count("\n") + 1,
                "imports": imports,
                "imported_names": {i.rsplit(".", 1)[-1] for i in imports},
                "wildcards": wildcards,
                "decls": decls,
                "idents": idents,
            }
    return files


def build_edges(files):
    owners = defaultdict(list)
    for path, f in files.items():
        for name, (_, vis) in f["decls"].items():
            if vis != "private":
                owners[name].append(path)

    edges = {}
    for a, fa in files.items():
        for ident in fa["idents"]:
            for b in owners.get(ident, ()):
                if b == a:
                    continue
                fb = files[b]
                visible = (
                    fb["package"] == fa["package"]
                    or ident in fa["imported_names"]
                    or fb["package"] in fa["wildcards"]
                )
                if visible:
                    edges.setdefault((a, b), set()).add(ident)
    return edges


def impacted(edges, changed):
    dependents = defaultdict(set)
    for a, b in edges:
        dependents[b].add(a)
    seen = set(changed)
    queue = deque(changed)
    while queue:
        node = queue.popleft()
        for d in dependents[node]:
            if d not in seen:
                seen.add(d)
                queue.append(d)
    return seen - set(changed)


def group_of(path):
    rel = path[len(SRC) + 1:]  # drop "app/src/"
    parts = rel.split("/")
    # Drop main/java/<package path>/ so groups show the feature folder.
    idx = parts.index("elementsofmathematics") if "elementsofmathematics" in parts else -1
    tail = parts[idx + 2:-1] if idx >= 0 else parts[:-1]
    return "/".join(tail) or "(root)"


def git_changed(ref, files):
    out = subprocess.run(
        ["git", "diff", "--name-only", ref, "--", SRC],
        cwd=REPO, capture_output=True, text=True, check=True,
    ).stdout.split()
    kt = [p for p in out if p.endswith(".kt")]
    return [p for p in kt if p in files], [p for p in kt if p not in files]


def render_markdown(files, edges, fan_in, fan_out):
    order = sorted(files)
    node_id = {p: f"n{i}" for i, p in enumerate(order)}
    groups = defaultdict(list)
    for p in order:
        groups[group_of(p)].append(p)

    lines = []
    add = lines.append
    total_public = sum(sum(1 for v in f["decls"].values() if v[1] != "private") for f in files.values())
    add("# Code review graph")
    add("")
    add("Generated by `scripts/code_review_graph.py` from the Kotlin sources under `app/src`. "
        "Regenerate after changing the code with `python3 scripts/code_review_graph.py`.")
    add("")
    add(f"- Files: **{len(files)}** ({sum(f['lines'] for f in files.values())} lines)")
    add(f"- Public top-level declarations: **{total_public}**")
    add(f"- Dependency edges between files: **{len(edges)}**")
    add("")
    add("An arrow `A --> B` means `A` uses something `B` declares. "
        "To see what a change affects, run `python3 scripts/code_review_graph.py --impact <base-ref>`.")
    add("")
    add("## Diagram")
    add("")
    add("```mermaid")
    add("flowchart LR")
    for gi, (group, members) in enumerate(sorted(groups.items())):
        add(f'  subgraph g{gi}["{group}"]')
        for p in members:
            add(f'    {node_id[p]}["{os.path.basename(p)[:-3]}"]')
        add("  end")
    for a, b in sorted(edges):
        add(f"  {node_id[a]} --> {node_id[b]}")
    add("```")
    add("")
    add("## Hotspots")
    add("")
    add("Files that many others depend on. A change here has the widest blast radius.")
    add("")
    add("| File | Used by | Uses |")
    add("|---|---|---|")
    for p in sorted(order, key=lambda p: (-fan_in[p], p))[:8]:
        if fan_in[p] == 0:
            break
        add(f"| `{p[len(SRC) + 1:]}` | {fan_in[p]} | {fan_out[p]} |")
    add("")
    add("## Files")
    add("")
    add("| File | Lines | Public declarations | Used by | Uses |")
    add("|---|---:|---:|---:|---:|")
    for p in sorted(order, key=lambda p: (-fan_in[p], p)):
        public = sum(1 for v in files[p]["decls"].values() if v[1] != "private")
        add(f"| `{p[len(SRC) + 1:]}` | {files[p]['lines']} | {public} | {fan_in[p]} | {fan_out[p]} |")
    add("")
    add("## Dependencies")
    add("")
    uses = defaultdict(list)
    for (a, b), names in edges.items():
        uses[a].append((b, sorted(names)))
    for p in order:
        if not uses[p]:
            continue
        add(f"- `{os.path.basename(p)}`")
        for b, names in sorted(uses[p]):
            add(f"  - `{os.path.basename(b)}`: {', '.join(names)}")
    add("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--impact", metavar="REF", help="list files affected by changes since REF")
    parser.add_argument("--out", default=os.path.join(REPO, "docs"), help="output directory")
    args = parser.parse_args()

    files = load(REPO)
    edges = build_edges(files)

    if args.impact:
        changed, unknown = git_changed(args.impact, files)
        affected = impacted(edges, changed)
        print(f"Changed Kotlin files since {args.impact}: {len(changed)}")
        for p in sorted(changed):
            print(f"  {p}")
        for p in unknown:
            print(f"  (skipped, not in graph: {p})")
        print(f"Files that depend on them, directly or indirectly: {len(affected)}")
        for p in sorted(affected):
            print(f"  {p}")
        return

    fan_in = defaultdict(int)
    fan_out = defaultdict(int)
    for a, b in edges:
        fan_out[a] += 1
        fan_in[b] += 1

    os.makedirs(args.out, exist_ok=True)
    md_path = os.path.join(args.out, "code-review-graph.md")
    json_path = os.path.join(args.out, "code-review-graph.json")
    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write(render_markdown(files, edges, fan_in, fan_out) + "\n")
    data = {
        "files": [
            {
                "path": p,
                "package": f["package"],
                "lines": f["lines"],
                "group": group_of(p),
                "public_declarations": sorted(n for n, v in f["decls"].items() if v[1] != "private"),
                "used_by": fan_in[p],
                "uses": fan_out[p],
            }
            for p, f in sorted(files.items())
        ],
        "edges": [
            {"from": a, "to": b, "symbols": sorted(names)} for (a, b), names in sorted(edges.items())
        ],
    }
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")
    print(f"Wrote {os.path.relpath(md_path, REPO)} and {os.path.relpath(json_path, REPO)}")
    print(f"{len(files)} files, {len(edges)} edges")


if __name__ == "__main__":
    main()
