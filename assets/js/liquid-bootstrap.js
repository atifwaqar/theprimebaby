// Minimal browser runtime to render Shopify-like Liquid on static hosting (GitHub Pages) using LiquidJS.
// - Loads Dawn/Shopstic JSON templates and stitches sections
// - Normalizes section blocks (array or object map)
// - Preprocesses Shopify-only block tags: {% style %}, {% javascript %}, {% schema %}
// - Resolves {% render %}/{% include %} from /templates/snippets

// -------- fetch helpers -----------------------------------------------------
async function fetchText(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`Failed ${path}: ${r.status}`);
  return r.text();
}
async function fetchJSON(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`Failed ${path}: ${r.status}`);
  return r.json();
}

// -------- LiquidJS ctor resolver -------------------------------------------
function getLiquidCtor() {
  if (window.liquidjs && typeof window.liquidjs.Liquid === "function") return window.liquidjs.Liquid;
  if (typeof window.Liquid === "function") return window.Liquid;
  throw new Error("LiquidJS not found. Ensure assets/js/liquid.browser.min.js is the real browser bundle.");
}

// -------- Shopify-to-HTML preprocessor -------------------------------------
// Converts Shopify-only block tags to plain HTML, strips editor schema.
// Handles whitespace-trim variants ({%- tag -%}).
function preprocessLiquid(source) {
  return source
    .replace(/{%[-\s]*style[-\s]*%}/g, "<style>")
    .replace(/{%[-\s]*endstyle[-\s]*%}/g, "</style>")
    .replace(/{%[-\s]*javascript[-\s]*%}/g, "<script>")
    .replace(/{%[-\s]*endjavascript[-\s]*%}/g, "</script>")
    .replace(/{%[-\s]*schema[-\s]*%}[\s\S]*?{%[-\s]*endschema[-\s]*%}/g, "");
}

// -------- blocks normalizer -------------------------------------------------
function normalizeBlocks(blocks) {
  if (!blocks) return [];
  if (Array.isArray(blocks)) {
    return blocks.map(b => ({ id: b.id || b.type, type: b.type, settings: b.settings || {} }));
  }
  // Object map: { "<id>": { type, settings } }
  return Object.entries(blocks).map(([id, b]) => ({
    id,
    type: b?.type,
    settings: (b && b.settings) || {}
  }));
}

// -------- page composer (index.liquid OR index.json) ------------------------
async function renderHome(engine, context) {
  // Prefer a classic Liquid index if present
  try {
    const raw = await fetchText("templates/index.liquid");
    const tpl = preprocessLiquid(raw);
    return await engine.parseAndRender(tpl, context);
  } catch {
    // continue to JSON template
  }

  // Dawn/Shopstic JSON template
  const tpl = await fetchJSON("templates/index.json");
  const order = tpl.order || tpl.sections_order || tpl.ordering || Object.keys(tpl.sections || {});
  let html = "";

  for (const sectionId of order) {
    const sec = tpl.sections?.[sectionId];
    if (!sec || !sec.type) continue;
    if (sec.disabled === true) continue;

    // Load and preprocess the section liquid
    const raw = await fetchText(`templates/sections/${sec.type}.liquid`).catch(() => "");
    if (!raw) continue;
    const sectionLiquid = preprocessLiquid(raw);

    // Build section context
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

// -------- main --------------------------------------------------------------
(async function run() {
  const mount = document.getElementById("app");

  try {
    // Your data model (extend as needed)
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
      relativeReference: false, // silence dirname/sep warning
      // Custom FS adapter that fetches from /templates and preprocesses content
      fs: {
        exists: async (filepath) => {
          try {
            const r = await fetch(`templates/${filepath}`, { method: "HEAD", cache: "no-store" });
            return r.ok;
          } catch { return false; }
        },
        readFile: async (filepath) => {
          const raw = await fetchText(`templates/${filepath}`);
          return preprocessLiquid(raw);
        },
        resolve: (root, file, ext) => {
          const name = file.endsWith(ext) ? file : file + ext;
          // If no path given, default to snippets/
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
