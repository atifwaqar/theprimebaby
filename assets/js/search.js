
(function(){
  function hookSearch(){
    const inputs = Array.from(document.querySelectorAll('input[type="search"], input[name="s"], input[name="q"]'));
    inputs.forEach(inp => {
      const form = inp.form;
      if(form){
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const q = (inp.value||'').trim();
          if(q) location.href = 'shop.html?q=' + encodeURIComponent(q);
        });
      }
    });
  }
  document.addEventListener('DOMContentLoaded', hookSearch);
  window.SearchAPI = { hookSearch };
})();