(()=> {
  if (window.__TASKFLOW_OVERDUE_REMINDERS__) return;
  window.__TASKFLOW_OVERDUE_REMINDERS__ = true;

  const css = `
    #tf-overdue-card{margin:14px 0;border:1px solid #b91c1c;background:linear-gradient(135deg,rgba(127,29,29,.22),rgba(30,20,28,.95));border-radius:14px;padding:16px}
    #tf-overdue-card .tf-overdue-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}
    #tf-overdue-card h3{margin:0;color:#ff9aa5;font-size:15px}
    #tf-overdue-card .tf-overdue-count{background:#7f1d1d;color:#fff;border-radius:999px;padding:4px 10px;font-weight:800;font-size:12px}
    #tf-overdue-card .tf-overdue-item{padding:9px 0;border-top:1px solid rgba(255,255,255,.09);display:flex;justify-content:space-between;gap:12px;font-size:13px}
    #tf-overdue-card .tf-overdue-meta{color:#fca5a5;font-size:11px;white-space:nowrap}
    #tf-overdue-card .tf-overdue-empty{color:var(--muted);font-size:13px}
    html.tf-day #tf-overdue-card{background:#fff7f7;color:#18202b;border-color:#fecaca}
    html.tf-day #tf-overdue-card .tf-overdue-item{border-color:#fee2e2}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const todayKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };
  const overdueTasks = () => {
    const me = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const all = Array.isArray(window.tasks) ? window.tasks : [];
    if (!me || !me.firebaseKey) return [];
    return all.filter(t => {
      const status = String(t.status || '').toLowerCase();
      const due = String(t.due || '').slice(0,10);
      const visible = me.type === 'Manager' || t.memberKey === me.firebaseKey;
      return visible && due && due < todayKey() && status !== 'completed';
    }).sort((a,b) => String(a.due).localeCompare(String(b.due)));
  };
  const showToast = (count) => {
    const el = document.getElementById('toast');
    if (!el || !count) return;
    el.className = 'toast show tf-error';
    el.textContent = 'تنبيه: لديك ' + count + ' ' + (count === 1 ? 'مهمة متأخرة' : 'مهام متأخرة') + ' تحتاج إلى المتابعة.';
    if (window.__tfOverdueToastTimer) clearTimeout(window.__tfOverdueToastTimer);
    window.__tfOverdueToastTimer = setTimeout(() => el.classList.remove('show'), 6500);
  };
  let previousSignature = '';
  let hasShownInitial = false;
  function render() {
    const dashboard = document.getElementById('dashboard');
    const kpis = document.getElementById('kpis');
    if (!dashboard || !kpis) return;
    let card = document.getElementById('tf-overdue-card');
    if (!card) {
      card = document.createElement('section');
      card.id = 'tf-overdue-card';
      kpis.insertAdjacentElement('afterend', card);
    }
    const list = overdueTasks();
    const signature = list.map(t => t.firebaseKey + ':' + t.due).join('|');
    card.innerHTML = '<div class="tf-overdue-head"><h3>⚠️ تذكير بالمهام المتأخرة</h3><span class="tf-overdue-count">' + list.length + ' متأخرة</span></div>' +
      (list.length ? list.slice(0,8).map(t => {
        const owner = Array.isArray(window.members) ? window.members.find(m => m.firebaseKey === t.memberKey) : null;
        const days = Math.max(1, Math.floor((new Date(todayKey()+'T00:00:00') - new Date(String(t.due).slice(0,10)+'T00:00:00')) / 86400000));
        return '<div class="tf-overdue-item"><span><b>' + escapeHtml(t.title || 'مهمة بدون عنوان') + '</b>' + (window.getCurrentUser()?.type === 'Manager' ? '<div class="meta">' + escapeHtml(owner?.name || 'غير محدد') + '</div>' : '') + '</span><span class="tf-overdue-meta">متأخرة ' + days + ' يوم</span></div>';
      }).join('') + (list.length > 8 ? '<div class="meta">و' + (list.length-8) + ' مهام أخرى…</div>' : '') : '<div class="tf-overdue-empty">لا توجد مهام متأخرة حاليًا. أحسنت! 🎉</div>') +
      (list.length ? '<button type="button" class="btn danger" id="tf-overdue-open" style="margin-top:12px">عرض المهام المتأخرة</button>' : '');
    const open = document.getElementById('tf-overdue-open');
    if (open) open.onclick = () => {
      const nav = document.getElementById('nav_tasks');
      if (nav) nav.click();
      const filter = document.getElementById('statusFilter');
      if (filter) { filter.value = ''; if (typeof window.renderTasks === 'function') window.renderTasks(); }
    };
    if (signature && signature !== previousSignature && (hasShownInitial || previousSignature !== '')) showToast(list.length);
    previousSignature = signature;
    hasShownInitial = true;
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function boot() {
    render();
    if (!window.__tfOverdueInterval) window.__tfOverdueInterval = setInterval(render, 20000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  [300, 900, 2000, 4000].forEach(ms => setTimeout(render, ms));
})();