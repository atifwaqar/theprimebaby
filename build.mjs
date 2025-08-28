// Build-time static exporter using LiquidJS (no Shopify backend).
import { Liquid } from "liquidjs";
import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { glob } from "glob";

// Minimal SVG fallbacks if a theme is missing certain icon snippets.
const STUB_SNIPPETS = {
  "templates/snippets/icon-pause.liquid": `
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <rect x="5" y="4" width="3" height="12"></rect>
      <rect x="12" y="4" width="3" height="12"></rect>
    </svg>`,
  "templates/snippets/icon-play.liquid": `
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <polygon points="6,4 16,10 6,16"></polygon>
    </svg>`
};

const THEME_DIR = path.resolve("theme");
const OUT_DIR = path.resolve("dist");
const DATA_DIR = path.resolve("data");

await fs.rm(OUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUT_DIR, { recursive: true });

async function copyAssets(){
  const src = path.join(THEME_DIR, "assets");
  const dst = path.join(OUT_DIR, "assets");
  if (!fssync.existsSync(src)) return;
  await fs.mkdir(dst, { recursive: true });
  const files = glob.sync("**/*", { cwd: src, nodir: true });
  for (const rel of files){
    const from = path.join(src, rel);
    const to = path.join(dst, rel);
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
  console.log(`✓ Copied ${files.length} assets`);
}

function preprocessLiquid(src){
  return src
    .replace(/{%[-\s]*style[-\s]*%}/g,"<style>").replace(/{%[-\s]*endstyle[-\s]*%}/g,"</style>")
    .replace(/{%[-\s]*javascript[-\s]*%}/g,"<script>").replace(/{%[-\s]*endjavascript[-\s]*%}/g,"</script>")
    .replace(/{%[-\s]*form\b[^%]*%}/g,'<form data-shopify-form="stub">').replace(/{%[-\s]*endform[-\s]*%}/g,"</form>")
    .replace(/{%[-\s]*schema[-\s]*%}[\s\S]*?{%[-\s]*endschema[-\s]*%}/g,"");
}

async function readThemeFile(rel){
  const p = path.join(THEME_DIR, rel);
  const s = await fs.readFile(p, "utf8");
  return preprocessLiquid(s);
}

const engine = new Liquid({
  extname: ".liquid",
  dynamicPartials: true,
  relativeReference: false,
  fs: {
    exists: async (filepath) => {
      try { await fs.access(path.join(THEME_DIR, filepath)); return true; } catch { return false; }
    },
    readFile: async (filepath) => {
      const rel = (filepath.startsWith("sections/")||filepath.startsWith("snippets/")||filepath.startsWith("layout/"))
        ? path.join("templates", filepath)
        : filepath;
      return readThemeFile(rel);
    },
    resolve: (root,file,ext)=>{
      const name = file.endsWith(ext)?file:file+ext;
      return name.includes("/")?name:`snippets/${name}`;
    }
  }
});

engine.registerFilter("asset_url", (f="")=>`assets/${String(f).replace(/^['"]|['"]$/g,"")}`);
engine.registerFilter("stylesheet_tag", (h="")=>`<link rel="stylesheet" href="${h}">`);
engine.registerFilter("script_tag", (s="")=>`<script src="${s}"></script>`);
const img=(s="")=>(/^https?:\/\//i.test(s)?s:(s.startsWith("assets/")?s:`assets/${s}`));
engine.registerFilter("image_url",img);engine.registerFilter("img_url",img);
const money=(c,fmt="${{amount}}")=>{const v=(Number(c)||0)/100;return fmt.replace("{{amount}}",v.toFixed(2)).replace("{{ amount }}",v.toFixed(2));};
engine.registerFilter("money",c=>money(c));

let locale={};try{locale=JSON.parse(await fs.readFile(path.join(THEME_DIR,"locales/en.default.json"),"utf8"));}catch{}
engine.registerFilter("t",(k="")=>locale[String(k)]||String(k));

const settings=JSON.parse(await fs.readFile(path.join(DATA_DIR,"settings.json"),"utf8"));
const products=JSON.parse(await fs.readFile(path.join(DATA_DIR,"products.json"),"utf8"));
const collections=JSON.parse(await fs.readFile(path.join(DATA_DIR,"collections.json"),"utf8"));

function adaptProduct(p){const price=Number(p.price??0);const cap=Number(p.compare_at_price??0);
const v={id:p.variants?.[0]?.id||`${p.handle}-v1`,title:p.variants?.[0]?.title||"Default",price,compare_at_price:cap};
return{handle:p.handle,title:p.title,url:`/products/${p.handle}`,featured_image:p.featured_image||p.image||"",price,compare_at_price:cap,variants:p.variants||[v],selected_or_first_available_variant:v,available:true,images:p.images||[p.featured_image||p.image].filter(Boolean),media:[],vendor:p.vendor||"",tags:p.tags||[]};}
const all_products=Object.fromEntries(products.map(p=>[p.handle,adaptProduct(p)]));

function normalizeBlocks(blocks){if(!blocks)return[];if(Array.isArray(blocks))return blocks.map(b=>({id:b.id||b.type,type:b.type,settings:b.settings||{}}));
return Object.entries(blocks).map(([id,b])=>({id,type:b?.type,settings:(b&&b.settings)||{}}));}

async function wrapWithLayout(content){
  try{
    const layout=await readThemeFile("templates/layout/theme.liquid");
    return await engine.parseAndRender(layout,{content_for_layout:content,shop:{name:settings.shop_name,description:settings.shop_description,money_format:settings.money_format},settings});
  }catch{return content;}
}

async function buildIndex(){
  try{
    const raw=await readThemeFile("templates/index.liquid");
    const html=await engine.parseAndRender(raw,{shop:{name:settings.shop_name,description:settings.shop_description,money_format:settings.money_format},settings,all_products,routes:{},cart:{}});
    return await wrapWithLayout(html);
  }catch{}
  const tpl=JSON.parse(await fs.readFile(path.join(THEME_DIR,"templates/index.json"),"utf8"));
  const order=tpl.order||tpl.sections_order||Object.keys(tpl.sections||{});
  let body="";
  for(const id of order){const sec=tpl.sections?.[id];if(!sec?.type||sec.disabled===true)continue;
    const raw=await readThemeFile(`templates/sections/${sec.type}.liquid`);
    const shtml=await engine.parseAndRender(raw,{shop:{name:settings.shop_name,description:settings.shop_description,money_format:settings.money_format},settings,all_products,routes:{},cart:{},section:{id,type:sec.type,settings:sec.settings||{},blocks:normalizeBlocks(sec.blocks)}});
    body+=shtml+"\n";}
  return await wrapWithLayout(body);
}

async function writeHTML(name,html){const out=path.join(OUT_DIR,name);await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,html,"utf8");console.log("✓ wrote",name);}

await copyAssets();
const home=await buildIndex();
await writeHTML("index.html",home);
console.log("Done. Open dist/index.html or deploy /dist to GitHub Pages.");
