// Minimal LiquidJS runtime for Shopify themes on static hosting.
async function t(p){const r=await fetch(p,{cache:"no-store"});if(!r.ok)throw new Error(p+': '+r.status);return r.text();}
async function j(p){const r=await fetch(p,{cache:"no-store"});if(!r.ok)throw new Error(p+': '+r.status);return r.json();}

function pre(s){return s
  .replace(/{%[-\s]*style[-\s]*%}/g,"<style>").replace(/{%[-\s]*endstyle[-\s]*%}/g,"</style>")
  .replace(/{%[-\s]*javascript[-\s]*%}/g,"<script>").replace(/{%[-\s]*endjavascript[-\s]*%}/g,"</script>")
  .replace(/{%[-\s]*form\b[^%]*%}/g,'<form data-shopify-form="stub">').replace(/{%[-\s]*endform[-\s]*%}/g,"</form>")
  .replace(/{%[-\s]*schema[-\s]*%}[\s\S]*?{%[-\s]*endschema[-\s]*%}/g,"");}

function normBlocks(b){if(!b)return[];if(Array.isArray(b))return b.map(x=>({id:x.id||x.type,type:x.type,settings:x.settings||{}}));
  return Object.entries(b).map(([id,x])=>({id,type:x?.type,settings:(x&&x.settings)||{}}));}

function adaptProduct(p){const price=Number(p.price??0),cap=Number(p.compare_at_price??0);
  const v={id:(p.variants?.[0]?.id)||`${p.handle}-v1`,title:(p.variants?.[0]?.title)||"Default",price,compare_at_price:cap};
  return{handle:p.handle,title:p.title,url:`/products/${p.handle}`,featured_image:p.featured_image||p.image||"",
    price,compare_at_price:cap,variants:p.variants||[v],selected_or_first_available_variant:v,available:true,
    images:p.images||[p.featured_image||p.image].filter(Boolean),media:[],vendor:p.vendor||"",tags:p.tags||[]};}

(async()=>{
  const Liquid=(window.liquidjs?.Liquid)||window.Liquid;
  const engine=new Liquid({dynamicPartials:true,extname:".liquid"});

  // Key Shopify-like filters
  engine.registerFilter("asset_url",f=>`assets/${String(f).replace(/^['\"]|['\"]$/g,"")}`);
  engine.registerFilter("stylesheet_tag",h=>`<link rel="stylesheet" href="${h}">`);
  engine.registerFilter("script_tag",s=>`<script src="${s}"></script>`);
  const img=s=>/^https?:\/\//i.test(s)?s:(String(s).startsWith("assets/")?s:`assets/${s}`);
  engine.registerFilter("image_url",img); engine.registerFilter("img_url",img);
  const money=(c,fmt="${{amount}}")=>fmt.replace("{{amount}}",((+c||0)/100).toFixed(2)).replace("{{ amount }}",((+c||0)/100).toFixed(2));
  engine.registerFilter("money",c=>money(c));
  let locale={}; try{ locale=await j("locales/en.default.json"); }catch{} 
  engine.registerFilter("t",k=>locale[String(k)]||String(k));

  // Data
  const settings=await j("data/settings.json").catch(()=>({shop_name:"Shop",shop_description:"",money_format:"${{amount}}",collections:{}}));
  const products=await j("data/products.json").catch(()=>([]));
  const all_products=Object.fromEntries(products.map(p=>[p.handle,adaptProduct(p)]));

  // Compose sections from templates/index.json
  const tpl=await j("templates/index.json");
  const order=tpl.order||tpl.sections_order||Object.keys(tpl.sections||{});
  let body="";
  for(const id of order){
    const sec=tpl.sections?.[id]; if(!sec?.type || sec.disabled===true) continue;
    const raw=await t(`templates/sections/${sec.type}.liquid`).catch(()=> ""); if(!raw) continue;
    body+=await engine.parseAndRender(pre(raw),{shop:{name:settings.shop_name,description:settings.shop_description,money_format:settings.money_format},
      settings,all_products,routes:{},cart:{},section:{id,type:sec.type,settings:sec.settings||{},blocks:normBlocks(sec.blocks)}})+"\n";
  }

  // Wrap with layout/theme.liquid (if present)
  let layout=""; try{ layout=pre(await t("templates/layout/theme.liquid")); }catch{}
  const html=layout ? await engine.parseAndRender(layout,{content_for_layout:body,shop:{name:settings.shop_name,description:settings.shop_description,money_format:settings.money_format},settings}) : body;
  document.getElementById("app").innerHTML=html;
})();