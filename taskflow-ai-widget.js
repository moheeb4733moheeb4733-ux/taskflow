(()=>{
if(window.__TASKFLOW_AI_WIDGET__)return;
window.__TASKFLOW_AI_WIDGET__=true;

const css=`
.tfai-page{display:none;direction:rtl}.tfai-page.show{display:block}
.tfai-head{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:18px}.tfai-sub{color:var(--muted);font-size:13px}.tfai-head-actions{display:flex;gap:8px}
.tfai-back,.tfai-export-btn{border:1px solid var(--line);background:#212635;color:var(--cream);padding:10px 15px;border-radius:10px;font-weight:700;cursor:pointer}
.tfai-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.tfai-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}.tfai-stat span{display:block;color:var(--muted);font-size:12px}.tfai-stat b{display:block;font-size:28px;margin-top:6px}
.tfai-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:14px;margin-top:14px}.tfai-card h3{margin:0 0 14px;font-size:15px}
.tfai-quick{display:flex;flex-wrap:wrap;align-items:center;gap:7px}.tfai-command{display:inline-flex;align-items:center;flex:0 0 auto;min-width:0;max-width:100%}
.tfai-chip{flex:0 0 auto;min-width:0;border:1px solid var(--line);background:var(--input-bg,#111319);color:var(--cream);border-radius:9px;padding:8px 11px;cursor:pointer;text-align:right;font-size:16px;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(280px,42vw)}
.tfai-command.selected .tfai-chip{outline:2px solid #635bff;outline-offset:2px}.tfai-quick-add{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;background:transparent;color:var(--muted);font-size:23px;line-height:1;border-radius:7px;cursor:pointer}.tfai-quick-add:hover{background:rgba(99,92,255,.12);color:var(--cream)}
.tfai-command-toolbar{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}.tfai-command-toolbar button{border:0;background:transparent;color:var(--muted);cursor:pointer;padding:5px 7px;border-radius:7px}.tfai-command-toolbar button:hover{background:rgba(99,92,255,.12);color:var(--cream)}.tfai-edit-mode{font-size:18px}.tfai-delete-mode{font-size:20px}.tfai-selection-label{font-size:13px;color:var(--muted);margin-inline-start:auto}
.tfai-command-editor{display:none;margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--input-bg,#111319);gap:8px;flex-direction:column}.tfai-command-editor.show{display:flex}.tfai-command-editor input,.tfai-command-editor textarea{width:100%;box-sizing:border-box;background:var(--input-bg,#111319);color:var(--cream);border:1px solid var(--line);border-radius:10px;padding:10px}.tfai-editor-actions{display:flex;gap:8px}.tfai-save{border:0;background:#635bff;color:#fff;border-radius:9px;padding:9px 14px;cursor:pointer}.tfai-cancel{border:1px solid var(--line);background:transparent;color:var(--cream);border-radius:9px;padding:9px 14px;cursor:pointer}
.tfai-input{width:100%;min-height:145px;background:var(--input-bg,#111319);color:var(--cream);border:1px solid var(--line);border-radius:14px;padding:14px;resize:vertical}.tfai-actions{display:flex;gap:8px;margin-top:10px}.tfai-send{flex:1;border:0;background:var(--blue,#635bff);color:#fff;border-radius:12px;padding:13px;font-weight:800;cursor:pointer}.tfai-clear{border:1px solid var(--line);background:transparent;color:var(--cream);border-radius:12px;padding:13px 18px;cursor:pointer}
.tfai-answer{white-space:pre-wrap;line-height:1.9;min-height:260px;background:var(--input-bg,#111319);border:1px solid var(--line);border-radius:14px;padding:16px;color:var(--cream)}.tfai-note{color:var(--muted);font-size:11px;margin-top:9px}
.tfai-nav{width:100%;border:0;background:transparent;color:#9ca3af;text-align:right;padding:11px;border-radius:10px;display:flex;gap:10px;align-items:center;font:inherit;cursor:pointer}.tfai-nav:hover,.tfai-nav.active{background:rgba(255,255,255,.08);color:#fff}
.tfai-float{position:fixed;left:22px;bottom:22px;z-index:9999;border:0;border-radius:999px;background:#635bff;color:#fff;padding:13px 18px;font-weight:800;box-shadow:0 12px 30px rgba(0,0,0,.3);cursor:pointer}.tfai-exports{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.tfai-export-btn{background:var(--panel)}
.tf-toast{position:fixed;right:24px;bottom:24px;z-index:100000;min-width:260px;max-width:min(420px,calc(100vw - 48px));padding:12px 16px;border:1px solid var(--line);border-radius:12px;background:var(--panel);color:var(--cream);box-shadow:0 14px 35px rgba(0,0,0,.35);font-size:14px;font-weight:700;opacity:0;transform:translateY(10px);transition:.2s}.tf-toast.show{opacity:1;transform:translateY(0)}
@media(max-width:850px){.tfai-stats{grid-template-columns:repeat(2,1fr)}.tfai-grid{grid-template-columns:1fr}}@media(max-width:600px){.tfai-quick{flex-direction:row;align-items:center}.tfai-chip{max-width:100%;font-size:16px}.tfai-head{align-items:flex-start}.tfai-head-actions{flex-direction:column}.tfai-card{padding:14px}.tfai-float{left:12px;bottom:12px}.tf-toast{right:12px;bottom:12px}}
`;
const style=document.createElement('style');style.id='tfai-widget-style';style.textContent=css;document.head.appendChild(style);
const $=id=>document.getElementById(id);

function toast(message){
 let el=$('tf-dashboard-toast');
 if(!el){el=document.createElement('div');el.id='tf-dashboard-toast';el.className='tf-toast';document.body.appendChild(el)}
 el.textContent=message;el.classList.add('show');clearTimeout(window.__tfToastTimer);window.__tfToastTimer=setTimeout(()=>el.classList.remove('show'),2600);
}

const defaults=[
 ['ماذا أفعل الآن؟','ماذا أفعل الآن؟'],['من الأكثر تأخراً؟','من الموظف الأكثر تأخراً؟'],['حلل أداء الفريق','حلل أداء الفريق هذا الأسبوع.'],['أهم 5 مهام','ما أهم 5 مهام تحتاج تدخلي الآن؟'],['المخاطر القادمة','ما المهام التي ستتأخر قريباً؟'],['المهام الحرجة','ما أكثر المهام خطورة الآن ولماذا؟'],['أداء اليوم','لخص أداء الفريق اليوم مع أهم الملاحظات.'],['اقتراحات المدير','ما الإجراءات التي تقترح أن أنفذها الآن؟']
];
const KEY='taskflow_ai_quick_commands_v2';
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
function normalize(list){return Array.isArray(list)?list.filter(v=>v&&typeof v.label==='string'&&typeof v.q==='string'&&v.label.trim()&&v.q.trim()).map(v=>({id:v.id||uid(),label:v.label.trim(),q:v.q.trim()})):[]}
function getCommands(){
 try{
  const raw=localStorage.getItem(KEY);
  if(raw!==null)return normalize(JSON.parse(raw));
  const legacy=JSON.parse(localStorage.getItem('taskflow_ai_quick_commands')||'[]');
  if(Array.isArray(legacy)&&legacy.length)return normalize(legacy);
 }catch(e){}
 return defaults.map(([label,q])=>({id:uid(),label,q}));
}
function saveCommands(list){localStorage.setItem(KEY,JSON.stringify(normalize(list)))}
let commands=getCommands();
let selected=new Set();
let mode='none';
let editingId=null;

const nav=document.querySelector('.nav');
let navBtn=nav?.querySelector('.tfai-nav');
if(!navBtn&&nav){navBtn=document.createElement('button');navBtn.className='tfai-nav';navBtn.innerHTML='<i>✦</i><span>AI</span>';nav.appendChild(navBtn)}

const page=document.createElement('section');
page.id='tfai-page';page.className='tfai-page';
page.innerHTML=`
<div class="tfai-head"><div><div class="tfai-sub">مساعد الإدارة الذكي لتحليل المهام والفريق والتقارير</div></div><div class="tfai-head-actions"><button id="tfai-back" class="tfai-back">← العودة للوحة</button></div></div>
<div class="tfai-stats"><div class="tfai-card tfai-stat"><span>المهام</span><b id="tfai-tasks">0</b></div><div class="tfai-card tfai-stat"><span>المتأخرة</span><b id="tfai-overdue">0</b></div><div class="tfai-card tfai-stat"><span>الأعضاء</span><b id="tfai-members">0</b></div><div class="tfai-card tfai-stat"><span>السجلات اليومية</span><b id="tfai-logs">0</b></div></div>
<div class="tfai-grid">
 <div class="tfai-card"><h3>الأوامر والأسئلة السريعة</h3><div id="tfai-quick" class="tfai-quick"></div><div id="tfai-command-editor" class="tfai-command-editor"><input id="tfai-edit-label" maxlength="120" placeholder="اسم الأمر"><textarea id="tfai-edit-q" rows="3" maxlength="500" placeholder="السؤال الذي سيرسل إلى AI"></textarea><div class="tfai-editor-actions"><button id="tfai-save" class="tfai-save">حفظ التعديل</button><button id="tfai-cancel" class="tfai-cancel">إلغاء</button></div></div></div>
 <div class="tfai-card"><h3>سؤال TaskFlow AI</h3><textarea id="tfai-input" class="tfai-input" placeholder="اكتب سؤالك أو أمرك هنا..."></textarea><div class="tfai-actions"><button id="tfai-send" class="tfai-send">تحليل السؤال ✦</button><button id="tfai-clear" class="tfai-clear">مسح</button></div></div>
</div>
<div class="tfai-card" style="margin-top:14px"><h3>نتيجة التحليل</h3><div id="tfai-answer" class="tfai-answer">جاهز لتحليل بيانات TaskFlow.</div><div class="tfai-exports"><button class="tfai-export-btn" id="tfai-export-txt">TXT</button><button class="tfai-export-btn" id="tfai-export-csv">CSV</button><button class="tfai-export-btn" id="tfai-export-excel">Excel</button><button class="tfai-export-btn" id="tfai-export-word">Word</button><button class="tfai-export-btn" id="tfai-export-pdf">PDF</button><button class="tfai-export-btn" id="tfai-export-json">JSON</button></div><div class="tfai-note">يمكن تصدير نتيجة التحليل الحالية بعدة صيغ.</div></div>`;
const main=document.querySelector('.main');if(!main)return;main.appendChild(page);

const float=document.createElement('button');float.id='tfai-float';float.className='tfai-float';float.textContent='✦ TaskFlow AI';document.body.appendChild(float);

const quick=$('tfai-quick');
const editor=$('tfai-command-editor');
const toolbar=document.createElement('div');
toolbar.className='tfai-command-toolbar';
toolbar.innerHTML='<button type="button" class="tfai-edit-mode" title="تعديل أمر واحد">✏️</button><button type="button" class="tfai-delete-mode" title="تحديد أو حذف الأوامر">🗑️</button><span class="tfai-selection-label"></span>';
quick.parentElement.appendChild(toolbar);
const editModeBtn=toolbar.querySelector('.tfai-edit-mode');
const deleteModeBtn=toolbar.querySelector('.tfai-delete-mode');
const selectionLabel=toolbar.querySelector('.tfai-selection-label');

function updateToolbar(){
 selectionLabel.textContent=mode==='edit'?'حدد أمراً واحداً للتعديل':mode==='delete'?(selected.size?`محدد: ${selected.size}`:'حدد الأوامر للحذف'):'';
 quick.querySelectorAll('.tfai-command').forEach(row=>row.classList.toggle('selected',selected.has(row.dataset.commandId)));
}
function closeEditor(){editingId=null;editor.classList.remove('show')}
function openEditor(id){const c=commands.find(x=>x.id===id);if(!c)return;editingId=id;$('tfai-edit-label').value=c.label;$('tfai-edit-q').value=c.q;editor.classList.add('show');$('tfai-edit-label').focus()}
function resetMode(){mode='none';selected.clear();updateToolbar()}
function addCommand(){
 const label=window.prompt?null:null;
}
function showAddEditor(){
 editingId=null;
 $('tfai-edit-label').value='';$('tfai-edit-q').value='';editor.classList.add('show');$('tfai-edit-label').focus();
}
function renderQuick(){
 quick.innerHTML='';
 commands.forEach(c=>{
  const row=document.createElement('div');row.className='tfai-command';row.dataset.commandId=c.id;
  const b=document.createElement('button');b.type='button';b.className='tfai-chip';b.textContent=c.label;b.title='تشغيل الأمر';
  b.onclick=()=>{
   if(mode==='delete'){
    selected.has(c.id)?selected.delete(c.id):selected.add(c.id);updateToolbar();return;
   }
   if(mode==='edit'){
    selected.clear();selected.add(c.id);updateToolbar();openEditor(c.id);return;
   }
   $('tfai-input').value=c.q;ask();
  };
  row.appendChild(b);quick.appendChild(row);
 });
 const add=document.createElement('button');add.type='button';add.className='tfai-quick-add';add.textContent='+';add.title='إضافة أمر';add.setAttribute('aria-label','إضافة أمر');add.onclick=()=>{resetMode();showAddEditor()};quick.appendChild(add);
 updateToolbar();
}

editModeBtn.onclick=()=>{
 if(mode==='edit'){resetMode();toast('تم إلغاء وضع التعديل');return}
 mode='edit';selected.clear();updateToolbar();toast('حدد أمراً واحداً للتعديل');
};
deleteModeBtn.onclick=()=>{
 if(mode!=='delete'){mode='delete';selected.clear();updateToolbar();toast('حدد الأوامر التي تريد حذفها ثم اضغط السلة مرة أخرى');return}
 if(!selected.size){resetMode();toast('لم تحدد أي أمر');return}
 const count=selected.size;commands=commands.filter(c=>!selected.has(c.id));saveCommands(commands);resetMode();renderQuick();toast(`تم حذف ${count} أمر بنجاح`);
};

$('tfai-save').onclick=()=>{
 const label=$('tfai-edit-label').value.trim(),q=$('tfai-edit-q').value.trim();
 if(!label||!q){toast('أدخل اسم الأمر والسؤال أولاً');return}
 if(editingId){commands=commands.map(c=>c.id===editingId?{...c,label,q}:c);toast('تم حفظ تعديل الأمر')}
 else{commands.push({id:uid(),label,q});toast('تمت إضافة الأمر بنجاح')}
 saveCommands(commands);closeEditor();resetMode();renderQuick();
};
$('tfai-cancel').onclick=()=>{closeEditor();resetMode()};

function context(){try{if(window.TaskFlowAIData?.getManagerContext)return window.TaskFlowAIData.getManagerContext()}catch(e){}return{tasks:Array.isArray(window.tasks)?window.tasks:[],members:Array.isArray(window.members)?window.members:[],dailyLogs:Array.isArray(window.dailyLogs)?window.dailyLogs:[]}}
function refresh(){try{const c=context(),t=c.tasks||[],m=c.members||[],l=c.dailyLogs||[];$('tfai-tasks').textContent=t.length;$('tfai-overdue').textContent=t.filter(x=>['overdue','متأخر','متأخرة'].includes(String(x.status).toLowerCase())).length;$('tfai-members').textContent=m.length;$('tfai-logs').textContent=l.length}catch(e){}}
let previousPages=[];
function openPage(){previousPages=[...document.querySelectorAll('.page')];previousPages.forEach(p=>p.classList.remove('active'));page.classList.add('show');navBtn?.classList.add('active');renderQuick();refresh();window.scrollTo(0,0)}
function closePage(){page.classList.remove('show');navBtn?.classList.remove('active');previousPages.forEach(p=>p.classList.remove('active'));(previousPages.find(p=>p.id==='dashboard')||previousPages[0])?.classList.add('active');closeEditor();resetMode()}
async function ask(){const q=$('tfai-input').value.trim();if(!q)return;$('tfai-send').disabled=true;$('tfai-send').textContent='جاري التحليل...';$('tfai-answer').textContent='أحلل البيانات الآن...';try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context:context(),excelSummary:''})});const d=await r.json().catch(()=>({}));$('tfai-answer').textContent=r.ok?(d.answer||'لم يصل رد من المساعد.'):(d.details||d.error||'تعذر تنفيذ طلب AI.')}catch(e){$('tfai-answer').textContent='تعذر الاتصال بـ TaskFlow AI. تأكد من نشر Backend.'}finally{$('tfai-send').disabled=false;$('tfai-send').textContent='تحليل السؤال ✦'}}
function resultText(){return{q:$('tfai-input').value.trim()||'تحليل TaskFlow AI',a:$('tfai-answer').innerText.trim(),stamp:new Date().toLocaleString('ar-YE')}}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function exportTxt(){const r=resultText();downloadBlob(new Blob([`TaskFlow AI\nالسؤال: ${r.q}\nالتاريخ: ${r.stamp}\n\n${r.a}`],{type:'text/plain;charset=utf-8'}),`taskflow-ai-${Date.now()}.txt`)}
function exportCsv(){const r=resultText(),esc=s=>'"'+String(s).replace(/"/g,'""')+'"';downloadBlob(new Blob([`السؤال,التاريخ,النتيجة\r\n${esc(r.q)},${esc(r.stamp)},${esc(r.a)}\r\n`],{type:'text/csv;charset=utf-8'}),`taskflow-ai-${Date.now()}.csv`)}
function exportJson(){const r=resultText();downloadBlob(new Blob([JSON.stringify({product:'TaskFlow AI',question:r.q,date:r.stamp,result:r.a},null,2)],{type:'application/json;charset=utf-8'}),`taskflow-ai-${Date.now()}.json`)}
function exportWord(){const r=resultText(),html=`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>TaskFlow AI</title></head><body><h1>TaskFlow AI</h1><p><b>السؤال:</b> ${r.q}</p><p><b>التاريخ:</b> ${r.stamp}</p><hr><div>${r.a.replace(/\n/g,'<br>')}</div></body></html>`;downloadBlob(new Blob(['\ufeff',html],{type:'application/msword'}),`taskflow-ai-${Date.now()}.doc`)}
function exportPdf(){const r=resultText(),w=window.open('','_blank','width=900,height=700');if(!w){toast('تم منع نافذة PDF من المتصفح. اسمح بالنوافذ المنبثقة.');return}w.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>TaskFlow AI</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:2}h1{font-size:24px}pre{white-space:pre-wrap;font-family:Arial}</style></head><body><h1>TaskFlow AI — تقرير التحليل</h1><p><b>السؤال:</b> ${r.q}</p><p><b>التاريخ:</b> ${r.stamp}</p><hr><pre>${r.a}</pre><script>window.onload=()=>window.print()<\\/script></body></html>`);w.document.close()}
async function exportExcel(){const r=resultText();if(!window.XLSX){try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}catch(e){toast('تعذر تحميل أداة Excel.');return}}const ws=XLSX.utils.aoa_to_sheet([['TaskFlow AI'],['السؤال',r.q],['التاريخ',r.stamp],[],['نتيجة التحليل'],[r.a]]),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'نتيجة التحليل');XLSX.writeFile(wb,`taskflow-ai-${Date.now()}.xlsx`)}

navBtn&&(navBtn.onclick=openPage);float.onclick=openPage;$('tfai-back').onclick=closePage;$('tfai-send').onclick=ask;$('tfai-clear').onclick=()=>{$('tfai-input').value='';$('tfai-answer').textContent='جاهز لتحليل بيانات TaskFlow.'};$('tfai-export-txt').onclick=exportTxt;$('tfai-export-csv').onclick=exportCsv;$('tfai-export-excel').onclick=exportExcel;$('tfai-export-word').onclick=exportWord;$('tfai-export-pdf').onclick=exportPdf;$('tfai-export-json').onclick=exportJson;renderQuick();
})();