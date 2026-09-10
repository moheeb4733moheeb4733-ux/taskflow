(function () {
  'use strict';

  if (window.__TASKFLOW_AI_WIDGET__) return;
  window.__TASKFLOW_AI_WIDGET__ = true;

  const style = document.createElement('style');
  style.textContent = `
    .tfai-fab{position:fixed;left:22px;bottom:22px;z-index:9998;border:1px solid #8b5cf6;background:linear-gradient(135deg,#635bff,#8b5cf6);color:#fff;border-radius:18px;padding:12px 16px;display:flex;align-items:center;gap:9px;font-weight:800;box-shadow:0 16px 40px rgba(0,0,0,.38);cursor:pointer;transition:.2s}
    .tfai-fab:hover{transform:translateY(-3px)}
    .tfai-fab .ico{width:32px;height:32px;border-radius:11px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:18px}
    .tfai-overlay{position:fixed;inset:0;background:rgba(0,0,0,.68);backdrop-filter:blur(7px);z-index:9999;display:none;align-items:center;justify-content:center;padding:18px}
    .tfai-overlay.show{display:flex}
    .tfai-modal{width:min(680px,100%);max-height:min(820px,92vh);overflow:hidden;background:#171a23;border:1px solid #2a2e3d;border-radius:24px;color:#f7f4f2;box-shadow:0 30px 90px rgba(0,0,0,.55);display:flex;flex-direction:column}
    .tfai-head{padding:20px 22px 15px;background:radial-gradient(circle at 15% 0,#382a63,transparent 55%),#171a23;border-bottom:1px solid #2a2e3d}
    .tfai-headrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .tfai-title{display:flex;align-items:center;gap:11px}.tfai-orb{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#635bff,#a78bfa);display:grid;place-items:center;font-size:20px;box-shadow:0 0 24px rgba(99,91,255,.3)}
    .tfai-title b{display:block;font-size:17px}.tfai-title small{display:block;color:#9ca3af;margin-top:2px;font-size:11px}
    .tfai-close{border:0;background:#2a2e3d;color:#fff;width:36px;height:36px;border-radius:50%;font-size:20px;cursor:pointer}
    .tfai-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.tfai-chip{border:1px solid #2a2e3d;background:#212635;color:#d1d5db;border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}.tfai-chip:hover{border-color:#8b5cf6;color:#fff}
    .tfai-body{padding:18px 22px;overflow:auto}.tfai-answer{white-space:pre-wrap;line-height:1.9;font-size:14px;min-height:42px}.tfai-status{color:#9ca3af;font-size:11px;margin-top:8px}
    .tfai-form{display:flex;gap:8px;margin-top:14px}.tfai-input{flex:1;min-width:0;background:#111319;color:#fff;border:1px solid #2a2e3d;border-radius:14px;padding:12px 13px;outline:none}.tfai-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.12)}.tfai-send{border:0;border-radius:14px;padding:0 17px;background:#635bff;color:#fff;font-weight:800;cursor:pointer}.tfai-send:disabled{opacity:.55;cursor:wait}
    .tfai-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:16px}.tfai-stat{background:#111319;border:1px solid #2a2e3d;border-radius:12px;padding:9px;text-align:center}.tfai-stat small{display:block;color:#9ca3af;font-size:10px}.tfai-stat b{display:block;font-size:18px;margin-top:3px}
    @media(max-width:600px){.tfai-fab{left:14px;bottom:14px;padding:10px 12px}.tfai-fab span.label{display:none}.tfai-modal{border-radius:20px}.tfai-head,.tfai-body{padding-left:15px;padding-right:15px}.tfai-summary{grid-template-columns:repeat(2,1fr)}.tfai-form{flex-direction:column}.tfai-send{height:46px}}
  `;
  document.head.appendChild(style);

  const fab = document.createElement('button');
  fab.className = 'tfai-fab';
  fab.type = 'button';
  fab.innerHTML = '<span class="ico">✦</span><span class="label">TaskFlow AI</span>';
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.className = 'tfai-overlay';
  overlay.innerHTML = `
    <section class="tfai-modal" role="dialog" aria-modal="true" aria-label="TaskFlow AI">
      <header class="tfai-head">
        <div class="tfai-headrow">
          <div class="tfai-title"><span class="tfai-orb">✦</span><div><b>TaskFlow AI</b><small>مساعد القرار والتحليل الذكي</small></div></div>
          <button class="tfai-close" type="button" aria-label="إغلاق">×</button>
        </div>
        <div class="tfai-chips">
          <button class="tfai-chip" data-q="ما أهم المهام التي تحتاج تدخلي الآن؟">ماذا أفعل الآن؟</button>
          <button class="tfai-chip" data-q="من الموظف الأكثر تأخراً وما السبب المحتمل؟">من الأكثر تأخراً؟</button>
          <button class="tfai-chip" data-q="قارن أداء الموظفين وحدد من يحتاج متابعة.">حلل أداء الفريق</button>
          <button class="tfai-chip" data-q="أعطني أهم المخاطر في المهام الحالية.">أهم المخاطر</button>
        </div>
      </header>
      <div class="tfai-body">
        <div class="tfai-summary">
          <div class="tfai-stat"><small>المهام</small><b id="tfaiTasks">—</b></div>
          <div class="tfai-stat"><small>المتأخرة</small><b id="tfaiOverdue">—</b></div>
          <div class="tfai-stat"><small>الموظفون</small><b id="tfaiMembers">—</b></div>
          <div class="tfai-stat"><small>السجلات</small><b id="tfaiLogs">—</b></div>
        </div>
        <div id="tfaiAnswer" class="tfai-answer" style="margin-top:16px">اسألني عن المهام، التأخير، أداء الموظفين، المخاطر، أو التقارير.</div>
        <div id="tfaiStatus" class="tfai-status"></div>
        <form class="tfai-form" id="tfaiForm">
          <input id="tfaiInput" class="tfai-input" autocomplete="off" placeholder="اكتب سؤالك هنا...">
          <button id="tfaiSend" class="tfai-send" type="submit">تحليل</button>
        </form>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const $ = id => document.getElementById(id);
  const answer = $('tfaiAnswer'), status = $('tfaiStatus'), input = $('tfaiInput'), send = $('tfaiSend');

  function getContext() {
    try {
      if (window.TaskFlowAIData && typeof window.TaskFlowAIData.getManagerContext === 'function') return window.TaskFlowAIData.getManagerContext();
      const tasks = Array.isArray(window.tasks) ? window.tasks : [];
      const members = Array.isArray(window.members) ? window.members : [];
      const dailyLogs = Array.isArray(window.dailyLogs) ? window.dailyLogs : [];
      return { summary:{totalTasks:tasks.length,members:members.length,dailyLogs:dailyLogs.length}, tasks, members, dailyLogs };
    } catch (_) { return {summary:{}}; }
  }

  function refreshSummary() {
    const c = getContext();
    const s = c.summary || {};
    $('tfaiTasks').textContent = s.totalTasks ?? (c.tasks || []).length;
    $('tfaiOverdue').textContent = s.overdue ?? (c.overdueTasks || []).length;
    $('tfaiMembers').textContent = s.members ?? (c.members || []).length;
    $('tfaiLogs').textContent = s.dailyLogs ?? (c.dailyLogs || []).length;
  }

  async function ask(question) {
    const q = String(question || '').trim();
    if (!q) return;
    send.disabled = true;
    status.textContent = 'جاري تحليل بيانات TaskFlow...';
    answer.textContent = 'أفحص المهام والأعضاء والسجلات ثم أبني التوصية...';
    try {
      const context = getContext();
      const res = await fetch('/api/ai', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context,excelSummary:{}})});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      answer.textContent = data.answer || 'لم يصل رد من المساعد.';
      status.textContent = 'تم التحليل من بيانات TaskFlow الحالية.';
    } catch (err) {
      answer.textContent = 'تعذر تشغيل التحليل الذكي الآن.';
      status.textContent = err.message === 'AI backend is not configured yet' ? 'Backend يعمل، لكن مفتاح Gemini غير مضبوط في Production.' : `خطأ: ${err.message}`;
    } finally { send.disabled = false; }
  }

  fab.addEventListener('click', () => { refreshSummary(); overlay.classList.add('show'); setTimeout(() => input.focus(), 80); });
  overlay.querySelector('.tfai-close').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('show'); });
  overlay.querySelectorAll('.tfai-chip').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.q; ask(b.dataset.q); }));
  $('tfaiForm').addEventListener('submit', e => { e.preventDefault(); ask(input.value); });

  window.addEventListener('taskflow-ai-data-ready', refreshSummary);
  setTimeout(refreshSummary, 1200);
})();
