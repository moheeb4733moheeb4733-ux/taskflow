(()=>{
  if(window.__TASKFLOW_AI_COMMAND_CONTROLS__)return;
  window.__TASKFLOW_AI_COMMAND_CONTROLS__=true;
  const STYLE=`
    #tfai-page .tfai-quick{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:6px!important}
    #tfai-page .tfai-command{display:inline-flex!important;width:auto!important;flex:0 0 auto!important;align-items:center!important;gap:0!important}
    #tfai-page .tfai-chip{width:auto!important;max-width:260px!important;flex:0 0 auto!important;padding:5px 8px!important;font-size:12px!important;border-radius:7px!important}
    #tfai-page .tfai-tools{display:none!important}
    #tfai-page .tfai-command.tfai-selected .tfai-chip{outline:2px solid #635bff!important;outline-offset:1px!important}
    #tfai-page .tfai-quick-add{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:24px!important;height:24px!important;padding:0!important;border:0!important;background:transparent!important;color:var(--muted)!important;font-size:19px!important;line-height:1!important;border-radius:6px!important;cursor:pointer!important}
    #tfai-page .tfai-command-toolbar{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}
    #tfai-page .tfai-command-toolbar button{border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:12px;padding:5px 7px;border-radius:7px}
    #tfai-page .tfai-command-toolbar button:hover{background:rgba(99,91,255,.12);color:var(--cream)}
    #tfai-page .tfai-command-toolbar .tfai-delete-mode{font-size:18px;padding:2px 5px}
    #tfai-page .tfai-command-toolbar .tfai-edit-mode{font-size:16px;padding:3px 5px}
    #tfai-page .tfai-command-toolbar .tfai-delete-confirm{display:none;background:#8b2635;color:#fff;padding:6px 10px}
    #tfai-page .tfai-command-toolbar.selection-mode .tfai-delete-confirm{display:inline-block}
    #tfai-page .tfai-command-toolbar .tfai-selection-label{font-size:11px;color:var(--muted);margin-inline-start:auto}
    #tfai-page .tfai-add-pop{display:none;margin-top:8px;gap:6px;align-items:center}
    #tfai-page .tfai-add-pop.show{display:flex}
    #tfai-page .tfai-add-pop input{flex:1;min-width:0;background:var(--input-bg,#111319);color:var(--cream);border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:12px}
    #tfai-page .tfai-add-pop button{border:0;background:#635bff;color:#fff;border-radius:8px;padding:7px 10px;font-size:12px;cursor:pointer}
    @media(max-width:600px){#tfai-page .tfai-chip{max-width:220px!important}}
  `;
  const st=document.createElement('style');st.textContent=STYLE;document.head.appendChild(st);
  let observer;
  function setup(){
    const page=document.getElementById('tfai-page');
    const quick=page?.querySelector('#tfai-quick');
    if(!page||!quick)return;
    if(page.dataset.commandControlsReady==='1')return;
    page.dataset.commandControlsReady='1';
    const selected=new Set();
    function renderToolbar(){
      let bar=page.querySelector('.tfai-command-toolbar');
      if(!bar){
        bar=document.createElement('div');bar.className='tfai-command-toolbar';
        bar.innerHTML='<button type="button" class="tfai-edit-mode" title="تعديل الأمر المحدد">✏️</button><button type="button" class="tfai-delete-mode" title="تحديد أوامر للحذف">🗑️</button><button type="button" class="tfai-delete-confirm">حذف المحدد</button><span class="tfai-selection-label"></span>';
        const card=quick.parentElement;card?.appendChild(bar);
        bar.querySelector('.tfai-delete-mode').onclick=()=>{
          bar.classList.toggle('selection-mode');
          if(!bar.classList.contains('selection-mode')){selected.clear();syncSelection()}
          updateLabel();
        };
        bar.querySelector('.tfai-delete-confirm').onclick=()=>{
          if(!selected.size)return;
          if(!confirm(`حذف ${selected.size} أمر محدد؟`))return;
          const current=window.__TASKFLOW_AI_COMMANDS__;
          if(Array.isArray(current)){
            window.__TASKFLOW_AI_COMMANDS__=current.filter(c=>!selected.has(c.id));
            localStorage.setItem('taskflow_ai_quick_commands_v2',JSON.stringify(window.__TASKFLOW_AI_COMMANDS__));
            selected.clear();
            window.__TASKFLOW_AI_FORCE_RENDER__?.();
          }
          bar.classList.remove('selection-mode');updateLabel();
        };
        bar.querySelector('.tfai-edit-mode').onclick=()=>{
          if(selected.size!==1){alert('حدد أمراً واحداً أولاً للتعديل.');return;}
          const id=[...selected][0];
          document.querySelector(`#tfai-quick .tfai-command[data-command-id="${CSS.escape(id)}"] .tfai-chip`)?.click();
          const c=window.__TASKFLOW_AI_COMMANDS__?.find(x=>x.id===id);
          if(c&&window.__TASKFLOW_AI_OPEN_EDITOR__)window.__TASKFLOW_AI_OPEN_EDITOR__(id);
          selected.clear();syncSelection();updateLabel();
        };
      }
      function updateLabel(){bar.querySelector('.tfai-selection-label').textContent=selected.size?`محدد: ${selected.size}`:''}
      function syncSelection(){quick.querySelectorAll('.tfai-command').forEach(row=>{const id=row.dataset.commandId;row.classList.toggle('tfai-selected',selected.has(id))});updateLabel()}
      function wireRows(){
        quick.querySelectorAll('.tfai-command').forEach(row=>{
          const chip=row.querySelector('.tfai-chip');
          const label=chip?.textContent?.trim();
          const cmds=window.__TASKFLOW_AI_COMMANDS__||[];
          const c=cmds.find(x=>x.label===label);
          if(c)row.dataset.commandId=c.id;
          const clean=()=>row.querySelectorAll('.tfai-tool').forEach(x=>x.remove());
          clean();
          if(chip&&!chip.dataset.selectionWired){
            chip.dataset.selectionWired='1';
            const original=chip.onclick;
            chip.onclick=(e)=>{
              if(bar.classList.contains('selection-mode')){
                e.preventDefault();e.stopImmediatePropagation();
                const id=row.dataset.commandId;if(id){selected.has(id)?selected.delete(id):selected.add(id);syncSelection()}
                return;
              }
              original?.call(chip,e);
            };
          }
        });
        const plus=quick.querySelector('.tfai-quick-add');
        if(plus&&plus.parentElement===quick)return;
        if(plus)quick.appendChild(plus);
      }
      wireRows();
      if(!observer){observer=new MutationObserver(()=>setTimeout(wireRows,0));observer.observe(quick,{childList:true,subtree:true})}
    }
    function addPlus(){
      let plus=quick.querySelector('.tfai-quick-add');
      if(!plus){plus=document.createElement('button');plus.className='tfai-quick-add';plus.type='button';plus.textContent='+';plus.title='إضافة أمر سريع';quick.appendChild(plus);}
      plus.onclick=()=>{
        let pop=page.querySelector('.tfai-add-pop');
        if(!pop){
          pop=document.createElement('div');pop.className='tfai-add-pop';pop.innerHTML='<input maxlength="120" placeholder="اكتب الأمر السريع..."><button type="button">إضافة</button>';
          const input=pop.querySelector('input');
          const add=()=>{const v=input.value.trim();if(!v)return;const source=page.querySelector('#tfai-custom-input');const original=page.querySelector('#tfai-add');if(source)source.value=v;if(original)original.click();input.value='';pop.classList.remove('show')};
          pop.querySelector('button').onclick=add;input.onkeydown=e=>{if(e.key==='Enter')add()};quick.parentElement?.appendChild(pop);
        }
        pop.classList.toggle('show');
        if(pop.classList.contains('show'))pop.querySelector('input')?.focus();
      };
    }
    const commands=()=>{
      try{return JSON.parse(localStorage.getItem('taskflow_ai_quick_commands_v2')||'[]')}catch{return[]}
    };
    Object.defineProperty(window,'__TASKFLOW_AI_COMMANDS__',{configurable:true,get:commands,set:v=>localStorage.setItem('taskflow_ai_quick_commands_v2',JSON.stringify(v||[]))});
    window.__TASKFLOW_AI_OPEN_EDITOR__=id=>{
      const c=commands().find(x=>x.id===id);if(!c)return;
      const ed=page.querySelector('#tfai-editor');if(!ed)return;
      page.querySelector('#tfai-edit-label').value=c.label;page.querySelector('#tfai-edit-q').value=c.q;ed.classList.add('show');page.querySelector('#tfai-edit-label').focus();
    };
    window.__TASKFLOW_AI_FORCE_RENDER__=()=>{
      page.querySelector('#tfai-quick')?.dispatchEvent(new CustomEvent('taskflow:rerender'));
      const box=page.querySelector('#tfai-quick');if(box&&typeof window.renderQuick==='function')window.renderQuick();
    };
    addPlus();renderToolbar();
  }
  function init(){setup();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  [300,1000,2500,5000].forEach(t=>setTimeout(init,t));
})();