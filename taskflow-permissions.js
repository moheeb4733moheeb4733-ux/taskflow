(()=>{
'use strict';
if(window.__TASKFLOW_PERMISSIONS_V10__)return;
window.__TASKFLOW_PERMISSIONS_V10__=true;

const ADMIN_ID='-P0oi6mvkk6L9JM56fgH';
const PERMISSIONS=[
 {key:'dashboard',label:'الرئيسية',icon:'⌂'},
 {key:'tasks',label:'المهام',icon:'✓'},
 {key:'dailylog',label:'السجل اليومي',icon:'📝'},
 {key:'calendar',label:'التقويم',icon:'▦'},
 {key:'board',label:'لوحة Kanban',icon:'▤'},
 {key:'members',label:'الأعضاء',icon:'👥'},
 {key:'reports',label:'التقارير',icon:'▤'},
 {key:'settings',label:'الإعدادات',icon:'⚙'},
 {key:'ai',label:'✦ AI',icon:'✦'},
 {key:'floating_ai',label:'TaskFlow AI العائمة',icon:'✦'}
];
window.TASKFLOW_PERMISSION_KEYS=PERMISSIONS.map(x=>x.key);
window.TASKFLOW_ALL_PERMISSIONS=PERMISSIONS;

const $=id=>document.getElementById(id);
const isAdmin=key=>key===ADMIN_ID;
function currentId(){return localStorage.getItem('taskflow_user_id')||window.currentUserId||null}
function normalizeHidden(v){return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]}
function getMember(id){
 const list=Array.isArray(window.members)?window.members:[];
 return list.find(m=>m.firebaseKey===id)||null;
}
async function readMember(id){
 try{const s=await firebase.database().ref('members/'+id).once('value');return s.val()||null}catch(e){return null}
}
function hiddenFor(member){return isAdmin(member?.firebaseKey||member?.id)?[]:normalizeHidden(member?.hiddenPages)}
function canShow(key,member){return !hiddenFor(member).includes(key)}

function findAiNav(){
 return document.querySelector('.tfai-nav')||Array.from(document.querySelectorAll('.nav button')).find(b=>/\bAI\b|✦/.test(b.textContent||''));
}
function applyVisibility(member){
 if(!member)return;
 const hidden=new Set(hiddenFor(member));
 PERMISSIONS.forEach(p=>{
  let nodes=[];
  if(p.key==='ai'){
   const n=findAiNav();if(n)nodes.push(n);
   const page=$('tfai-page');if(page)nodes.push(page);
  }else if(p.key==='floating_ai'){
   const f=$('tfai-float');if(f)nodes.push(f);
  }else{
   const b=$('nav_'+p.key);if(b)nodes.push(b);
   const page=$(p.key);if(page)nodes.push(page);
  }
  nodes.forEach(n=>{
   const show=!hidden.has(p.key)||isAdmin(member.firebaseKey);
   if(n.dataset.tfPermissionManaged==='1' && n.dataset.tfPermissionDisplay!==undefined){
     if(n.dataset.tfPermissionDisplay) n.style.display=n.dataset.tfPermissionDisplay;
   }
   if(!show){
    if(n.dataset.tfPermissionDisplay===undefined)n.dataset.tfPermissionDisplay=n.style.display||'';
    n.dataset.tfPermissionManaged='1';
    n.style.display='none';
   }else{
    n.dataset.tfPermissionManaged='1';
    n.style.display=n.dataset.tfPermissionDisplay||'';
   }
  });
 });
}

function ensureStyle(){
 if($('tf-permissions-style'))return;
 const s=document.createElement('style');s.id='tf-permissions-style';s.textContent=`
#tf-permissions-modal{display:none;position:fixed;inset:0;background:#000b;z-index:100001;align-items:center;justify-content:center;padding:20px;direction:rtl}
#tf-permissions-modal.show{display:flex}.tfpm-box{width:min(680px,100%);max-height:90vh;overflow:auto;background:#171a23;border:1px solid var(--line,#2a2e3d);border-radius:16px;padding:20px;color:var(--cream,#f7f4f2);box-shadow:0 25px 80px #0008}.tfpm-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.tfpm-head h3{margin:0}.tfpm-close{border:0;background:transparent;color:var(--muted,#9ca3af);font-size:24px}.tfpm-note{margin:8px 0 15px;color:var(--muted,#9ca3af);font-size:12px}.tfpm-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tfpm-item{display:flex;align-items:center;gap:10px;border:1px solid var(--line,#2a2e3d);background:#111319;border-radius:11px;padding:12px}.tfpm-item input{width:18px;height:18px;accent-color:#635bff}.tfpm-item span{font-weight:700}.tfpm-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.tfpm-btn{border:1px solid var(--line,#2a2e3d);background:#212635;color:var(--cream,#f7f4f2);padding:10px 15px;border-radius:9px;font-weight:700}.tfpm-save{background:#635bff;border-color:#635bff;color:#fff}.tfpm-locked{border-color:#10b981}.tfpm-locked input{opacity:.65}@media(max-width:600px){.tfpm-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)
}
function ensureModal(){
 if($('tf-permissions-modal'))return $('tf-permissions-modal');
 ensureStyle();
 const m=document.createElement('div');m.id='tf-permissions-modal';m.innerHTML=`<div class="tfpm-box"><div class="tfpm-head"><div><h3 id="tfpm-title">صلاحيات العضو</h3><div id="tfpm-note" class="tfpm-note">حدد الصفحات والأدوات التي يمكن للعضو الوصول إليها.</div></div><button class="tfpm-close" type="button" id="tfpm-close">×</button></div><div id="tfpm-grid" class="tfpm-grid"></div><div class="tfpm-foot"><button type="button" class="tfpm-btn" id="tfpm-cancel">إلغاء</button><button type="button" class="tfpm-btn tfpm-save" id="tfpm-save">حفظ الصلاحيات</button></div></div>`;
 document.body.appendChild(m);
 $('tfpm-close').onclick=closeModal;$('tfpm-cancel').onclick=closeModal;
 $('tfpm-save').onclick=savePermissions;
 m.addEventListener('click',e=>{if(e.target===m)closeModal()});
 return m;
}
let editingKey=null;
function closeModal(){const m=$('tf-permissions-modal');if(m)m.classList.remove('show');editingKey=null}
async function openPermissions(key){
 if(!key)return;
 const member=getMember(key)||await readMember(key);
 if(!member)return;
 if(isAdmin(key)){if(typeof window.tfNotifyInfo==='function')window.tfNotifyInfo('حساب مدير النظام الأساسي محمي وجميع الصلاحيات مفعلة دائماً');else if(typeof window.toast==='function')window.toast('حساب مدير النظام الأساسي محمي وجميع الصلاحيات مفعلة دائماً');return;}
 editingKey=key;const m=ensureModal();$('tfpm-title').textContent='صلاحيات: '+(member.name||'العضو');$('tfpm-note').textContent='يمكنك إظهار أو إخفاء أي من الصلاحيات العشر لهذا العضو.';
 const hidden=new Set(normalizeHidden(member.hiddenPages));
 $('tfpm-grid').innerHTML=PERMISSIONS.map(p=>`<label class="tfpm-item"><input type="checkbox" data-permission="${p.key}" ${!hidden.has(p.key)?'checked':''}><span>${p.icon} ${p.label}</span></label>`).join('');
 m.classList.add('show');
}
async function savePermissions(){
 if(!editingKey||isAdmin(editingKey))return;
 const hidden=PERMISSIONS.filter(p=>{const el=document.querySelector(`#tfpm-grid input[data-permission="${p.key}"]`);return el&&!el.checked}).map(p=>p.key);
 try{
  await firebase.database().ref('members/'+editingKey).update({hiddenPages:hidden});
  const m=await readMember(currentId());if(m)applyVisibility({...m,firebaseKey:currentId()});
  closeModal();
  if(typeof window.toast==='function')window.toast('تم حفظ الصلاحيات العشر للعضو');
 }catch(e){if(typeof window.toast==='function')window.toast('تعذر حفظ الصلاحيات')}
}

const oldOpen=window.openPermissionsModal;
window.openPermissionsModal=function(key){return openPermissions(key)};

function hookMemberCards(){
 document.querySelectorAll('[onclick*="openPermissionsModal"]').forEach(btn=>{
  if(btn.dataset.tfPermissionHooked==='1')return;
  btn.dataset.tfPermissionHooked='1';
  btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const m=(btn.getAttribute('onclick')||'').match(/openPermissionsModal\(['"]([^'"]+)['"]\)/);if(m)openPermissions(m[1])},true);
 });
}

function watchMembers(){
 if(!window.firebase||!firebase.database)return;
 firebase.database().ref('members').on('value',snap=>{
  const data=snap.val()||{};const id=currentId();
  const member=data[id]?{...data[id],firebaseKey:id}:null;
  if(member){
   if(isAdmin(id))applyVisibility({...member,hiddenPages:[]});
   else applyVisibility(member);
  }
  hookMemberCards();
 });
}

function boot(){
 ensureStyle();hookMemberCards();watchMembers();
 const run=()=>{const id=currentId();if(!id)return;readMember(id).then(m=>{if(m)applyVisibility({...m,firebaseKey:id})});hookMemberCards()};
 run();setTimeout(run,500);setTimeout(run,1500);setTimeout(run,3000);
 const mo=new MutationObserver(()=>{hookMemberCards();const id=currentId();if(id){const m=getMember(id);if(m)applyVisibility(m)}});mo.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
