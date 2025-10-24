### Contributing to Wybthon Demo

This repo uses Conventional Commits for all commits. Keep it simple: we do not use scopes.

## Conventional Commits

Use the form:

```
<type>: <subject>

[optional body]

[optional footer(s)]
```

Subject rules:

- Imperative mood, no trailing period, ≤ 72 characters
- UTF‑8 allowed; avoid emoji in the subject

Accepted types:

- `build` – build system or external dependencies (e.g., package.json, tooling)
- `chore` – maintenance (no app behavior change)
- `ci` – continuous integration configuration (workflows, pipelines)
- `docs` – documentation only
- `feat` – user-facing feature or capability
- `fix` – bug fix
- `perf` – performance improvements
- `refactor` – code change that neither fixes a bug nor adds a feature
- `revert` – revert of a previous commit
- `style` – formatting/whitespace (no code behavior)
- `test` – add/adjust tests only

Examples:

```text
feat: add routing and forms demos to landing page
fix: handle deep links via hash routing on GitHub Pages
docs: add README and deployment notes for demo
style: format CSS and markdown in docs and site
chore: pin Pyodide version and update CDN SRI hashes
ci: add Pages deploy workflow for demo.wybthon.com
perf: reduce initial boot time by preloading Pyodide
refactor: split demo into modular components and routes
test: add smoke tests for SPA boot and navigation
revert: revert "perf: preload Pyodide for faster boot"
```

Breaking changes:

- Use `!` after the type or a `BREAKING CHANGE:` footer.

```text
feat!: switch demo routing to hash-based routing

BREAKING CHANGE: Deep links now use hash routing for GitHub Pages; update links.
```
