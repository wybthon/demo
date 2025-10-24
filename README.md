Create a new public repo in the Wybthon org (e.g., wybthon/demo), copy
and polish examples/demo into a static SPA (index.html + bootstrap
loader, app/ routes and components, public/ assets), pin Pyodide from a
CDN with SRI and preloads, use relative asset paths or set
`<base href="/">` (or `<base href="/demo/">` if publishing under
wybthon.github.io/demo), and ensure deep links work on GitHub Pages via
hash routing or a 404.html that boots the app like index.html; add
title/description/OG meta, set a CNAME for demo.wybthon.com, a clean
navbar (Docs/GitHub/“Open in StackBlitz”), and “View source”
toggles on sections; enable GitHub Pages (Settings → Pages) from main
(root or /docs) or via the Pages workflow and turn on HTTPS/custom
domain; note limitations: no custom response headers (so no COOP/COEP or
SharedArrayBuffer threading) and limited cache control for large
.wasm—mitigate by using CDN-hosted, version-pinned Pyodide and
cache-busting filenames; keep CI minimal (lint/build, optional link
check) and rely on PR reviews since Pages previews aren’t automatic;
outcome is a fast, credible demo at demo.wybthon.com (or
wybthon.github.io/demo) showcasing routing, forms/validation, data
fetching, error boundaries, lazy/suspense, theming, and transitions.
