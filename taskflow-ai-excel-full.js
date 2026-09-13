(()=>{
'use strict';
if(window.__TASKFLOW_AI_EXCEL_FULL__)return;
window.__TASKFLOW_AI_EXCEL_FULL__=true;
const INPUT_ID='tfai-excel-file',API_PATH='/api/ai';
let fullSummary='';
const text=v=>v==null?'':String(v).trim();
const blank=v=>text(v)==='';
const safe=v=>text(v).slice(0,120);
function loadXlsx(){return new Promise((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const s=document.createElement('script');s.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';s.onload=()=>resolve(window.XLSX);s.onerror=()=>reject(new Error('XLSX load failed'));document.head.appendChild(s)})}
function sensitive(h){return /هاتف|phone|جوال|mobile|مرجع|reference|رقم المهمة|task.?id/i.test(text(h))}
function aggregate(rows,headers,fileName){
 const hs=headers.filter(text),n=rows.length,stats={},top={};
 hs.forEach(h=>{const vals=rows.map(r=>r[h]),non=vals.filter(v=>!blank(v)),counts={};non.forEach(v=>{const k=safe(v);if(k)counts[k]=(counts[k]||0)+1});stats[h]={rows:n,filled:non.length,blank:n-non.length,distinct:new Set(non.map(safe)).size};if(!sensitive(h))top[h]=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([value,count])=>({value,count}))});
 const groupCols=hs.filter(h=>!sensitive(h)),groups={};
 groupCols.forEach(g=>{const freq={};rows.forEach(r=>{const k=safe(r[g]);if(k)freq[k]=(freq[k]||0)+1});groups[g]={groups:Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([value,count])=>({value,count}))}});
 const summary={version:'3.0.0-full-aggregation',fileName,rows:n,columns:hs,missingByColumn:Object.fromEntries(hs.map(h=>[h,stats[h].blank])),columnStats:stats,topValues:top,groups,note:'تم حساب الإحصاءات من جميع صفوف الملف داخل المتصفح. لا يتم إرسال الصفوف الخام.'};
 let out=JSON.stringify(summary);
 if(out.length>27000){Object.values(summary.topValues).forEach(v=>v.splice(10));Object.values(summary.groups).forEach(v=>v.groups.splice(15));out=JSON.stringify(summary)}
 if(out.length>29000){Object.values(summary.topValues).forEach(v=>v.splice(5));Object.values(summary.groups).forEach(v=>v.groups.splice(8));out=JSON.stringify(summary)}
 return out.slice(0,30000);
}
async function processFile(file){const status=document.getElementById('tfai-excel-status');try{const XLSX=await loadXlsx(),buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array'}),sheet=wb.Sheets[wb.SheetNames[0]];if(!sheet)throw new Error('no sheet');const rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false}),headers=rows.length?Object.keys(rows[0]):[];fullSummary=aggregate(rows,headers,file.name);window.__TASKFLOW_FULL_EXCEL_SUMMARY__=fullSummary;if(status){status.className='tfai-excel-status ok';status.textContent=`✓ تم تحليل «${file.name}» بالكامل — ${rows.length.toLocaleString('ar-YE')} صف · ${headers.length} أعمدة. تم استخدام جميع الصفوف في الإحصاءات.`}}catch(e){console.error('TaskFlow full Excel aggregation error',e);fullSummary='';window.__TASKFLOW_FULL_EXCEL_SUMMARY__='';if(status)status.textContent='تعذر تحليل الملف بالكامل. تأكد أنه Excel أو CSV صالح.'}}
function attach(){const input=document.getElementById(INPUT_ID);if(!input||input.dataset.fullAggregationAttached)return;input.dataset.fullAggregationAttached='1';input.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)processFile(f)},false)}
const nativeFetch=window.fetch.bind(window);window.fetch=async function(input,init){try{const url=typeof input==='string'?input:(input&&input.url)||'';if(url.includes(API_PATH)&&init&&typeof init.body==='string'){const body=JSON.parse(init.body);if(fullSummary||window.__TASKFLOW_FULL_EXCEL_SUMMARY__)body.excelSummary=fullSummary||window.__TASKFLOW_FULL_EXCEL_SUMMARY__;init={...init,body:JSON.stringify(body)}}}catch(e){console.warn('TaskFlow Excel payload:',e)}return nativeFetch(input,init)};
attach();new MutationObserver(attach).observe(document.documentElement,{childList:true,subtree:true});
})();
