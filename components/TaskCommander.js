import React, { useState, useEffect, useMemo } from 'react';

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  inputSection: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#1E5F74',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    backgroundColor: '#C85A54',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  tasksSection: {
    marginBottom: '1.5rem',
  },
  taskList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  taskItem: {
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderLeft: '4px solid #ccc',
    borderRadius: '4px',
  },
  taskContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pill: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    color: 'white',
    fontWeight: 600,
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  calendarDay: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.5rem',
    backgroundColor: '#fafafa',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column',
  },
  capacityBar: {
    height: '6px',
    backgroundColor: '#eee',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '0.25rem',
  },
};

// Duration options (minutes)
const DURATION_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: '8 hours', value: 480 },
];

// Travel time options (minutes) — per spec
const TRAVEL_OPTIONS = [
  { label: 'None', value: 0 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '4 hours', value: 240 },
  { label: '8 hours', value: 480 },
  { label: '24 hours', value: 1440 },
];

const PRIORITIES = [
  { name: 'High', color: '#C85A54' },
  { name: 'Medium', color: '#D4A574' },
  { name: 'Low', color: '#2F5233' },
];

// Day capacity in minutes — 8h Mon–Fri, 5h Sat (6am–11am end)
const DAY_CAPACITY = {
  Mon: 480,
  Tue: 480,
  Wed: 480,
  Thu: 480,
  Fri: 480,
  Sat: 300,
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Returns Monday of the week containing the given date (local time)
const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const isoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatMins = (mins) => {
  if (!mins) return '0h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const TaskCommander = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('Beachhead');
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [selectedTravel, setSelectedTravel] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const organizations = [
    { name: 'Beachhead', color: '#1E5F74' },
    { name: 'CulmPoint', color: '#8B4513' },
    { name: '1stWave', color: '#0047AB' },
    { name: 'MPL', color: '#2F5233' },
    { name: 'IRG', color: '#1A1816' },
    { name: 'Acme1', color: '#4A4A4A' },
    { name: 'Acme2', color: '#696969' },
    { name: 'Personal', color: '#D4A574' },
    { name: 'Divorce', color: '#C85A54' },
    { name: 'Army', color: '#556270' },
  ];

  const timeframes = ['Today', 'This Week', 'This Month', 'Q2 2026', 'Backlog'];

  const fitnessSchedule = [
    { day: 'Monday', time: '5:30am', activity: 'Running' },
    { day: 'Monday', time: '12:00pm', activity: 'Gym' },
    { day: 'Tuesday', time: '12:00pm', activity: 'Gym' },
    { day: 'Wednesday', time: '5:30am', activity: 'Running' },
    { day: 'Wednesday', time: '12:00pm', activity: 'Gym' },
    { day: 'Thursday', time: '12:00pm', activity: 'Gym' },
    { day: 'Friday', time: '5:30am', activity: 'Running' },
    { day: 'Friday', time: '12:00pm', activity: 'Gym' },
    { day: 'Saturday', time: '5:30am', activity: 'Running' },
    { day: 'Saturday', time: '12:00pm', activity: 'Gym' },
    { day: 'Sunday', time: 'Rest day', activity: 'Recovery' },
  ];

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/.netlify/functions/sync-tasks', {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        } else {
          setError('');
        }
      } catch (err) {
        setError('');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const persist = async (updatedTasks) => {
    try {
      await fetch('/.netlify/functions/sync-tasks', {
        method: 'POST',
        body: JSON.stringify({ tasks: updatedTasks }),
      });
    } catch (err) {
      // soft-fail; UI state remains
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask,
      org: selectedOrg,
      timeframe: selectedTimeframe,
      duration: Number(selectedDuration),
      priority: selectedPriority,
      travelTime: Number(selectedTravel),
      scheduledDate: null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    setNewTask('');
    persist(updatedTasks);
  };

  const updateTask = (id, patch) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, ...patch } : t));
    setTasks(updated);
    persist(updated);
  };

  const toggleTask = (id) => {
    const t = tasks.find(x => x.id === id);
    updateTask(id, { completed: !t.completed });
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    persist(updated);
  };

  // Calendar: Mon-Sat for current week + offset
  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date());
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(
    () => DAY_LABELS.map((label, i) => {
      const date = addDays(weekStart, i);
      return { label, date, iso: isoDate(date) };
    }),
    [weekStart]
  );

  // Group tasks by scheduledDate within current week
  const tasksByDay = useMemo(() => {
    const map = {};
    weekDays.forEach(d => { map[d.iso] = []; });
    tasks.forEach(t => {
      if (t.scheduledDate && map[t.scheduledDate]) {
        map[t.scheduledDate].push(t);
      }
    });
    return map;
  }, [tasks, weekDays]);

  const dayLoad = (iso) => {
    const list = tasksByDay[iso] || [];
    return list.reduce((sum, t) => sum + (t.duration || 0) + (t.travelTime || 0), 0);
  };

  const orgColor = (name) =>
    organizations.find(o => o.name === name)?.color || '#999';
  const priorityColor = (name) =>
    PRIORITIES.find(p => p.name === name)?.color || '#999';

  // CSV export — Google Calendar import format
  const escapeCSV = (value) => {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const formatCalendarDate = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}/${dd}/${date.getFullYear()}`;
  };

  const dueDateForTimeframe = (timeframe) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (timeframe === 'Today') return d;
    if (timeframe === 'This Week') {
      const day = d.getDay();
      const offset = day === 0 ? 0 : 7 - day;
      d.setDate(d.getDate() + offset);
      return d;
    }
    if (timeframe === 'This Month') {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
    if (typeof timeframe === 'string' && /^Q[1-4]\s+\d{4}$/.test(timeframe)) {
      const [q, yearStr] = timeframe.split(/\s+/);
      const quarter = Number(q.slice(1));
      const year = Number(yearStr);
      const endMonth = quarter * 3;
      return new Date(year, endMonth, 0);
    }
    return null;
  };

  const minutesToHHMM = (mins) => {
    const total = Math.max(0, mins);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const hh = String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hh}:${mm} ${ampm}`;
  };

  const exportTasksAsCSV = () => {
    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }

    const headers = [
      'Subject',
      'Start Date',
      'Start Time',
      'End Date',
      'End Time',
      'All Day Event',
      'Description',
    ];

    const rows = tasks.map(task => {
      let startDate;
      if (task.scheduledDate) {
        const [y, m, d] = task.scheduledDate.split('-').map(Number);
        startDate = new Date(y, m - 1, d);
      } else {
        startDate = dueDateForTimeframe(task.timeframe);
      }
      const dateStr = startDate ? formatCalendarDate(startDate) : '';
      const startMins = 9 * 60; // 09:00 default block start
      const duration = Number(task.duration || 30);
      const travel = Number(task.travelTime || 0);
      const endMins = startMins + duration + travel;
      const allDay = task.scheduledDate ? 'False' : 'True';

      const description = [
        `Organization: ${task.org}`,
        `Priority: ${task.priority || 'Medium'}`,
        `Duration: ${formatMins(duration)}`,
        `Travel: ${formatMins(travel)}`,
        `Timeframe: ${task.timeframe}`,
        `Status: ${task.completed ? 'Completed' : 'Pending'}`,
      ].join(' | ');

      return [
        `[${task.org}] ${task.title}`,
        dateStr,
        minutesToHHMM(startMins),
        dateStr,
        minutesToHHMM(endMins),
        allDay,
        description,
      ].map(escapeCSV).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskCommander-Calendar-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredTasks = tasks.filter(t => t.timeframe === selectedTimeframe);

  const weekRangeLabel = `${weekDays[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[5].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div style={styles.container}>
      <h1>TASK COMMANDER</h1>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div style={styles.inputSection}>
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          style={styles.input}
        />
        <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)} style={styles.select}>
          {organizations.map(org => (
            <option key={org.name} value={org.name}>{org.name}</option>
          ))}
        </select>
        <select value={selectedTimeframe} onChange={(e) => setSelectedTimeframe(e.target.value)} style={styles.select}>
          {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
        </select>
        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(Number(e.target.value))}
          style={styles.select}
          title="Duration"
        >
          {DURATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>⏱ {opt.label}</option>
          ))}
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={styles.select}
          title="Priority"
        >
          {PRIORITIES.map(p => (
            <option key={p.name} value={p.name}>🚩 {p.name}</option>
          ))}
        </select>
        <select
          value={selectedTravel}
          onChange={(e) => setSelectedTravel(Number(e.target.value))}
          style={styles.select}
          title="Travel time"
        >
          {TRAVEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>🚗 {opt.label}</option>
          ))}
        </select>
        <button onClick={addTask} style={styles.button}>➕ Add</button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={exportTasksAsCSV}
          style={{ ...styles.button, backgroundColor: '#2F5233', fontSize: '0.9rem' }}
        >
          📥 Export Tasks to CSV
        </button>
        <span style={{ fontSize: '0.85rem', color: '#666', alignSelf: 'center' }}>
          (Google Calendar import — calendar.google.com → Settings → Import & export)
        </span>
      </div>

      {/* CALENDAR */}
      <div style={styles.tasksSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>📅 Calendar — {weekRangeLabel}</h2>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ ...styles.button, padding: '0.25rem 0.6rem' }}>◀</button>
          <button onClick={() => setWeekOffset(0)} style={{ ...styles.button, padding: '0.25rem 0.6rem', backgroundColor: '#666' }}>Today</button>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ ...styles.button, padding: '0.25rem 0.6rem' }}>▶</button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
          Mon–Fri: 8 hr cap · Sat: 5 hr cap (week ends Sat 11am) · includes travel time
        </p>

        <div style={styles.calendarGrid}>
          {weekDays.map(({ label, date, iso }) => {
            const cap = DAY_CAPACITY[label];
            const load = dayLoad(iso);
            const pct = Math.min(100, Math.round((load / cap) * 100));
            const over = load > cap;
            return (
              <div key={iso} style={styles.calendarDay}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ color: '#000', fontWeight: 700 }}>{label}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: over ? '#C85A54' : '#666' }}>
                  {formatMins(load)} / {formatMins(cap)} {over && '⚠ over'}
                </div>
                <div style={styles.capacityBar}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: over ? '#C85A54' : '#1E5F74',
                  }} />
                </div>
                <ul style={{ ...styles.taskList, marginTop: '0.5rem', flex: 1 }}>
                  {(tasksByDay[iso] || []).map(t => (
                    <li key={t.id} style={{
                      fontSize: '0.8rem',
                      padding: '0.3rem',
                      marginBottom: '0.25rem',
                      backgroundColor: 'white',
                      borderLeft: `3px solid ${orgColor(t.org)}`,
                      borderRadius: '3px',
                    }}>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ ...styles.pill, backgroundColor: priorityColor(t.priority), fontSize: '0.65rem' }}>
                          {t.priority || 'Med'}
                        </span>
                        <span style={{ flex: 1 }}>{t.title}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>
                        {formatMins(t.duration)}
                        {t.travelTime ? ` · 🚗 ${formatMins(t.travelTime)}` : ''}
                      </div>
                      <button
                        onClick={() => updateTask(t.id, { scheduledDate: null })}
                        style={{ ...styles.deleteButton, fontSize: '0.65rem', padding: '0.1rem 0.35rem', marginTop: '0.2rem' }}
                      >
                        unschedule
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* TASK LIST */}
      <div style={styles.tasksSection}>
        <h2>{selectedTimeframe} ({filteredTasks.length})</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ color: '#999' }}>No tasks for {selectedTimeframe}</p>
        ) : (
          <ul style={styles.taskList}>
            {filteredTasks.map(task => (
              <li
                key={task.id}
                style={{
                  ...styles.taskItem,
                  borderLeftColor: orgColor(task.org),
                  opacity: task.completed ? 0.6 : 1,
                }}
              >
                <div style={styles.taskContent}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1,
                    minWidth: '160px',
                  }}>
                    {task.title}
                  </span>
                  <span style={{ ...styles.pill, backgroundColor: orgColor(task.org) }}>
                    {task.org}
                  </span>
                  <span style={{ ...styles.pill, backgroundColor: priorityColor(task.priority) }}>
                    {task.priority || 'Medium'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#444' }}>
                    ⏱ {formatMins(task.duration || 0)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#444' }}>
                    🚗 {formatMins(task.travelTime || 0)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: '#444' }}>Priority:</label>
                  <select
                    value={task.priority || 'Medium'}
                    onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                    style={{ ...styles.select, padding: '0.25rem' }}
                  >
                    {PRIORITIES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>

                  <label style={{ fontSize: '0.8rem', color: '#444' }}>Duration:</label>
                  <select
                    value={task.duration || 60}
                    onChange={(e) => updateTask(task.id, { duration: Number(e.target.value) })}
                    style={{ ...styles.select, padding: '0.25rem' }}
                  >
                    {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <label style={{ fontSize: '0.8rem', color: '#444' }}>Travel:</label>
                  <select
                    value={task.travelTime || 0}
                    onChange={(e) => updateTask(task.id, { travelTime: Number(e.target.value) })}
                    style={{ ...styles.select, padding: '0.25rem' }}
                  >
                    {TRAVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <label style={{ fontSize: '0.8rem', color: '#444' }}>Schedule:</label>
                  <select
                    value={task.scheduledDate || ''}
                    onChange={(e) => updateTask(task.id, { scheduledDate: e.target.value || null })}
                    style={{ ...styles.select, padding: '0.25rem' }}
                  >
                    <option value="">— unscheduled —</option>
                    {weekDays.map(d => (
                      <option key={d.iso} value={d.iso}>
                        {d.label} {d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => deleteTask(task.id)}
                    style={styles.deleteButton}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ ...styles.tasksSection, marginTop: '2rem' }}>
        <h2>📋 FITNESS SCHEDULE (Locked)</h2>
        <ul style={styles.taskList}>
          {fitnessSchedule.map((item, idx) => (
            <li key={idx} style={{ ...styles.taskItem, borderLeftColor: '#D4A574' }}>
              <div style={styles.taskContent}>
                <span style={{ fontWeight: 700, color: '#000', minWidth: '120px' }}>{item.day}</span>
                <span style={{ color: '#666' }}>{item.time} — {item.activity}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '0.9rem',
      }}>
        <strong>📊 Data Storage:</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          <li>✅ Tasks: Saved to GitHub</li>
          <li>✅ Backup: CSV export available</li>
          <li>📅 Calendar: Manual import via CSV</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskCommander;
