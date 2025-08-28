// NOTE: jQuery-like calls disabled. Reimplement in vanilla if needed.
// NOTE: Shopify runtime calls disabled for static build.
const LOCAL_STORAGE_COMPARE_KEY = 'shopify-compare';
const LOCAL_COMPARE_STORAGE_DELIMITER = ',';
const BUTTON_COMPARE_ACTIVE_CLASS = 'active';
const GRID_COMPARE_LOADED_CLASS = 'loaded';

const compareSelectors = {
  button: '[button-compare]',
  grid: '[grid-compare]',
  productCard: '.product-card-compare',
};

document.addEventListener('DOMContentLoaded', () => {
  var text=document.getElementsByClassName("product-recommendations");
  var len=text.length;	
  if(!len)
  initButtonsCompare();
  initGridCompare();
});

document.addEventListener('shopify-compare:updated', (event) => {
// TODO: disabled line (Shopify/jQuery-dependent):   //console.log('[Shopify Compare] Compare Updated ✅', event.detail.compare);
  initGridCompare();
});

document.addEventListener('shopify-compare:init-product-grid', (event) => {
// TODO: disabled line (Shopify/jQuery-dependent):   //console.log('[Shopify Compare] Compare Product List Loaded ✅', event.detail.compare);
});

document.addEventListener('shopify-compare:init-buttons', (event) => {
// TODO: disabled line (Shopify/jQuery-dependent):   //console.log('[Shopify Compare] Compare Buttons Loaded ✅', event.detail.compare);
});

const fetchCompareProductCardHTML = (handle) => {
  const productTileTemplateUrl = `/products/${handle}?view=card`;
  return fetch(productTileTemplateUrl)
  .then((res) => res.text())
  .then((res) => {
    const text = res;
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(text, 'text/html');
    const productCard = htmlDocument.documentElement.querySelector(compareSelectors.productCard);
    return productCard.outerHTML;
  })
// TODO: disabled line (Shopify/jQuery-dependent):   .catch((err) => console.error(`[Shopify Compare] Failed to load content for handle: ${handle}`, err));
};

const setupGridCompare = async (grid) => {
  const compare = getCompare();
  const requests = compare.map(fetchCompareProductCardHTML);
  const responses = await Promise.all(requests);
  const compareProductCards = responses.join('');
  grid.innerHTML = compareProductCards;
  grid.classList.add(GRID_COMPARE_LOADED_CLASS);
  initButtonsCompare();

  const event = new CustomEvent('shopify-compare:init-product-grid', {
    detail: { compare: compare }
  });
  document.dispatchEvent(event);
};

const setupCompareButtons = (buttons) => {
  buttons.forEach((button) => {
    const productHandle = button.dataset.productHandle || false;
// TODO: disabled line (Shopify/jQuery-dependent):     if (!productHandle) return console.error('[Shopify Compare] Missing `data-product-handle` attribute. Failed to update the compare.');
    if (compareContains(productHandle)) button.classList.add(BUTTON_COMPARE_ACTIVE_CLASS);
    button.addEventListener('click', () => {
      updateCompare(productHandle);
      button.classList.toggle(BUTTON_COMPARE_ACTIVE_CLASS);
    });
  });
};

const initGridCompare = () => {
  const grid = document.querySelector(compareSelectors.grid) || false;
  if (grid) setupGridCompare(grid);
};

const initButtonsCompare = () => {
  const buttons = document.querySelectorAll(compareSelectors.button) || [];
  if (buttons.length) setupCompareButtons(buttons);
  else return;
  const event = new CustomEvent('shopify-compare:init-buttons', {
    detail: { compare: getCompare() }
  });
  document.dispatchEvent(event);
};

const getCompare = () => {
  const compare = localStorage.getItem(LOCAL_STORAGE_COMPARE_KEY) || false;
  if (compare) return compare.split(LOCAL_COMPARE_STORAGE_DELIMITER);
  return [];
};

const setCompare = (array) => {
  const compare = array.join(LOCAL_COMPARE_STORAGE_DELIMITER);
  if (array.length) localStorage.setItem(LOCAL_STORAGE_COMPARE_KEY, compare);
  else localStorage.removeItem(LOCAL_STORAGE_COMPARE_KEY);

  const event = new CustomEvent('shopify-compare:updated', {
    detail: { compare: array }
  });
  updateCompareCount();    
  document.dispatchEvent(event);

  return compare;
};

const updateCompare = (handle) => {
  const compare = getCompare();
  const indexInCompare = compare.indexOf(handle);
  if (indexInCompare === -1) compare.push(handle);
  else compare.splice(indexInCompare, 1);
  return setCompare(compare);
};

const compareContains = (handle) => {
  const compare = getCompare();
  return compare.includes(handle);
};

const resetCompare = () => {
  return setCompare([]);
};

const updateCompareCount = () => {
    const compare = getCompare();       
// TODO: disabled line (Shopify/jQuery-dependent):     $('[data-js-compare-count]').attr('data-js-compare-count', compare.length).html(compare.length);
    if (compare.length==0){
// TODO: disabled line (Shopify/jQuery-dependent):       $(".comp-info").css("display", "block");
    }
    else{
// TODO: disabled line (Shopify/jQuery-dependent):       $(".comp-info").css("display", "none");
    }     
};

// TODO: disabled line (Shopify/jQuery-dependent): $(document).ready(function() {
  updateCompareCount();
})
