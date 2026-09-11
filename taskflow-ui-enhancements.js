(()=>{
  if(window.__TASKFLOW_UI_ENHANCEMENTS__)return;window.__TASKFLOW_UI_ENHANCEMENTS__=true;
  const css=`
  :root{--tf-day-bg:#f4f6f9;--tf-day-panel:#fff;--tf-day-text:#18202b;--tf-day-muted:#667085;--tf-day-line:#d9dee8;--tf-day-input:#f8fafc}
  html.tf-day body{background:var(--tf-day-bg)!important;color:var(--tf-day-text)!important}
  html.tf-day .sidebar{background:#fff!important;border-color:var(--tf-day-line)!important}
  html.tf-day .main,html.tf-day .card,html.tf-day .modal,html.tf-day .modal-moment,html.tf-day .tfai-box,html.tf-day #tfai-page{color:var(--tf-day-text)}
  html.tf-day .card,html.tf-day .tfai-box,html.tf-day #tfai-page{background:var(--tf-day-panel)!important;border-color:var(--tf-day-line)!important}
  html.tf-day .taskrow,html.tf-day .column,html.tf-day .boardcard,html.tf-day .day,html.tf-day .memberstats div,html.tf-day .table th,html.tf-day .input,html.tf-day .select,html.tf-day .textarea{background:var(--tf-day-input)!important;color:var(--tf-day-text)!important;border-color:var(--tf-day-line)!important}
  html.tf-day .nav button{color:#667085}
  .tf-theme-btn{width:40px;height:40px;border:1px solid var(--line);background:var(--panel);color:var(--cream);border-radius:10px;display:grid;place-items:center;font-size:20px;cursor:pointer}
  .sidebar{overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none}.sidebar::-webkit-scrollbar{display:none}
  .sidebar .tree-3d-box{flex:0 0 auto;min-height:160px}
  #tfai-page{right:260px!important;left:0!important;top:0!important;bottom:0!important;inset:auto!important;padding:24px!important;z-index:9996!important}
  #tfai-page.show{display:block!important}
  /* الأوامر السريعة: نصوص صغيرة متجاورة، بدون أزرار ثابتة بالأسفل */
  #tfai-page .tfai-quick{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:6px!important}
  #tfai-page .tfai-command{display:inline-flex!important;width:auto!important;flex:0 0 auto!important;align-items:center!important;gap:1px!important}
  #tfai-page .tfai-chip{width:auto!important;max-width:260px!important;flex:0 0 auto!important;padding:5px 8px!important;font-size:12px!important;border-radius:7px!important}
  #tfai-page .tfai-tools{display:inline-flex!important;gap:0!important;width:auto!important}
  #tfai-page .tfai-tool{width:20px!important;height:20px!important;padding:0!important;border:0!important;background:transparent!important;font-size:10px!important;border-radius:4px!important}
  #tfai-page .tfai-tool:hover{background:rgba(99,91,255,.12)!important}
  #tfai-page .tfai-custom{display:none!important}
  #tfai-page .tfai-quick-add{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;background:transparent;color:var(--muted);font-size:19px;line-height:1;border-radius:6px;cursor:pointer;vertical-align:middle}
  #tfai-page .tfai-quick-add:hover{background:rgba(99,91,255,.12);color:var(--cream)}
  #tfai-page .tfai-add-pop{display:none;margin-top:8px;gap:6px;align-items:center}
  #tfai-page .tfai-add-pop.show{display:flex}
  #tfai-page .tfai-add-pop input{flex:1;min-width:0;background:var(--input-bg,#111319);color:var(--cream);border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:12px}
  #tfai-page .tfai-add-pop button{border:0;background:#635bff;color:#fff;border-radius:8px;padding:7px 10px;font-size:12px;cursor:pointer}
  @media(max-width:700px){#tfai-page{right:0!important;padding:10px!important}.tfai-chip{max-width:220px!important}}
  `;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const root=document.documentElement;
  function setTheme(mode){root.classList.toggle('tf-day',mode==='day');localStorage.setItem('taskflow_theme',mode);const b=document.getElementById('tf-theme-toggle');if(b){b.textContent=mode==='day'?'☀️':'🌙';b.title=mode==='day'?'التحويل إلى الوضع الليلي':'التحويل إلى الوضع النهاري'}}
  const saved=localStorage.getItem('taskflow_theme')||'night';setTheme(saved);
  function cleanBrand(){const brand=document.querySelector('.sidebar .brand');if(!brand)return;const main=brand.querySelector('b');if(main)main.textContent='قسم المتاجر';const small=brand.querySelector('small');if(small)small.remove();document.title='قسم المتاجر — نظام إدارة المهام والمراقبة اليومية'}
  function addThemeButton(){if(document.getElementById('tf-theme-toggle'))return;const b=document.createElement('button');b.id='tf-theme-toggle';b.className='tf-theme-btn';b.onclick=()=>setTheme(root.classList.contains('tf-day')?'night':'day');b.setAttribute('aria-label','تبديل الوضع الليلي والنهاري');const actions=document.querySelector('.actions');if(actions)actions.prepend(b)}
  function addQuickPlus(){
    const page=document.getElementById('tfai-page');if(!page)return;
    const quick=page.querySelector('#tfai-quick');if(!quick)return;
    let plus=quick.querySelector('.tfai-quick-add');
    if(!plus){
      plus=document.createElement('button');plus.className='tfai-quick-add';plus.type='button';plus.textContent='+';plus.title='إضافة أمر سريع';
      plus.onclick=()=>{const pop=page.querySelector('.tfai-add-pop');if(pop)pop.classList.toggle('show');};
    }
    if(plus.parentElement!==quick)quick.appendChild(plus);
    let pop=page.querySelector('.tfai-add-pop');
    if(!pop){
      pop=document.createElement('div');pop.className='tfai-add-pop';
      pop.innerHTML='<input maxlength="120" placeholder="اكتب الأمر السريع..."><button type="button">إضافة</button>';
      const input=pop.querySelector('input'),btn=pop.querySelector('button');
      const add=()=>{
        const value=input.value.trim();if(!value)return;
        const original=page.querySelector('#tfai-add');
        const source=page.querySelector('#tfai-custom-input');
        if(source)source.value=value;
        if(original)original.click();
        input.value='';pop.classList.remove('show');
      };
      btn.onclick=add;input.addEventListener('keydown',e=>{if(e.key==='Enter')add();});
      const card=quick.parentElement;
      card?.appendChild(pop);
    }
  }
  function init(){cleanBrand();addThemeButton();addQuickPlus()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,300);setTimeout(init,1000);setTimeout(init,2500);
  const observer=new MutationObserver(()=>addQuickPlus());observer.observe(document.documentElement,{childList:true,subtree:true});
})();