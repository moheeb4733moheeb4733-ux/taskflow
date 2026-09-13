(()=>{
'use strict';
if(window.__TASKFLOW_AI_EXCEL_FULL__)return;
window.__TASKFLOW_AI_EXCEL_FULL__=true;

const INPUT_ID='tfai-excel-file';
const API_PATH='/api/ai';
let fullSummary='';

function loadXlsx(){
  return new Promise((resolve,reject)=>{
    if(window.XLSX)return resolve(window.XLSX);
    const old=document.querySelector('script[data-taskflow-xlsx]');
    if(old){old.addEventListener('load',()=>resolve(window.XLSX));old.addEventListener('error',()=>reject(new Error('XLSX load failed')));return;}
    const s=document.createElement('script');
    s.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    s.dataset.taskflowXlsx='true';
    s.onload=()=>resolve(window.XLSX);
    s.onerror=()=>reject(new Error('XLSX load failed'));
    document.head.appendChild(s);
  });
}

function text(v){return v===null||v===undefined?'':String(v).trim()}
function isBlank(v){return v===null||v===undefined||text(v)===''}
function safe(v){return text(v).slice(0,160)}
function sensitiveHeader(h){
  const s=text(h).toLowerCase();
  return /هاتف|phone|جوال|mobile|مرجع|reference|رقم المهمة|task.?id|رقم$|id$/.test(s);
}
function numericStats(values){
  const nums=values.map(v=>Number(String(v).replace(/,/g,''))).filter(Number.isFinite);
  if(!nums.length)return null;
  const sum=nums.reduce((a,b)=>a+b,0);
  return {count:nums.length,min:Math.min(...nums),max:Math.max(...nums),sum,average:Number((sum/nums.length).toFixed(2))};
}

function aggregate(rows,headers,fileName){
  const total=rows.length;
  const columnStats={};
  const usableHeaders=headers.filter(h=>text(h));
  usableHeaders.forEach(h=>{
    const vals=rows.map(r=>r[h]);
    const nonBlank=vals.filter(v=>!isBlank(v));
    const distinct=new Set(nonBlank.map(v=>safe(v)));
    const stat={rows:total,nonBlank:nonBlank.length,blank:total-nonBlank.length,distinct:distinct.size};
    const ns=numericStats(nonBlank);
    if(ns)stat.numeric=ns;
    if(!sensitiveHeader(h)){
      const counts=new Map();
      nonBlank.forEach(v=>{const k=safe(v);counts.set(k,(counts.get(k)||0)+1)});
      stat.topValues=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,50).map(([value,count])=>({value,count}));
    }
    columnStats[h]=stat;
  });

  const groupable=usableHeaders.filter(h=>!sensitiveHeader(h));
  const groups={};
  groupable.forEach(groupCol=>{
    const freq=new Map();
    rows.forEach(r=>{const k=safe(r[groupCol]);if(k)freq.set(k,(freq.get(k)||0)+1)});
    const top=[...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,100);
    groups[groupCol]={totalGroups:freq.size,topGroups:top.map(([value,count])=>{
      const subset=rows.filter(r=>safe(r[groupCol])===value);
      const missing={};
      usableHeaders.forEach(h=>{if(!sensitiveHeader(h))missing[h]=subset.reduce((n,r)=>n+(isBlank(r[h])?1:0),0)});
      return {value,count,missing};
    })};
  });

  const missingByColumn=Object.fromEntries(usableHeaders.map(h=>[h,columnStats[h].blank]));
  const summary={
    version:'2.0.0-full-aggregation',
    fileName,
    rows:total,
    columns:usableHeaders,
    note:'هذه النتائج محسوبة من جميع صفوف الملف داخل المتصفح. لا يتم إرسال الصفوف الخام إلى الخادم.',
    missingByColumn,
    columnStats,
    groups
  };
  return JSON.stringify(summary);
}

async function processFile(file){
  const status=document.getElementById('tfai-excel-status');
  try{
    const XLSX=await loadXlsx();
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheet=wb.Sheets[wb.SheetNames[0]];
    if(!sheet)throw new Error('لا توجد ورقة بيانات');
    const rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false});
    const headers=rows.length?Object.keys(rows[0]):(XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false})[0]||[]);
    fullSummary=aggregate(rows,headers,file.name);
    window.__TASKFLOW_FULL_EXCEL_SUMMARY__=fullSummary;
    if(status){status.className='tfai-excel-status ok';status.textContent=`✓ تم تحليل «${file.name}» بالكامل — ${rows.length.toLocaleString('ar-YE')} صف · ${headers.length} أعمدة. تم تجهيز التجميع الكامل للتحليل.`;}
    const toast=window.tfToast||window.toast;
    if(typeof toast==='function')toast('تم تجهيز التحليل الكامل لجميع صفوف Excel');
  }catch(e){
    fullSummary='';
    window.__TASKFLOW_FULL_EXCEL_SUMMARY__='';
    console.error('TaskFlow full Excel aggregation error',e);
    if(status)status.textContent='تعذر تحليل الملف بالكامل. تأكد أنه Excel أو CSV صالح.';
  }
}

function attach(){
  const input=document.getElementById(INPUT_ID);
  if(!input||input.dataset.fullAggregationAttached==='true')return;
  input.dataset.fullAggregationAttached='true';
  input.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)processFile(file)},false);
}

const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.includes(API_PATH)&&init&&typeof init.body==='string'){
      const body=JSON.parse(init.body);
      if(fullSummary||window.__TASKFLOW_FULL_EXCEL_SUMMARY__)body.excelSummary=fullSummary||window.__TASKFLOW_FULL_EXCEL_SUMMARY__;
      init={...init,body:JSON.stringify(body)};
    }
  }catch(e){console.warn('TaskFlow AI Excel payload guard:',e)}
  return originalFetch(input,init);
};

attach();
const observer=new MutationObserver(attach);
observer.observe(document.documentElement,{childList:true,subtree:true});
})();
