// Minimal browser runtime to render Liquid templates using LiquidJS.
// Expects a global `liquidjs.Liquid` OR `Liquid` constructor (provided by the real browser build).

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

function getLiquidCtor() {
  if (window.liquidjs && typeof window.liquidjs.Liquid === "function") return window.liquidjs.Liquid;
  if (typeof window.Liquid === "function") return window.Liquid;
  throw new Error("LiquidJS not found. Ensure assets/js/liquid.browser.min.js is the real LiquidJS browser build.");
}

// Try to render a Liquid page; if not present, render a JSON template by composing sections.
async function renderHome(engine, context) {
  // Prefer a classic Liquid template if supplied
  try {
    const template = await fetchText("templates/index.liquid");
    return await engine.parseAndRender(template, context);
  } catch {
    // Fall through to JSON template
  }

  // Dawn-style JSON template (Shopstic uses this)
  const tpl = await fetchJSON("templates/index.json");
  const order = tpl.order || tpl.sections_order || tpl.ordering || Object.keys(tpl.sections);
  let html = "";

  for (const sectionId of order) {
    const sec = tpl.sections[sectionId];
    if (!sec) continue;

    const sectionPath = `sections/${sec.type}.liquid`;
    const sectionLiquid = await fetchText(`templates/${sectionPath}`);

    const sectionCtx = {
      ...context,
      section: {
        id: sectionId,
        type: sec.type,
        settings: sec.settings || {},
        blocks: (sec.blocks || []).map(b => ({
          id: b.id || b.type,
          type: b.type,
          settings: b.settings || {}
        }))
      }
    };

    const rendered = await engine.parseAndRender(sectionLiquid, sectionCtx);
    html += rendered + "\n";
  }
  return html;
}

(async function run() {
  const mount = document.getElementById("app");
  try {
    const settings = await fetchJSON("data/settings.json");
    const products = await fetchJSON("data/products.json");

    const context = {
      shop: {
        name: settings.shop_name,
        description: settings.shop_description,
        money_format: settings.money_format
      },
      collections: settings.collections,
      routes: { cart_url: "/cart", all_products_collection_url: "/collections/all" },
      cart: { item_count: 0, total_price: 0 },
      settings,
      all_products: Object.fromEntries(products.map(p => [p.handle, p]))
    };

    const LiquidCtor = getLiquidCtor();
    const engine = new LiquidCtor({
      extname: ".liquid",
      dynamicPartials: true,
      relativeReference: false, // removes fs.dirname/fs.sep warning
      fs: {
        exists: async (filepath) => {
          try {
            const r = await fetch(`templates/${filepath}`, { method: "HEAD" });
            return r.ok;
          } catch {
            return false;
          }
        },
        readFile: async (filepath) => fetchText(`templates/${filepath}`),
        resolve: (root, file, ext) => {
          const name = file.endsWith(ext) ? file : file + ext;
          return name.includes("/") ? name : `snippets/${name}`;
        }
      }
    });

    const html = await renderHome(engine, context);
    mount.innerHTML = html;
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<pre style="white-space:pre-wrap;color:#b00020;background:#fee;padding:12px;border-radius:8px;">${err}</pre>`;
  }
})();
