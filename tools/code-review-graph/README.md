# Code review graph

A dependency graph of the Kotlin sources, plus a review report that shows what a change
touches and everything that depends on it.

- `build_graph.py` — the builder (Python 3 standard library only, no Gradle needed)
- `graph.json` — the generated graph: file nodes, declaration nodes (classes, objects,
  interfaces, functions, properties) and three kinds of edges:
  - `contains`: class/object → its members
  - `references`: a declaration → another declaration whose name it uses and that is
    visible to it (same file, same package, or imported)
  - `imports`: file → file, from project imports

## Usage

```sh
# Regenerate graph.json after code changes
python3 tools/code-review-graph/build_graph.py build

# Review a change: what it touches and what depends on it
python3 tools/code-review-graph/build_graph.py review --base origin/main
python3 tools/code-review-graph/build_graph.py review --base HEAD~1 --out review.md
```

`--base` is any git revision. The review reads the working tree, so it also covers
uncommitted edits. The report lists:

1. changed declarations (lines inside a declaration, mapped to the innermost one),
2. changed files outside any declaration (package and import lines),
3. impacted declarations, nearest first, with the dependency that reached each one,
4. removed or renamed names that the remaining code still uses,
5. the files to review.

## Limits

This is a scanner, not a compiler. It reads comments, strings and braces correctly, but:

- Only declarations directly in a file or a class/object body are indexed. Local
  variables and local functions are not nodes.
- References are matched by identifier. A name that is common across files is linked
  only when it is visible (same package or imported), so false positives are possible
  but misses are rare.
- Annotations on the line before a declaration belong to the previous node's range.
