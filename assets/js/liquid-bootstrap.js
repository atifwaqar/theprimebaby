// Minimal browser runtime to render Liquid templates using LiquidJS.

async function fetchText(path){ const r=await fetch(path,{cache:"no-store"}); if(!r.ok) throw new Error(`Failed ${path}: ${r.status}`); return r.text(); }
async function fetchJSON(path){ const r=await fetch(path,{cache:"no-store"}); if(!r.ok) throw new Error(`Failed ${path}: ${r.status}`); return r.json(); }

function getLiquidCtor(){
  if (window.liquidjs && typeof window.liquidjs.Liquid === "function") return window.liquidjs.Liquid;
  if (typeof window.Liquid === "function") return window.Liquid;
  throw new Error("LiquidJS not found. Ensure assets/js/liquid.browser.min.js is the real browser bundle.");
}

// turn blocks into an array of {id,type,settings}
function normalizeBlocks(blocks){
  if (!blocks) return [];
  if (Array.isArray(blocks)) {
    // Already an array; ensure id exists
    return blocks.map(b => ({ id: b.id || b.type, type: b.type, settings: b.settings || {} }));
  }
  // Object map: { "<id>": { type, settings } }
  return Object.entries(blocks).map(([id, b]) => ({
    id,
    type: b?.type,
    settings: (b && b.settings) || {}
  }));
}

// Compose a page from templates/index.json (Dawn-style) or fall back to templates/index.liquid
async function renderHome(engine, context){
  // Prefer classic Liquid if present
  try {
    const liquidTpl = await fetchText("templates/index.liquid");
    return await engine.parseAndRender(liquidTpl, context);
  } catch { /* continue to JSON template */ }

  const tpl = await fetchJSON("templates/index.json");
  const order = tpl.order || tpl.sections_order || tpl.ordering || Object.keys(tpl.sections || {});
  let html = "";

  for (const sectionId of order) {
    const sec = tpl.sections?.[sectionId];
    if (!sec || !sec.type) continue;            // guard
    if (sec.disabled === true) continue;        // some themes allow disabled sections

    const sectionLiquid = await fetchText(`templates/sections/${sec.type}.liquid`).catch(() => "");
    if (!sectionLiquid) continue;               // skip if missing

    const sectionCtx = {
      ...context,
      section: {
        id: sectionId,
        type: sec.type,
        settings: sec.settings || {},
        blocks: normalizeBlocks(sec.blocks)
      }
    };

    const rendered = await engine.parseAndRender(sectionLiquid, sectionCtx);
    html += rendered + "\n";
  }
  return html;
}

(async function run(){
  const mount = document.getElementById("app");
  try {
    const settings = await fetchJSON("data/settings.json");
    const products = await fetchJSON("data/products.json");

    const context = {
      shop: { name: settings.shop_name, description: settings.shop_description, money_format: settings.money_format },
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
          try { const r = await fetch(`templates/${filepath}`, { method: "HEAD" }); return r.ok; } catch { return false; }
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
