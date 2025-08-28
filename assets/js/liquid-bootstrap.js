// Browser runtime to render a Shopify theme on static hosting using LiquidJS.
// Features:
// - Preprocess Shopify-only tags: {% style %}, {% javascript %}, {% schema %}, {% form %}
// - Compose Dawn-style templates/index.json from /templates/sections/*.liquid
// - Normalize section.blocks (array or object)
// - Register Shopify-like filters: asset_url, stylesheet_tag, script_tag, image_url/img_url,
//   money, money_with_currency, t (translations)

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

function getLiquidCtor() {
  if (window.liquidjs && typeof window.liquidjs.Liquid === "function") return window.liquidjs.Liquid;
  if (typeof window.Liquid === "function") return window.Liquid;
  throw new Error("LiquidJS not found. Ensure assets/js/liquid.browser.min.js is the real browser bundle.");
}

// ---- Preprocess Shopify-only block tags into plain HTML, strip editor schema
function preprocessLiquid(source) {
  return source
    .replace(/{%[-\s]*style[-\s]*%}/g, "<style>")
    .replace(/{%[-\s]*endstyle[-\s]*%}/g, "</style>")
    .replace(/{%[-\s]*javascript[-\s]*%}/g, "<script>")
    .replace(/{%[-\s]*endjavascript[-\s]*%}/g, "</script>")
    // neutralize {% form %} to a plain <form>
    .replace(/{%[-\s]*form\b[^%]*%}/g, '<form data-shopify-form="stub">')
    .replace(/{%[-\s]*endform[-\s]*%}/g, "</form>")
    // remove editor schema blocks
    .replace(/{%[-\s]*schema[-\s]*%}[\s\S]*?{%[-\s]*endschema[-\s]*%}/g, "");
}

// ---- Normalize blocks into [{id,type,settings}]
function normalizeBlocks(blocks) {
  if (!blocks) return [];
  if (Array.isArray(blocks)) return blocks.map(b => ({ id: b.id || b.type, type: b.type, settings: b.settings || {} }));
  return Object.entries(blocks).map(([id, b]) => ({ id, type: b?.type, settings: (b && b.settings) || {} }));
}

function adaptProduct(p) {
  const price = Number(p.price ?? 0);
  const compare_at_price = Number(p.compare_at_price ?? 0);
  const variant = {
    id: p.variants?.[0]?.id || `${p.handle}-v1`,
    title: p.variants?.[0]?.title || "Default",
    price,
    compare_at_price
  };
  return {
    handle: p.handle,
    title: p.title,
    url: `/products/${p.handle}`,
    featured_image: p.featured_image || p.image || "",
    price,
    compare_at_price,
    variants: p.variants || [variant],
    selected_or_first_available_variant: variant,
    // minimal fields often referenced by snippets
    available: true,
    images: p.images || [p.featured_image || p.image].filter(Boolean),
    media: [],
    vendor: p.vendor || "",
    tags: p.tags || []
  };
}

// ---- Compose a page from index.liquid or index.json
async function renderHome(engine, context) {
  // Try classic index.liquid first
  try {
    const raw = await fetchText("templates/index.liquid");
    return await engine.parseAndRender(preprocessLiquid(raw), context);
  } catch {}

  // Compose from index.json (sections -> HTML)
  const tpl = await fetchJSON("templates/index.json");
  const order = tpl.order || tpl.sections_order || tpl.ordering || Object.keys(tpl.sections || {});
  let bodyHtml = "";

  for (const sectionId of order) {
    const sec = tpl.sections?.[sectionId];
    if (!sec || !sec.type || sec.disabled === true) continue;

    const raw = await fetchText(`templates/sections/${sec.type}.liquid`).catch(() => "");
    if (!raw) continue;

    const sectionCtx = {
      ...context,
      section: {
        id: sectionId,
        type: sec.type,
        settings: sec.settings || {},
        blocks: normalizeBlocks(sec.blocks)
      }
    };
    bodyHtml += await engine.parseAndRender(preprocessLiquid(raw), sectionCtx) + "\n";
  }

  // NEW: wrap with layout/theme.liquid so CSS/JS load
  try {
    const layoutRaw = await fetchText("templates/layout/theme.liquid");
    const layout = preprocessLiquid(layoutRaw);
    // Shopify provides {{ content_for_layout }} → we inject our composed sections
    return await engine.parseAndRender(layout, { ...context, content_for_layout: bodyHtml });
  } catch {
    // fallback to sections-only if layout missing
    return bodyHtml;
  }
}


// ---- Money formatting helper
function formatMoney(cents, moneyFormat, currency = "") {
  const amount = (Number(cents) || 0) / 100;
  const formatted = (moneyFormat || "${{amount}}")
    .replace("{{amount}}", amount.toFixed(2))
    .replace("{{ amount }}", amount.toFixed(2));
  return currency ? `${formatted} ${currency}` : formatted;
}

// ---- Main
(async function run() {
  const mount = document.getElementById("app");

  try {
    // Load site settings, mock catalog, and (optional) translations
    const [settings, products] = await Promise.all([
      fetchJSON("data/settings.json"),
      fetchJSON("data/products.json")
    ]);

    // Try to load a locale file. You can provide either:
    // - /locales/en.default.json  (copied from the theme), or
    // - /data/locales/en.json     (your own)
    let locale = {};
    try { locale = await fetchJSON("locales/en.default.json"); }
    catch { try { locale = await fetchJSON("data/locales/en.json"); } catch {} }

    const context = {
      shop: { name: settings.shop_name, description: settings.shop_description, money_format: settings.money_format },
      collections: settings.collections,
      routes: { cart_url: "/cart", all_products_collection_url: "/collections/all" },
      cart: { item_count: 0, total_price: 0 },
      settings,
      locale, // expose translations
      all_products: Object.fromEntries(products.map(p => [p.handle, adaptProduct(p)]))
    };

    const LiquidCtor = getLiquidCtor();
    const engine = new LiquidCtor({
      extname: ".liquid",
      dynamicPartials: true,
      relativeReference: false,
      fs: {
        exists: async (filepath) => {
          try { const r = await fetch(`templates/${filepath}`, { method: "HEAD", cache: "no-store" }); return r.ok; }
          catch { return false; }
        },
        readFile: async (filepath) => preprocessLiquid(await fetchText(`templates/${filepath}`)),
        resolve: (root, file, ext) => {
          const name = file.endsWith(ext) ? file : file + ext;
          return name.includes("/") ? name : `snippets/${name}`;
        }
      }
    });

    // ---- Register Shopify-like filters (simple shims)
    // NOTE: LiquidJS filter signature is (v, ...args). Keep them simple for static hosting.

    // Prefix an asset filename with /assets/
    engine.registerFilter("asset_url", (filename = "") => {
      filename = String(filename).replace(/^['"]|['"]$/g, "");
      return `assets/${filename}`;
    });

    // Turn a URL into <link rel="stylesheet" href="...">
    engine.registerFilter("stylesheet_tag", (href = "") => {
      href = String(href);
      return `<link rel="stylesheet" href="${href}">`;
    });

    // Turn a URL into <script src="..."></script>
    engine.registerFilter("script_tag", (src = "") => {
      src = String(src);
      return `<script src="${src}"></script>`;
    });

    // Image URL helpers – pass-through or prefix with assets/
    function imgUrl(src = "") {
      src = String(src);
      if (/^https?:\/\//i.test(src)) return src;
      if (src.startsWith("assets/")) return src;
      return `assets/${src}`;
    }
    engine.registerFilter("image_url", (src) => imgUrl(src));
    engine.registerFilter("img_url", (src) => imgUrl(src));

    // Money formatting (very simple)
    engine.registerFilter("money", (cents) => formatMoney(cents, context.shop.money_format));
    engine.registerFilter("money_with_currency", (cents, currency) => formatMoney(cents, context.shop.money_format, currency));

    // Translation filter: {{ 'key' | t }} → lookup in context.locale
    engine.registerFilter("t", (key = "") => {
      const k = String(key);
      return (context.locale && (context.locale[k] || context.locale[k.replace(/\s+/g, "_")])) || k;
    });

    // Render page
    const html = await renderHome(engine, context);
    mount.innerHTML = html;

  } catch (err) {
    console.error(err);
    mount.innerHTML = `<pre style="white-space:pre-wrap;color:#b00020;background:#fee;padding:12px;border-radius:8px;">${err}</pre>`;
  }
})();
