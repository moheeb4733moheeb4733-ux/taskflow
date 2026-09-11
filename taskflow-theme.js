(()=>{
  if(window.__TASKFLOW_THEME__)return; window.__TASKFLOW_THEME__=true;
  const KEY='taskflow_theme';
  const light={
    '--black':'#f4f7fb','--cream':'#111827','--muted':'#64748b','--panel':'#ffffff','--line':'#dbe2ea','--white':'#111827','--shadow':'0 18px 55px rgba(31,41,55,.10)','--input-bg':'#f8fafc'
  };
  const dark={
    '--black':'#0f1117','--cream':'#f7f4f2','--muted':'#9ca3af','--panel':'#171a23','--line':'#2a2e3d','--white':'#fff','--shadow':'0 18px 55px rgba(0,0,0,.25)','--input-bg':'#111319'
  };
  const style=document.createElement('style');
  style.textContent=`body.tf-light{background:var(--black);color:var(--cream)}body.tf-light .sidebar{background:#fff;border-color:var(--line)}body.tf-light .nav button{color:#64748b}body.tf-light .nav button:hover,body.tf-light .nav button.active{background:#eef2ff;color:#111827}body.tf-light .card,body.tf-light .modal,body.tf-light .column,body.tf-light .boardcard,body.tf-light .taskrow,body.tf-light .day{background:var(--panel);border-color:var(--line);box-shadow:0 8px 25px rgba(31,41,55,.06)}body.tf-light .input,body.tf-light .select,body.tf-light .textarea,body.tf-light .table th,body.tf-light .column,body.tf-light .dropzone,body.tf-light .memberstats div{background:var(--input-bg);color:var(--cream);border-color:var(--line)}body.tf-light .table th{background:#f1f5f9}body.tf-light .btn{background:#fff;color:#111827;border-color:var(--line)}body.tf-light .btn.primary{background:var(--blue);color:#fff;border-color:var(--blue)}body.tf-light #tf-theme-toggle{background:#111827;color:#fff;border-color:#111827}#tf-theme-toggle{display:inline-flex;align-items:center;gap:7px}#tf-theme-toggle .tf-theme-icon{font-size:17px;line-height:1}`;
  document.head.appendChild(style);
  function apply(mode){const isLight=mode==='light';document.documentElement.dataset.theme=mode;document.body.classList.toggle('tf-light',isLight);const vars=isLight?light:dark;Object.entries(vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));localStorage.setItem(KEY,mode);const b=document.getElementById('tf-theme-toggle');if(b){b.innerHTML=`<span class="tf-theme-icon">${isLight?'☀️':'🌙'}</span><span>${isLight?'الوضع النهاري':'الوضع الليلي'}</span>`;b.title=isLight?'التبديل إلى الوضع الليلي':'التبديل إلى الوضع النهاري'}}
  function add(){if(document.getElementById('tf-theme-toggle'))return;const b=document.createElement('button');b.id='tf-theme-toggle';b.className='btn iconbtn';b.onclick=()=>apply(document.documentElement.dataset.theme==='light'?'dark':'light');const actions=document.querySelector('.actions');if(actions)actions.appendChild(b);else document.body.appendChild(b);apply(localStorage.getItem(KEY)||'dark')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();