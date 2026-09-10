/* TaskFlow AI Data Layer
 * Read-only normalization layer over the existing Firebase Realtime Database.
 * It does NOT change tasks, members, or daily_logs and does not replace the current UI.
 */
(function (global) {
  'use strict';

  const AI_DATA_LAYER_VERSION = '1.0.0';

  function safeDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  function normalizeTask(task) {
    if (!task) return null;
    return {
      id: task.firebaseKey || null,
      title: task.title || '',
      description: task.desc || '',
      memberKey: task.memberKey || null,
      priority: task.priority || '',
      status: task.status || 'Pending',
      start: safeDate(task.start),
      due: safeDate(task.due),
      progress: Number.isFinite(Number(task.progress)) ? Number(task.progress) : 0
    };
  }

  function normalizeMember(member) {
    if (!member) return null;
    return {
      id: member.firebaseKey || null,
      name: member.name || '',
      role: member.role || '',
      type: member.type || 'Employee',
      status: member.status || 'active'
    };
  }

  function normalizeDailyLog(log) {
    if (!log) return null;
    return {
      id: log.firebaseKey || null,
      memberKey: log.memberKey || null,
      memberName: log.memberName || '',
      text: log.text || '',
      timestamp: safeDate(log.timestamp)
    };
  }

  function getRawState() {
    return {
      tasks: Array.isArray(global.tasks) ? global.tasks : [],
      members: Array.isArray(global.members) ? global.members : [],
      dailyLogs: Array.isArray(global.dailyLogs) ? global.dailyLogs : [],
      currentUserId: global.currentUserId || null
    };
  }

  function buildContext(options) {
    const raw = getRawState();
    const members = raw.members.map(normalizeMember).filter(Boolean);
    const tasks = raw.tasks.map(normalizeTask).filter(Boolean);
    const dailyLogs = raw.dailyLogs.map(normalizeDailyLog).filter(Boolean);
    const memberById = Object.fromEntries(members.map(m => [m.id, m]));

    const enrichedTasks = tasks.map(t => ({
      ...t,
      assignee: memberById[t.memberKey] || null
    }));

    const now = new Date();
    const overdue = enrichedTasks.filter(t => {
      if (t.status === 'Completed') return false;
      const due = t.due ? new Date(t.due) : null;
      return due && !Number.isNaN(due.getTime()) && due < now;
    });

    const byMember = {};
    enrichedTasks.forEach(t => {
      const key = t.memberKey || 'unassigned';
      if (!byMember[key]) byMember[key] = { total: 0, completed: 0, overdue: 0, inProgress: 0, pending: 0 };
      byMember[key].total++;
      if (t.status === 'Completed') byMember[key].completed++;
      else if (t.status === 'In Progress') byMember[key].inProgress++;
      else if (t.status === 'Pending') byMember[key].pending++;
      if (overdue.some(x => x.id === t.id)) byMember[key].overdue++;
    });

    const employeePerformance = members.map(m => ({
      ...m,
      ...(byMember[m.id] || { total: 0, completed: 0, overdue: 0, inProgress: 0, pending: 0 }),
      completionRate: byMember[m.id] && byMember[m.id].total
        ? Math.round((byMember[m.id].completed / byMember[m.id].total) * 100)
        : 0
    }));

    const context = {
      version: AI_DATA_LAYER_VERSION,
      generatedAt: now.toISOString(),
      currentUserId: raw.currentUserId,
      summary: {
        totalTasks: enrichedTasks.length,
        completed: enrichedTasks.filter(t => t.status === 'Completed').length,
        inProgress: enrichedTasks.filter(t => t.status === 'In Progress').length,
        pending: enrichedTasks.filter(t => t.status === 'Pending').length,
        overdue: overdue.length,
        members: members.length,
        dailyLogs: dailyLogs.length
      },
      tasks: enrichedTasks,
      overdueTasks: overdue,
      members,
      employeePerformance,
      dailyLogs
    };

    if (options && options.includeRaw === true) context.raw = raw;
    return context;
  }

  function getManagerContext() {
    return buildContext({ includeRaw: false });
  }

  function getMyContext() {
    const context = buildContext({ includeRaw: false });
    const myId = context.currentUserId;
    if (!myId) return context;

    const myTasks = context.tasks.filter(t => t.memberKey === myId);
    const myLogs = context.dailyLogs.filter(l => l.memberKey === myId);
    const myPerformance = context.employeePerformance.filter(m => m.id === myId);

    return {
      ...context,
      tasks: myTasks,
      overdueTasks: myTasks.filter(t => context.overdueTasks.some(o => o.id === t.id)),
      dailyLogs: myLogs,
      employeePerformance: myPerformance,
      summary: {
        ...context.summary,
        totalTasks: myTasks.length,
        completed: myTasks.filter(t => t.status === 'Completed').length,
        inProgress: myTasks.filter(t => t.status === 'In Progress').length,
        pending: myTasks.filter(t => t.status === 'Pending').length,
        overdue: myTasks.filter(t => context.overdueTasks.some(o => o.id === t.id)).length
      }
    };
  }

  global.TaskFlowAIData = {
    version: AI_DATA_LAYER_VERSION,
    buildContext,
    getManagerContext,
    getMyContext,
    normalizeTask,
    normalizeMember,
    normalizeDailyLog
  };

  // Optional diagnostic event. No data is written to Firebase.
  global.dispatchEvent(new CustomEvent('taskflow-ai-data-ready', {
    detail: { version: AI_DATA_LAYER_VERSION }
  }));
})(window);
