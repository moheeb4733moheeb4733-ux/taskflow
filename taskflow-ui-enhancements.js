(()=>{
  if(window.__TASKFLOW_UI_ENHANCEMENTS__)return;window.__TASKFLOW_UI_ENHANCEMENTS__=true;
  const css=`
  :root{--tf-day-bg:#f4f6f9;--tf-day-panel:#fff;--tf-day-text:#18202b;--tf-day-muted:#667085;--tf-day-line:#d9dee8;--tf-day-input:#f8fafc}
  html.tf-day body{background:var(--tf-day-bg)!important;color:var(--tf-day-text)!important}
  html.tf-day .sidebar{background:#fff!important;border-color:var(--tf-day-line)!important}
  html.tf-day .main,html.tf-day .card,html.tf-day .modal,html.tf-day .modal-moment,html.tf-day .tfai-box,html.tf-day #tfai-page{color:var(--tf-day-text)}
  html.tf-day .card,html.tf-day .tfai-box,html.tf-day #tfai-page{background:var(--tf-day-panel)!important;border-color:var(--tf-day-line)!important}
  html.tf-day .taskrow,html.tf-day .column,html.tf-day .boardcard,html.tf-day .day,html.tf-day .memberstats div,html.tf-day .table th,html.tf-day .input,html.tf-day .select,html.tf-day .textarea{background:var(--tf-day-input)!important;color:var(--tf-day-text)!important;border-color:var(--tf-day-line)!important}
  html.tf-day .nav button{color:#667085}.tf-theme-btn{width:40px;height:40px;border:1px solid var(--line);background:var(--panel);color:var(--cream);border-radius:10px;display:grid;place-items:center;font-size:20px;cursor:pointer}.tf-theme-btn:hover{transform:translateY(-1px)}
  .tf-side-tools{display:grid;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}
  .tf-side-tool{border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--cream);border-radius:10px;padding:10px 11px;display:flex;align-items:center;gap:9px;font-weight:700;text-align:right;width:100%}.tf-side-tool:hover{background:rgba(99,91,255,.14);border-color:#635bff}.tf-side-tool .ico{width:25px;text-align:center;font-size:17px}
  .tf-excel-status{padding:8px 12px;font-size:11px;color:#10b981;display:none}
  html.tf-day .tf-side-tool{background:#f8fafc;color:#18202b}
  `;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const root=document.documentElement;
  function setTheme(mode){root.classList.toggle('tf-day',mode==='day');localStorage.setItem('taskflow_theme',mode);const b=document.getElementById('tf-theme-toggle');if(b){b.textContent=mode==='day'?'☀️':'🌙';b.title=mode==='day'?'التحويل إلى الوضع الليلي':'التحويل إلى الوضع النهاري'}}
  setTheme(localStorage.getItem('taskflow_theme')||'night');
  function addThemeButton(){if(document.getElementById('tf-theme-toggle'))return;const b=document.createElement('button');b.id='tf-theme-toggle';b.className='tf-theme-btn';b.onclick=()=>setTheme(root.classList.contains('tf-day')?'night':'day');b.setAttribute('aria-label','تبديل الوضع الليلي والنهاري');const actions=document.querySelector('.actions');if(actions)actions.prepend(b)}
  function addTools(){if(document.getElementById('tf-side-tools'))return;const sidebar=document.querySelector('.sidebar');if(!sidebar)return;const box=document.createElement('div');box.id='tf-side-tools';box.className='tf-side-tools';box.innerHTML=`<button class="tf-side-tool" id="tf-side-ai"><span class="ico">✦</span><span>TaskFlow AI</span></button><button class="tf-side-tool" id="tf-side-excel"><span class="ico">📊</span><span>إضافة ملف Excel</span></button><div id="tf-excel-status" class="tf-excel-status"></div><input id="tf-excel-input" type="file" accept=".xlsx,.xls,.csv" hidden>`;const nav=sidebar.querySelector('.nav');if(nav)nav.insertAdjacentElement('afterend',box);else sidebar.appendChild(box);
    document.getElementById('tf-side-ai').onclick=()=>window.TaskFlowAI?.openPage?.()||document.getElementById('tfai-btn')?.click();
    document.getElementById('tf-side-excel').onclick=()=>document.getElementById('tf-excel-input').click();
    document.getElementById('tf-excel-input').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const s=document.getElementById('tf-excel-status');s.style.display='block';s.textContent='✓ '+f.name;window.taskflowExcelFile=f;window.dispatchEvent(new CustomEvent('taskflow-excel-selected',{detail:{file:f}}));};
  }
  function init(){addThemeButton();addTools()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();setTimeout(init,1000);
})();