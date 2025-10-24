// Wybthon Demo bootstrap
// - Loads Pyodide from CDN (pinned version)
// - Installs wybthon from PyPI via micropip
// - Mounts local demo Python package `app/`
// - Runs app.main()

const PYODIDE_VERSION = "0.25.1";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const WYBTHON_VERSION = "0.8.0"; // Pin to a released PyPI version

let __wyb_overlay_el = null;
function showErrorOverlay(title, details) {
  try {
    if (__wyb_overlay_el) {
      __wyb_overlay_el.remove();
      __wyb_overlay_el = null;
    }
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.72)';
    overlay.style.backdropFilter = 'blur(2px)';
    overlay.style.zIndex = '2147483647';
    overlay.style.color = '#fff';
    overlay.style.overflow = 'auto';
    overlay.style.font = '13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    overlay.style.padding = '16px';

    const box = document.createElement('div');
    box.style.maxWidth = '960px';
    box.style.margin = '0 auto';
    box.style.background = '#1f2937';
    box.style.border = '1px solid #ef4444';
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)';
    box.style.padding = '16px 20px';

    const hdr = document.createElement('div');
    hdr.style.display = 'flex';
    hdr.style.alignItems = 'center';
    hdr.style.justifyContent = 'space-between';
    const h = document.createElement('div');
    h.textContent = title || 'Error';
    h.style.fontWeight = '700';
    h.style.color = '#fca5a5';
    h.style.fontSize = '14px';
    hdr.appendChild(h);
    const btn = document.createElement('button');
    btn.textContent = 'Dismiss';
    btn.style.background = '#374151';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #6b7280';
    btn.style.borderRadius = '6px';
    btn.style.padding = '6px 10px';
    btn.style.cursor = 'pointer';
    btn.onclick = () => { try { overlay.remove(); } catch {} };
    hdr.appendChild(btn);

    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.marginTop = '12px';
    pre.textContent = details || '';

    box.appendChild(hdr);
    box.appendChild(pre);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    __wyb_overlay_el = overlay;
  } catch {}
}

function computeBasePath() {
  let path = String(window.location.pathname || '/');
  if (path.endsWith('.html')) {
    path = path.split('/').slice(0, -1).join('/') || '/';
  }
  const basePath = path === '/' ? '/' : path.replace(/\/$/, '');
  return basePath;
}

async function bootstrap() {
  try {
    const { loadPyodide } = await import(`${PYODIDE_BASE_URL}pyodide.mjs`);
    const pyodide = await loadPyodide({ indexURL: PYODIDE_BASE_URL });

    // Ensure micropip is available, then install wybthon from PyPI
    await pyodide.loadPackage('micropip');
    try {
      await pyodide.runPythonAsync(
        `import micropip\n` +
        `try:\n` +
        `    await micropip.install(\"wybthon==${WYBTHON_VERSION}\")\n` +
        `except Exception:\n` +
        `    await micropip.install(\"wybthon\")\n`
      );
    } catch (err) {
      const msg = (err && (err.message || err.stack)) ? `${err.message || ''}\n${err.stack || ''}` : String(err);
      showErrorOverlay('Failed to install wybthon from PyPI', msg);
      throw err;
    }

    // Mount the demo app package under /app in Pyodide FS
    const ensureDir = (p) => { try { pyodide.FS.mkdir(p); } catch {} };
    ensureDir('/app');
    ensureDir('/app/components');
    ensureDir('/app/contexts');
    ensureDir('/app/about');
    ensureDir('/app/about/team');
    ensureDir('/app/docs');
    ensureDir('/app/fetch');
    ensureDir('/app/forms');
    ensureDir('/app/errors');
    ensureDir('/app/patterns');

    const appFiles = [
      'app/__init__.py',
      'app/layout.py',
      'app/routes.py',
      'app/main.py',
      'app/page.py',
      'app/not_found.py',
      'app/components/__init__.py',
      'app/components/hello.py',
      'app/components/counter.py',
      'app/components/theme_label.py',
      'app/components/nav.py',
      'app/components/card.py',
      'app/components/names_list.py',
      'app/components/timer.py',
      'app/contexts/__init__.py',
      'app/contexts/theme.py',
      'app/about/__init__.py',
      'app/about/page.py',
      'app/about/team/__init__.py',
      'app/about/team/page.py',
      'app/docs/__init__.py',
      'app/docs/page.py',
      'app/fetch/__init__.py',
      'app/fetch/page.py',
      'app/forms/__init__.py',
      'app/forms/page.py',
      'app/errors/__init__.py',
      'app/errors/page.py',
      'app/patterns/__init__.py',
      'app/patterns/page.py',
    ];
    const cacheBust = Date.now();
    window.__wyb_cache_bust = cacheBust;
    for (const f of appFiles) {
      const resp = await fetch(`./${f}?v=${cacheBust}`);
      if (!resp.ok) {
        showErrorOverlay('Failed to load demo app file', `${f} — ${resp.status} ${resp.statusText}`);
        throw new Error(`Failed to fetch ${f}`);
      }
      const txt = await resp.text();
      pyodide.FS.writeFile(`/${f}`, new TextEncoder().encode(txt));
    }
    await pyodide.runPythonAsync('import sys; sys.path.insert(0, "/")');

    // Expose base path for auxiliary UI (e.g. View Source toggle)
    window.WYBTHON_BASE_PATH = computeBasePath();

    // Add a minimal "View source" toggle to the topbar
    try {
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        const btn = document.createElement('a');
        btn.href = '#';
        btn.textContent = 'View source';
        btn.style.marginLeft = '8px';
        btn.onclick = async (e) => {
          e.preventDefault();
          try {
            const path = String(window.location.pathname || '/');
            const base = window.WYBTHON_BASE_PATH || '/';
            const rel = base === '/' ? path : path.replace(new RegExp('^' + base.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')), '') || '/';
            const candidates = [];
            const route = rel.endsWith('/') && rel.length > 1 ? rel.slice(0, -1) : rel;
            if (route === '/' || route === '') candidates.push('app/page.py');
            if (route === '/about') candidates.push('app/about/page.py');
            if (route === '/about/team') candidates.push('app/about/team/page.py');
            if (route === '/forms') candidates.push('app/forms/page.py');
            if (route === '/errors') candidates.push('app/errors/page.py');
            if (route === '/patterns') candidates.push('app/patterns/page.py');
            if (route === '/fetch') candidates.push('app/fetch/page.py');
            if (route.startsWith('/docs')) candidates.push('app/docs/page.py');
            // Always include some general files as fallbacks
            candidates.push('app/routes.py', 'app/layout.py', 'app/main.py');
            let content = '';
            for (const f of candidates) {
              try {
                const resp = await fetch(`./${f}?v=${window.__wyb_cache_bust || Date.now()}`);
                if (resp.ok) {
                  const txt = await resp.text();
                  content = `# ${f}\n\n` + txt;
                  break;
                }
              } catch {}
            }
            if (!content) content = 'No source found for this section.';
            showErrorOverlay('View source', content);
          } catch (err) {
            showErrorOverlay('View source failed', String(err?.stack || err));
          }
        };
        topbar.appendChild(btn);
      }
    } catch {}

    // Import and run the app entrypoint
    try {
      await pyodide.runPythonAsync('from app.main import main; import asyncio; asyncio.get_event_loop();');
      await pyodide.runPythonAsync('await main()');
    } catch (err) {
      const msg = (err && (err.message || err.stack)) ? `${err.message || ''}\n${err.stack || ''}` : String(err);
      showErrorOverlay('Python Exception', msg);
      throw err;
    }
  } catch (err) {
    console.error('Failed to bootstrap Wybthon demo:', err);
    try {
      const msg = (err && (err.message || err.stack)) ? `${err.message || ''}\n${err.stack || ''}` : String(err);
      showErrorOverlay('Bootstrap Failure', msg);
    } catch {}
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
