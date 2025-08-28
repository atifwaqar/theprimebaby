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
      // Use a custom 'fs' adapter via 'templates' folder
      fs: {
        exists: async (filepath) => {
          try { await fetch(`templates/${filepath}`); return true; } catch { return false; }
        },
        readFile: async (filepath) => {
          const text = await fetchText(`templates/${filepath}`);
          return text;
        },
        resolve: (root, file, ext) => {
          // Ensure extension
          const name = file.endsWith(ext) ? file : file + ext;
          // Resolve 'snippets/<file>' by default when using 'render' without path
          if (!name.includes("/")) return `snippets/${name}`;
          return name;
        }
      }
    });

    // Load and render the main template (index)
    const template = await fetchText("templates/index.liquid");
    const html = await engine.parseAndRender(template, context);
    mount.innerHTML = html;
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<pre style="white-space:pre-wrap;color:#b00020;background:#fee;padding:12px;border-radius:8px;">${err}</pre>`;
  }
})();
