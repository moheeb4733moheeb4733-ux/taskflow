(()=>{
  if(window.__TASKFLOW_THEME_V2__)return;window.__TASKFLOW_THEME_V2__=true;
  const KEY='taskflow_theme';
  const light={'--black':'#f4f7fb','--cream':'#111827','--muted':'#64748b','--panel':'#ffffff','--line':'#dbe2ea','--white':'#111827','--shadow':'0 18px 55px rgba(31,41,55,.10)','--input-bg':'#f8fafc'};
  const dark={'--black':'#0f1117','--cream':'#f7f4f2','--muted':'#9ca3af','--panel':'#171a23','--line':'#2a2e3d','--white':'#fff','--shadow':'0 18px 55px rgba(0,0,0,.25)','--input-bg':'#111319'};
  const style=document.createElement('style');
  style.id='taskflow-theme-v2-style';
  style.textContent=`
    body.tf-light{background:var(--black);color:var(--cream)}
    body.tf-light .sidebar{background:#fff;border-color:var(--line)}
    body.tf-light .nav button{color:#64748b}
    body.tf-light .nav button:hover,body.tf-light .nav button.active{background:#eef2ff;color:#111827}
    body.tf-light .card,body.tf-light .modal,body.tf-light .column,body.tf-light .boardcard,body.tf-light .taskrow,body.tf-light .day{background:var(--panel);border-color:var(--line);box-shadow:0 8px 25px rgba(31,41,55,.06)}
    body.tf-light .input,body.tf-light .select,body.tf-light .textarea,body.tf-light .table th,body.tf-light .column,body.tf-light .dropzone,body.tf-light .memberstats div{background:var(--input-bg);color:var(--cream);border-color:var(--line)}
    body.tf-light .table th{background:#f1f5f9}
    body.tf-light .btn{background:#fff;color:#111827;border-color:var(--line)}
    body.tf-light .btn.primary{background:var(--blue);color:#fff;border-color:var(--blue)}
    #tf-theme-toggle{position:fixed!important;top:14px!important;left:18px!important;z-index:10050!important;width:42px!important;height:42px!important;padding:0!important;border:1px solid var(--line)!important;border-radius:12px!important;background:var(--panel)!important;color:var(--cream)!important;display:grid!important;place-items:center!important;font-size:20px!important;line-height:1!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important;backdrop-filter:blur(10px)!important}
    #tf-theme-toggle:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(0,0,0,.24)!important}
    #tf-theme-toggle:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
    #toast,#tf-global-toast{position:fixed;left:20px;bottom:20px;z-index:10060;min-width:280px;max-width:min(92vw,480px);display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:13px;font-weight:700;box-shadow:0 16px 45px rgba(0,0,0,.32);backdrop-filter:blur(12px);transform:translateY(130px);opacity:0;pointer-events:none;transition:transform .25s ease,opacity .25s ease}
    #toast.show,#tf-global-toast.show{transform:translateY(0);opacity:1}
    #toast.tf-success,#tf-global-toast.tf-success{border:1px solid #10b981;background:#10241e;color:#d1fae5}
    #toast.tf-error,#tf-global-toast.tf-error{border:1px solid #ef4444;background:#2a1518;color:#fee2e2}
    #toast.tf-info,#tf-global-toast.tf-info{border:1px solid #635bff;background:#171a2d;color:#e0e7ff}
    .tf-toast-icon{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;flex:0 0 25px;background:rgba(255,255,255,.1);font-size:15px}
    @media(max-width:700px){#tf-theme-toggle{top:10px!important;left:10px!important;width:40px!important;height:40px!important}#toast,#tf-global-toast{left:10px;right:10px;bottom:12px;min-width:0;max-width:none;justify-content:center;text-align:center}}
  `;
  document.head.appendChild(style);

  function apply(mode){
    const isLight=mode==='light';
    document.documentElement.dataset.theme=mode;
    document.documentElement.classList.toggle('tf-day',isLight);
    document.body.classList.toggle('tf-light',isLight);
    const vars=isLight?light:dark;
    Object.entries(vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
    localStorage.setItem(KEY,mode);
    const b=document.getElementById('tf-theme-toggle');
    if(b){b.innerHTML=isLight?'☀️':'🌙';b.title=isLight?'التحويل إلى الوضع الليلي':'التحويل إلى الوضع النهاري';b.setAttribute('aria-label',b.title);}
  }

  function addThemeButton(){
    let b=document.getElementById('tf-theme-toggle');
    if(!b){
      b=document.createElement('button');b.id='tf-theme-toggle';b.type='button';
      b.onclick=()=>apply(document.documentElement.dataset.theme==='light'?'dark':'light');
      document.body.appendChild(b);
    }
    apply(localStorage.getItem(KEY)||'dark');
  }

  let toastTimer=null;
  function popup(message,type='info'){
    if(message===undefined||message===null)return;
    let el=document.getElementById('tf-global-toast');
    if(!el){el=document.createElement('div');el.id='tf-global-toast';document.body.appendChild(el);}
    clearTimeout(toastTimer);
    const text=String(message).replace(/^Error:\s*/i,'').trim();
    const icon=type==='success'?'✓':type==='error'?'!':'i';
    el.className='show tf-'+type;
    el.innerHTML='<span class="tf-toast-icon">'+icon+'</span><span></span>';
    el.lastElementChild.textContent=text;
    toastTimer=setTimeout(()=>el.classList.remove('show'),3200);
  }
  window.tfPopup=popup;
  window.tfNotifySuccess=window.tfNotifySuccess||((m)=>popup(m,'success'));
  window.tfNotifyError=window.tfNotifyError||((m)=>popup(m,'error'));
  window.tfNotifyInfo=window.tfNotifyInfo||((m)=>popup(m,'info'));

  const nativeAlert=window.alert;
  window.alert=function(message){popup(message,'info');};
  window.tfRestoreNativeAlert=()=>{window.alert=nativeAlert;};

  window.addEventListener('error',e=>{
    const message=e?.error?.message||e?.message;
    if(message)popup('حدث خطأ غير متوقع: '+message,'error');
  });
  window.addEventListener('unhandledrejection',e=>{
    const reason=e?.reason;
    const message=reason?.message||String(reason||'تعذر تنفيذ العملية');
    popup('تعذر تنفيذ العملية: '+message,'error');
  });

  function init(){addThemeButton();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  [200,800,2000,5000].forEach(t=>setTimeout(init,t));
})();