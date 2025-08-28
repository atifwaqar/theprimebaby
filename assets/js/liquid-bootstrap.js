// Browser runtime to render a Shopify theme on static hosting using LiquidJS.
// Adds layout wrapping, product adapter, collections loader, and Shopify-like filters/tags shims.

async function fetchText(path) { const r=await fetch(path,{cache:"no-store"}); if(!r.ok) throw new Error(`Failed ${path}: ${r.status}`); return r.text(); }
async function fetchJSON(path) { const r=await fetch(path,{cache:"no-store"}); if(!r.ok) throw new Error(`Failed ${path}: ${r.status}`); return r.json(); }

function getLiquidCtor(){ if(window.liquidjs && typeof window.liquidjs.Liquid==="function") return window.liquidjs.Liquid; if(typeof window.Liquid==="function") return window.Liquid; throw new Error("LiquidJS not found. Ensure assets/js/liquid.browser.min.js is the real browser bundle."); }

function preprocessLiquid(src){
  return src
    .replace(/{%[-\s]*style[-\s]*%}/g,"<style>")
    .replace(/{%[-\s]*endstyle[-\s]*%}/g,"</style>")
    .replace(/{%[-\s]*javascript[-\s]*%}/g,"<script>")
    .replace(/{%[-\s]*endjavascript[-\s]*%}/g,"</script>")
    .replace(/{%[-\s]*form\b[^%]*%}/g,'<form data-shopify-form=\"stub\">')
    .replace(/{%[-\s]*endform[-\s]*%}/g,"</form>")
    .replace(/{%[-\s]*schema[-\s]*%}[\s\S]*?{%[-\s]*endschema[-\s]*%}/g,"");
}

function normalizeBlocks(blocks){
  if(!blocks) return [];
  if(Array.isArray(blocks)) return blocks.map(b=>({id:b.id||b.type,type:b.type,settings:b.settings||{}}));
  return Object.entries(blocks).map(([id,b])=>({id,type:b?.type,settings:(b && b.settings)||{}}));
}

// --- Adapt simple products into Shopify-like shape
function adaptProduct(p){
  const price = Number(p.price ?? 0);
  const compare_at_price = Number(p.compare_at_price ?? 0);
  const variant = {
    id: (p.variants && p.variants[0] && p.variants[0].id) || `${p.handle}-v1`,
    title: (p.variants && p.variants[0] && p.variants[0].title) || "Default",
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
    available: true,
    images: p.images || [p.featured_image || p.image].filter(Boolean),
    media: [],
    vendor: p.vendor || "",
    tags: p.tags || []
  };
}

async function renderHome(engine, context){
  // try classic index.liquid first
  try{
    const raw = await fetchText("templates/index.liquid");
    const html = await engine.parseAndRender(preprocessLiquid(raw), context);
    return await wrapWithLayout(engine, context, html);
  }catch{}

  // stitch from index.json
  const tpl = await fetchJSON("templates/index.json");
  const order = tpl.order || tpl.sections_order || tpl.ordering || Object.keys(tpl.sections||{});
  let body = "";
  for(const id of order){
    const sec = tpl.sections?.[id];
    if(!sec || !sec.type || sec.disabled===true) continue;
    const raw = await fetchText(`templates/sections/${sec.type}.liquid`).catch(()=> "");
    if(!raw) continue;
    const sectionCtx = { ...context, section: { id, type: sec.type, settings: sec.settings||{}, blocks: normalizeBlocks(sec.blocks) } };
    body += await engine.parseAndRender(preprocessLiquid(raw), sectionCtx) + "\n";
  }
  return await wrapWithLayout(engine, context, body);
}

async function wrapWithLayout(engine, context, content){
  try{
    const layoutRaw = await fetchText("templates/layout/theme.liquid");
    const layout = preprocessLiquid(layoutRaw);
    return await engine.parseAndRender(layout, { ...context, content_for_layout: content });
  }catch{
    return content; // fallback
  }
}

function formatMoney(cents, moneyFormat, currency=""){
  const amount = (Number(cents)||0)/100;
  const base = (moneyFormat||"${{amount}}").replace("{{amount}}", amount.toFixed(2)).replace("{{ amount }}", amount.toFixed(2));
  return currency ? `${base} ${currency}` : base;
}

(async function run(){
  const mount = document.getElementById("app");
  try{
    const [settings, products, collections] = await Promise.all([
      fetchJSON("data/settings.json"),
      fetchJSON("data/products.json"),
      fetchJSON("data/collections.json").catch(()=>({}))
    ]);

    // Load locale for translations
    let locale = {};
    try{ locale = await fetchJSON("locales/en.default.json"); }
    catch{ try{ locale = await fetchJSON("data/locales/en.json"); } catch{} }

    const adapted = Object.fromEntries(products.map(p => [p.handle, adaptProduct(p)]));

    const Liquid = getLiquidCtor();
    const engine = new Liquid({
      extname: ".liquid",
      dynamicPartials: true,
      relativeReference: false,
      fs: {
        exists: async (filepath) => {
          try{ const r = await fetch(`templates/${filepath}`, {method:"HEAD", cache:"no-store"}); return r.ok; } catch{ return false; }
        },
        readFile: async (filepath) => preprocessLiquid(await fetchText(`templates/${filepath}`)),
        resolve: (root, file, ext) => {
          const name = file.endsWith(ext) ? file : file + ext;
          return name.includes("/") ? name : `snippets/${name}`;
        }
      }
    });

    // --- filter shims
    engine.registerFilter("asset_url", (filename="") => `assets/${String(filename).replace(/^['\"]|['\"]$/g,"")}`);
    engine.registerFilter("stylesheet_tag", (href="") => `<link rel="stylesheet" href="${href}">`);
    engine.registerFilter("script_tag", (src="") => `<script src="${src}"></script>`);
    function imgUrl(src=""){ src=String(src); if(/^https?:\/\//i.test(src)) return src; if(src.startsWith("assets/")) return src; return `assets/${src}`; }
    engine.registerFilter("image_url", (src)=>imgUrl(src));
    engine.registerFilter("img_url", (src)=>imgUrl(src));
    engine.registerFilter("money", (cents)=>formatMoney(cents, settings.money_format));
    engine.registerFilter("money_with_currency", (cents, cur)=>formatMoney(cents, settings.money_format, cur));
    engine.registerFilter("t", (key="") => (locale[String(key)] || String(key)));

    const context = {
      shop: { name: settings.shop_name, description: settings.shop_description, money_format: settings.money_format },
      routes: { cart_url: "/cart", all_products_collection_url: "/collections/all" },
      settings,
      locale,
      cart: { item_count: 0, total_price: 0 },
      all_products: adapted,
      collections // optional helper for your sections if they reference settings.collections
    };

    const html = await renderHome(engine, context);
    mount.innerHTML = html;

  }catch(err){
    console.error(err);
    mount.innerHTML = `<pre style="white-space:pre-wrap;color:#b00020;background:#fee;padding:12px;border-radius:8px;">${err}</pre>`;
  }
})();