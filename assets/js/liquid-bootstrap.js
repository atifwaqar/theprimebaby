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
  // Try common globals for the browser bundle
  if (window.liquidjs && typeof window.liquidjs.Liquid === "function") return window.liquidjs.Liquid;
  if (typeof window.Liquid === "function") return window.Liquid;
  throw new Error("LiquidJS not found. Ensure assets/js/liquid.browser.min.js is the real LiquidJS browser build.");
}

(async function run() {
  const mount = document.getElementById("app");

  try {
    // Load mock data (replace with your real data or map from your theme settings)
    const settings = await fetchJSON("data/settings.json");
    const products = await fetchJSON("data/products.json");

    // Build a Shopify-like context object
    const context = {
      shop: {
        name: settings.shop_name,
        description: settings.shop_description,
        money_format: settings.money_format
      },
      collections: settings.collections,
      routes: {
        cart_url: "/cart",
        all_products_collection_url: "/collections/all"
      },
      cart: {
        item_count: 0,
        total_price: 0
      },
      settings, // expose raw settings as well
      // A very small 'global' for includes/snippets resolution
      _runtime: {
        async readTemplate(name) {
          // Resolve snippets by convention: snippets/<name>.liquid
          // Resolve other templates directly under /templates
          const isSnippet = name.startsWith("snippets/") || !name.includes("/") && !name.endsWith(".liquid");
          if (isSnippet) {
            const file = name.startsWith("snippets/") ? name : `snippets/${name}`;
            return fetchText(`templates/${file}.liquid`);
          }
          return fetchText(`templates/${name}`);
        }
      },
      // Expose products like Shopify would
      all_products: Object.fromEntries(products.map(p => [p.handle, p]))
    };

    // Wire a simple LiquidJS file system resolver (for {% include %} / {% render %})
const LiquidCtor = getLiquidCtor();
const engine = new LiquidCtor({
  extname: ".liquid",
  dynamicPartials: true,
  relativeReference: false, // ← suppress the fs.dirname/fs.sep warning
  fs: {
    exists: async (filepath) => {
      try { const r = await fetch(`templates/${filepath}`, {method:'HEAD'}); return r.ok; } catch { return false; }
    },
    readFile: async (filepath) => fetchText(`templates/${filepath}`),
    resolve: (root, file, ext) => {
      const name = file.endsWith(ext) ? file : file + ext;
      return name.includes("/") ? name : `snippets/${name}`;
    }
  }
});


// Try to render a Liquid page; if not present, render a JSON template by composing sections.
async function renderHome(engine, context) {
  // Prefer a classic Liquid template if supplied
  try {
    const template = await fetchText("templates/index.liquid");
    const html = await engine.parseAndRender(template, context);
    return html;
  } catch {
    // Fall through to JSON template
  }

  // Dawn-style JSON template (Shopstic uses this)
  const tpl = await fetchJSON("templates/index.json");

  // tpl has { sections: {<id>: {type, settings, blocks}}, order: [ids...] } in Dawn-like themes
  const order = tpl.order || tpl.sections_order || tpl.ordering || Object.keys(tpl.sections);
  let html = "";

  for (const sectionId of order) {
    const sec = tpl.sections[sectionId];
    if (!sec) continue;

    // Load the section liquid source: sections/<type>.liquid
    const sectionPath = `sections/${sec.type}.liquid`;
    const sectionLiquid = await fetchText(`templates/${sectionPath}`);

    // Build a Shopify-like `section` object for Liquid templates
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

    // Most section templates iterate over `section.blocks`
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
      relativeReference: false,
      fs: {
        exists: async (filepath) => {
          try { const r = await fetch(`templates/${filepath}`, {method:'HEAD'}); return r.ok; } catch { return false; }
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
