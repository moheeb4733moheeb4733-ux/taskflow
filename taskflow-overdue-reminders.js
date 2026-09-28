/* TaskFlow overdue reminders - isolated module */
(function () {
  'use strict';
  if (window.__tfOverdueV2) return;
  window.__tfOverdueV2 = true;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day = () => { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const isOpen = t => !['completed','cancelled'].includes(String(t.status||'').toLowerCase());
  function overdue(t) { return !!t.due && String(t.due).slice(0,10) < day() && isOpen(t); }
  function current() { try { return getCurrentUser(); } catch(e) { return null; } }
  function render() {
    const me=current(), host=document.getElementById('dashboard');
    if(!me || !host || !Array.isArray(tasks)) return;
    let card=document.getElementById('tf-overdue-card');
    if(!card) {
      card=document.createElement('div'); card.id='tf-overdue-card';
      card.style.cssText='margin:16px 0;padding:16px;border:1px solid #a33;border-radius:12px;background:rgba(120,25,35,.13)';
      const anchor=host.querySelector('.sectionhead') || host.firstElementChild;
      if(anchor) anchor.insertAdjacentElement('afterend',card); else host.appendChild(card);
    }
    const visible = tasks.filter(t => me.type==='Manager' ? overdue(t) : (t.memberKey===me.firebaseKey && overdue(t)));
    const adminOpen = me.type==='Manager' ? tasks.filter(t => isOpen(t) && t.due && String(t.due).slice(0,10) <= day()) : [];
    const rows=visible.map(t=>{
      const owner=members.find(m=>m.firebaseKey===t.memberKey);
      return '<div style="display:flex;gap:12px;justify-content:space-between;align-items:center;padding:9px 0;border-top:1px solid #7335"><span><b>'+esc(t.title||'مهمة')+'</b><small style="display:block;opacity:.75">'+(me.type==='Manager'?esc(owner?.name||'غير محدد')+' · ':'')+'استحقاق: '+esc(t.due||'—')+'</small></span><b style="white-space:nowrap;color:#ff9da6">متأخرة</b></div>';
    }).join('');
    const adminRows=me.type==='Manager' ? adminOpen.map(t=>{
      const owner=members.find(m=>m.firebaseKey===t.memberKey);
      return '<div style="display:flex;gap:12px;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid #7335"><span><b>'+esc(t.title||'مهمة')+'</b><small style="display:block;opacity:.75">'+esc(owner?.name||'غير محدد')+' · '+esc(t.due||'بدون تاريخ')+' · '+esc(t.status||'Pending')+'</small></span><label style="display:flex;align-items:center;gap:6px;white-space:nowrap;font-size:12px"><input type="checkbox" '+(t.reminderEnabled===true?'checked':'')+' onchange="tfSetReminder(\''+esc(t.firebaseKey)+'\',this.checked)"> تفعيل التذكير</label></div>';
    }).join('') : '';
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 style="margin:0;color:#ff9da6">⚠️ تذكير بالمهام المتأخرة</h3><b>'+visible.length+'</b></div>'+
      (rows||'<p style="margin:10px 0 0;opacity:.75">لا توجد مهام متأخرة مسندة إليك.</p>')+
      (me.type==='Manager'?'<hr style="border:0;border-top:1px solid #7335;margin:16px 0"><h3 style="margin:0 0 8px">المهام السابقة غير المكتملة — تفعيل التذكير</h3>'+(adminRows||'<p style="opacity:.75">لا توجد مهام سابقة غير مكتملة.</p>'):'');
  }
  window.tfSetReminder=function(key,enabled){
    if(!key || !window.confirm(enabled?'تفعيل التذكير لهذه المهمة؟':'إيقاف التذكير لهذه المهمة؟')) { render(); return; }
    try { db.ref('tasks/'+key).update({reminderEnabled:!!enabled}).then(()=>{ if(typeof toast==='function') toast(enabled?'تم تفعيل التذكير للمهمة':'تم إيقاف التذكير للمهمة'); }); }
    catch(e) { alert('تعذر حفظ إعداد التذكير.'); render(); }
  };
  function init(){ render(); if(!window.__tfOverdueTimer) window.__tfOverdueTimer=setInterval(render,5000); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  [250,800,1600,3000].forEach(ms=>setTimeout(render,ms));
})();