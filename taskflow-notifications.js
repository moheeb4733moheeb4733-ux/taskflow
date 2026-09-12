/* TaskFlow notifications + Remember Me hotfix */
(function(){
'use strict';
const STYLE_ID='tf-dashboard-notify-style',TOAST_ID='tf-dashboard-notify-toast',MODAL_ID='tf-dashboard-confirm';
function styles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`#${TOAST_ID}{position:fixed;left:24px;top:50%;z-index:10000;min-width:280px;max-width:420px;padding:14px 18px;border-radius:14px;background:rgba(23,26,35,.97);color:#fff;border:1px solid #10b981;box-shadow:0 14px 40px rgba(0,0,0,.35);display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(-50%) translateX(-24px);pointer-events:none;transition:.25s;font-size:14px;font-weight:700;direction:rtl}#${TOAST_ID}.show{opacity:1;transform:translateY(-50%) translateX(0)}#${TOAST_ID} .tf-check{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#10b981;color:#07130e;flex:0 0 auto}#tf-remember-row{display:flex;align-items:center;gap:8px;margin:-4px 0 18px;color:#cbd5e1;font-size:12px;cursor:pointer;user-select:none}#tf-remember-row input{width:17px;height:17px;accent-color:#635bff;cursor:pointer}`;document.head.appendChild(s)}
function success(msg){styles();let t=document.getElementById(TOAST_ID);if(!t){t=document.createElement('div');t.id=TOAST_ID;document.body.appendChild(t)}t.innerHTML='<span class="tf-check">✓</span><span></span>';t.querySelector('span:last-child').textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),3000)}
window.taskflowSuccess=success;
function remember(){const form=document.getElementById('loginForm');if(!form||form.dataset.tfRememberInstalled)return;styles();let row=document.getElementById('tf-remember-row');if(!row){row=document.createElement('label');row.id='tf-remember-row';row.innerHTML='<input type="checkbox" id="tfRememberMe"><span>تذكرني على هذا الجهاز</span>';const pass=document.getElementById('loginPassInput');if(pass&&pass.closest('.field'))pass.closest('.field').insertAdjacentElement('afterend',row);else form.appendChild(row)}const cb=document.getElementById('tfRememberMe');if(cb)cb.checked=localStorage.getItem('taskflow_remember_me')==='1';form.addEventListener('submit',function(){const keep=!!document.getElementById('tfRememberMe')?.checked;if(keep){localStorage.setItem('taskflow_remember_me','1')}else{localStorage.removeItem('taskflow_remember_me');setTimeout(()=>localStorage.removeItem('taskflow_user_id'),500)}});form.dataset.tfRememberInstalled='1'}
function restore(){const id=localStorage.getItem('taskflow_user_id');if(!id)return;const list=(typeof members!=='undefined'&&Array.isArray(members))?members:[];const user=list.find(m=>m.firebaseKey===id);if(!user||user.status==='disabled')return;window.currentUserId=id;const login=document.getElementById('loginScreen'),app=document.getElementById('appMain');if(login)login.style.display='none';if(app)app.style.display='flex';window.applyUserPermissions?.(user)}
function confirmDelete(key){styles();let m=document.getElementById(MODAL_ID);if(!m){m=document.createElement('div');m.id=MODAL_ID;m.style.cssText='position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.68);display:flex;align-items:center;justify-content:center;padding:20px';m.innerHTML='<div style="width:min(440px,100%);background:#171a23;border:1px solid #2a2e3d;border-radius:18px;padding:22px;color:#fff;direction:rtl"><h3>تأكيد العملية</h3><p>هل أنت متأكد من حذف هذا العضو نهائياً؟</p><div style="display:flex;gap:9px;justify-content:flex-start;margin-top:20px"><button id="tfCancel" style="padding:10px 16px">إلغاء</button><button id="tfYes" style="padding:10px 16px;background:#581c20;color:#fff;border:1px solid #b51f32">تأكيد</button></div></div>';document.body.appendChild(m);m.querySelector('#tfCancel').onclick=()=>m.remove()}m.querySelector('#tfYes').onclick=()=>{m.remove();if(window.firebase?.database){firebase.database().ref('members/'+key).remove().then(()=>success('تم حذف العضو بنجاح.')).catch(e=>success('تعذر حذف العضو: '+(e?.message||'خطأ')))}}}
window.deleteMember=confirmDelete;
function boot(){styles();remember();setTimeout(restore,300);setTimeout(remember,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* Kanban visibility: managers see all tasks; members see only tasks assigned to themselves. */
(function(){
'use strict';
function me(){try{return typeof getCurrentUser==='function'?getCurrentUser():null}catch(e){return null}}
function manager(){const u=me();return !!u&&u.type==='Manager'}
function renderScopedBoard(){
  const grid=document.getElementById('boardGrid');
  if(!grid||typeof tasks==='undefined')return;
  const u=me();
  if(!u||!u.firebaseKey)return;
  const list=manager()?tasks:tasks.filter(t=>t.memberKey===u.firebaseKey);
  const ms=(typeof members!=='undefined'&&Array.isArray(members))?members:[];
  const cols=[['Pending','لم تبدأ'],['In Progress','قيد التنفيذ'],['Completed','مكتملة']];
  grid.innerHTML=cols.map(([st,label])=>{
    const colTasks=list.filter(x=>x.status===st);
    return `<div class="column"><div class="colhead"><b>${label}</b><span class="badge">${colTasks.length}</span></div><div class="dropzone" data-status="${st}" ondragover="event.preventDefault()" ondrop="dropTask(event)">${colTasks.map(x=>{const owner=ms.find(m=>m.firebaseKey===x.memberKey);return `<div class="boardcard" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${x.firebaseKey}')"><b>${x.title}</b><div class="meta">${owner?owner.name:'—'}</div><div class="progressbar" style="margin-top:8px"><i style="width:${x.progress||0}%"></i></div></div>`}).join('')}</div></div>`;
  }).join('');
}
function guardDrop(){
  const original=window.dropTask;
  if(typeof original!=='function'||original.__tfScoped)return;
  const wrapped=function(e){
    const key=e?.dataTransfer?.getData('text/plain');
    if(!manager()&&key){const u=me();const t=(typeof tasks!=='undefined'&&Array.isArray(tasks))?tasks.find(x=>x.firebaseKey===key):null;if(!u||!t||t.memberKey!==u.firebaseKey)return;}
    return original.apply(this,arguments);
  };
  wrapped.__tfScoped=true;
  window.dropTask=wrapped;
}
function boot(){
  const nav=document.getElementById('nav_board');
  if(nav)nav.style.removeProperty('display');
  renderScopedBoard();
  guardDrop();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
[250,700,1500,3000].forEach(t=>setTimeout(boot,t));
const obs=new MutationObserver(()=>{renderScopedBoard();guardDrop()});
obs.observe(document.documentElement,{childList:true,subtree:true});
})();