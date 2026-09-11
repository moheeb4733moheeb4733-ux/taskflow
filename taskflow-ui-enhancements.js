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
  /* Quick commands: text only, no per-command edit/delete controls */
  #tfai-page .tfai-quick{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important}
  #tfai-page .tfai-command{display:inline-flex!important;width:auto!important;flex:0 0 auto!important;align-items:center!important;gap:0!important;position:relative!important}
  #tfai-page .tfai-chip{width:auto!important;max-width:280px!important;flex:0 0 auto!important;padding:8px 11px!important;font-size:16px!important;line-height:1.45!important;border-radius:9px!important}
  /* Hard-hide both the wrapper and individual tool buttons even if older code recreates them */
  #tfai-page .tfai-tools,#tfai-page .tfai-tool{display:none!important;width:0!important;height:0!important;max-width:0!important;max-height:0!important;overflow:hidden!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;margin:0!important;padding:0!important;border:0!important}
  #tfai-page .tfai-command-toolbar{display:flex!important}
  #tfai-page .tfai-custom{display:none!important}
  #tfai-page .tfai-quick-add{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:26px!important;height:26px!important;padding:0!important;border:0!important;background:transparent!important;color:var(--muted)!important;font-size:22px!important;line-height:1!important;border-radius:6px!important;cursor:pointer!important;vertical-align:middle}
  #tfai-page .tfai-quick-add:hover{background:rgba(99,91,255,.12);color:var(--cream)}
  #tfai-page .tfai-add-pop{display:none;margin-top:8px;gap:6px;align-items:center}
  #tfai-page .tfai-add-pop.show{display:flex}
  #tfai-page .tfai-add-pop input{flex:1;min-width:0;background:var(--input-bg,#111319);color:var(--cream);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:14px}
  #tfai-page .tfai-add-pop button{border:0;background:#635bff;color:#fff;border-radius:8px;padding:8px 11px;font-size:13px;cursor:pointer}
  @media(max-width:700px){#tfai-page{right:0!important;padding:10px!important}#tfai-page .tfai-chip{max-width:100%!important;font-size:16px!important}#tfai-page .tfai-quick{flex-direction:row!important;align-items:center!important}#tfai-page .tfai-command{width:auto!important}}
  `;const st=document.createElement('style');st.id='taskflow-ui-enhancements-style';st.textContent=css;document.head.appendChild(st);
  const root=document.documentElement;
  function setTheme(mode){root.classList.toggle('tf-day',mode==='day');localStorage.setItem('taskflow_theme',mode);const b=document.getElementById('tf-theme-toggle');if(b){b.textContent=mode==='day'?'☀️':'🌙';b.title=mode==='day'?'التحويل إلى الوضع الليلي':'التحويل إلى الوضع النهاري'}}
  const saved=localStorage.getItem('taskflow_theme')||'night';setTheme(saved);
  function cleanBrand(){const brand=document.querySelector('.sidebar .brand');if(!brand)return;const main=brand.querySelector('b');if(main)main.textContent='قسم المتاجر';const small=brand.querySelector('small');if(small)small.remove();document.title='قسم المتاجر — نظام إدارة المهام والمراقبة اليومية'}
  function addThemeButton(){if(document.getElementById('tf-theme-toggle'))return;const b=document.createElement('button');b.id='tf-theme-toggle';b.className='tf-theme-btn';b.onclick=()=>setTheme(root.classList.contains('tf-day')?'night':'day');b.setAttribute('aria-label','تبديل الوضع الليلي والنهاري');const actions=document.querySelector('.actions');if(actions)actions.prepend(b)}
  function addQuickPlus(){const page=document.getElementById('tfai-page');if(!page)return;const quick=page.querySelector('#tfai-quick');if(!quick)return;let plus=quick.querySelector('.tfai-quick-add');if(!plus){plus=document.createElement('button');plus.className='tfai-quick-add';plus.type='button';plus.textContent='+';plus.title='إضافة أمر سريع';plus.onclick=()=>{const pop=page.querySelector('.tfai-add-pop');if(pop)pop.classList.toggle('show')};quick.appendChild(plus)}else if(plus.parentElement!==quick)quick.appendChild(plus);let pop=page.querySelector('.tfai-add-pop');if(!pop){pop=document.createElement('div');pop.className='tfai-add-pop';pop.innerHTML='<input maxlength="120" placeholder="اكتب الأمر السريع..."><button type="button">إضافة</button>';const input=pop.querySelector('input'),btn=pop.querySelector('button');const add=()=>{const value=input.value.trim();if(!value)return;const original=page.querySelector('#tfai-add'),source=page.querySelector('#tfai-custom-input');if(source)source.value=value;if(original)original.click();input.value='';pop.classList.remove('show')};btn.onclick=add;input.addEventListener('keydown',e=>{if(e.key==='Enter')add()});quick.parentElement?.appendChild(pop)}}
  function hardClean(){document.querySelectorAll('#tfai-page .tfai-tools,#tfai-page .tfai-tool').forEach(el=>el.remove());addQuickPlus()}
  function init(){cleanBrand();addThemeButton();addQuickPlus();hardClean()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();[100,300,700,1500,3000,5000].forEach(t=>setTimeout(init,t));
  new MutationObserver(()=>{hardClean()}).observe(document.documentElement,{childList:true,subtree:true});
})();