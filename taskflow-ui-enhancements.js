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
  @media(max-width:700px){#tfai-page{right:0!important;padding:10px!important}}
  `;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const root=document.documentElement;
  function setTheme(mode){root.classList.toggle('tf-day',mode==='day');localStorage.setItem('taskflow_theme',mode);const b=document.getElementById('tf-theme-toggle');if(b){b.textContent=mode==='day'?'☀️':'🌙';b.title=mode==='day'?'التحويل إلى الوضع الليلي':'التحويل إلى الوضع النهاري'}}
  const saved=localStorage.getItem('taskflow_theme')||'night';setTheme(saved);
  function cleanBrand(){const brand=document.querySelector('.sidebar .brand');if(!brand)return;const main=brand.querySelector('b');if(main)main.textContent='قسم المتاجر';const small=brand.querySelector('small');if(small)small.remove();document.title='قسم المتاجر — نظام إدارة المهام والمراقبة اليومية'}
  function addThemeButton(){if(document.getElementById('tf-theme-toggle'))return;const b=document.createElement('button');b.id='tf-theme-toggle';b.className='tf-theme-btn';b.onclick=()=>setTheme(root.classList.contains('tf-day')?'night':'day');b.setAttribute('aria-label','تبديل الوضع الليلي والنهاري');const actions=document.querySelector('.actions');if(actions)actions.prepend(b)}
  function init(){cleanBrand();addThemeButton()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,1000);setTimeout(init,2500);
})();