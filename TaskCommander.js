import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Calendar, Clock, User } from 'lucide-react';

const TaskCommander = () => {
  const ORGANIZATIONS = {
    'Beachhead': { color: '#1E5F74', label: 'Beachhead Logistics', shorthand: 'BHL' },
    'CulmPoint': { color: '#8B4513', label: 'Culmination Point', shorthand: 'CP' },
    '1stWave': { color: '#0047AB', label: '1st Wave', shorthand: '1W' },
    'MPL': { color: '#2F5233', label: 'Meridian Project Logistics', shorthand: 'MPL' },
    'IRG': { color: '#1A1816', label: 'Ironbark Response Group', shorthand: 'IRG' },
    'Acme1': { color: '#4A4A4A', label: 'Acme 1', shorthand: 'A1' },
    'Acme2': { color: '#696969', label: 'Acme 2', shorthand: 'A2' },
    'Personal': { color: '#D4A574', label: 'Personal & Fitness', shorthand: 'PF' },
    'Divorce': { color: '#C85A54', label: 'Divorce / Legal', shorthand: 'DIV' },
    'Army': { color: '#556270', label: 'ADF Reserve', shorthand: 'ADF' },
  };

  const [tasks, setTasks] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    week: true,
    longterm: true,
  });

  const [newTask, setNewTask] = useState({
    title: '',
    org: 'Beachhead',
    hours: 1,
    timeframe: 'today',
    assignee: 'Self',
    description: '',
    priority: 'normal',
  });

  const [syncStatus, setSyncStatus] = useState('idle');

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        hours: parseFloat(newTask.hours || 0),
        createdAt: new Date().toISOString(),
      };
      saveTasks([...tasks, task]);
      setNewTask({
        title: '',
        org: 'Beachhead',
        hours: 1,
        timeframe: 'today',
        assignee: 'Self',
        description: '',
        priority: 'normal',
      });
      setShowNewTask(false);
    }
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const syncToCalendar = async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync-and-notify',
          tasks: tasks,
          calendarId: process.env.REACT_APP_TASK_CALENDAR_ID,
          baileyEmail: process.env.REACT_APP_BAILEY_EMAIL,
        }),
      });

      const data = await response.json();
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed:', error);
    }
  };

  const getTotalHours = (timeframe) => {
    return tasks
      .filter(t => t.timeframe === timeframe)
      .reduce((sum, t) => sum + parseFloat(t.hours || 0), 0);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const TaskCard = ({ task }) => {
    const org = ORGANIZATIONS[task.org];
    const priorityColor = {
      critical: '#FF4444',
      high: '#FF9800',
      normal: org.color,
      low: '#9E9E9E',
    }[task.priority];

    return (
      <div
        style={{
          padding: '12px',
          background: '#0a0e27',
          border: `1px solid #2a3f5f`,
          borderLeft: `4px solid ${priorityColor}`,
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span
              style={{
                padding: '4px 8px',
                background: org.color,
                color: 'white',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              {org.shorthand}
            </span>
            <strong>{task.title}</strong>
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            style={{ background: 'transparent', border: 'none', color: '#9E9E9E', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        {task.description && (
          <p style={{ margin: '8px 0', fontSize: '11px', color: '#9E9E9E' }}>{task.description}</p>
        )}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#9E9E9E' }}>
          <span>⏱ {task.hours}h</span>
          {task.assignee !== 'Self' && <span>👤 {task.assignee}</span>}
          <span style={{ color: priorityColor, fontWeight: '700' }}>{task.priority.toUpperCase()}</span>
        </div>
      </div>
    );
  };

  const TaskSection = ({ title, emoji, timeframe }) => {
    const sectionTasks = tasks.filter(t => t.timeframe === timeframe);
    const isExpanded = expandedSections[timeframe];
    const totalHours = getTotalHours(timeframe);

    return (
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => toggleSection(timeframe)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(90deg, #1a1f3a 0%, #2a3f5f 100%)',
            border: '1px solid #2a3f5f',
            color: '#e8eaf6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>▼</span>
          <span>{emoji} {title}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '11px' }}>
            <span>{sectionTasks.length} tasks</span>
            <span style={{ color: '#1E5F74', fontWeight: '700' }}>{totalHours}h</span>
          </div>
        </button>
        {isExpanded && (
          <div style={{ padding: '12px', background: 'rgba(42, 63, 95, 0.3)', border: '1px solid #2a3f5f', borderTop: 'none' }}>
            {sectionTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9E9E9E', fontSize: '11px' }}>
                No tasks scheduled
              </div>
            ) : (
              sectionTasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        )}
      </div>
    );
  };

  const NewTaskForm = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{ background: '#1a1f3a', border: '2px solid #2a3f5f', padding: '20px', borderRadius: '4px', width: '90%', maxWidth: '500px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>NEW TASK</h3>
          <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }} />
          <textarea placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="2" style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <select value={newTask.org} onChange={(e) => setNewTask({...newTask, org: e.target.value})} style={{ padding: '10px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }}>
              {Object.entries(ORGANIZATIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={newTask.timeframe} onChange={(e) => setNewTask({...newTask, timeframe: e.target.value})} style={{ padding: '10px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="longterm">Long-term</option>
            </select>
            <input type="number" value={newTask.hours} onChange={(e) => setNewTask({...newTask, hours: parseFloat(e.target.value) || 0})} style={{ padding: '10px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }} min="0.5" step="0.5" />
            <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} style={{ padding: '10px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select value={newTask.assignee} onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} style={{ padding: '10px', background: '#0a0e27', border: '1px solid #2a3f5f', color: '#e8eaf6', borderRadius: '4px' }}>
              <option value="Self">Self</option>
              <option value="Bailey Monaghan">Bailey Monaghan</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addTask} style={{ flex: 1, padding: '10px', background: '#1E5F74', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', borderRadius: '4px' }}>Create</button>
            <button onClick={() => setShowNewTask(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#9E9E9E', border: '1px solid #2a3f5f', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', borderRadius: '4px' }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', color: '#e8eaf6', padding: '20px', fontFamily: "'Courier New', monospace", fontSize: '13px', lineHeight: '1.6', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #2a3f5f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '2px', margin: '0 0 4px' }}>⚔ TASK COMMANDER</h1>
          <p style={{ fontSize: '11px', color: '#9E9E9E', margin: '0', letterSpacing: '1px', textTransform: 'uppercase' }}>Tactical Operations Scheduler</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ padding: '10px 16px', background: syncStatus === 'synced' ? 'rgba(76, 175, 80, 0.2)' : syncStatus === 'error' ? 'rgba(255, 68, 68, 0.2)' : 'transparent', border: `1px solid ${syncStatus === 'synced' ? '#4CAF50' : syncStatus === 'error' ? '#FF4444' : '#2a3f5f'}`, borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: syncStatus === 'synced' ? '#4CAF50' : syncStatus === 'error' ? '#FF4444' : '#9E9E9E' }}>
            {syncStatus === 'syncing' && '⟳ SYNCING...'}
            {syncStatus === 'synced' && '✓ SYNCED'}
            {syncStatus === 'error' && '✗ ERROR'}
            {syncStatus === 'idle' && 'READY'}
          </div>
          <button onClick={syncToCalendar} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #1E5F74 0%, #0047AB 100%)', color: 'white', border: '1px solid #1E5F74', cursor: 'pointer', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '4px' }}>
            SYNC CALENDAR
          </button>
          <button onClick={() => setShowNewTask(true)} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #1E5F74 0%, #0047AB 100%)', color: 'white', border: '1px solid #1E5F74', cursor: 'pointer', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '4px' }}>
            + NEW TASK
          </button>
        </div>
      </div>

      <TaskSection title="TODAY (IMMEDIATE)" emoji="🔴" timeframe="today" />
      <TaskSection title="THIS WEEK (STRATEGIC)" emoji="🟡" timeframe="week" />
      <TaskSection title="LONG-TERM" emoji="🔵" timeframe="longterm" />

      <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #1a2a3f 0%, #2a3f5f 100%)', border: '2px solid #2a3f5f', borderRadius: '4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', marginBottom: '16px', color: '#D4A574', textTransform: 'uppercase' }}>
          Fitness Schedule (Locked)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
          {[
            { day: 'Mon', run: true, gym: true },
            { day: 'Tue', run: false, gym: true },
            { day: 'Wed', run: true, gym: true },
            { day: 'Thu', run: false, gym: true },
            { day: 'Fri', run: true, gym: true },
            { day: 'Sat', run: true, gym: true },
            { day: 'Sun', run: false, gym: false },
          ].map((d, i) => (
            <div key={i} style={{ padding: '10px', background: '#0a0e27', border: '1px solid #2a3f5f', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9E9E9E', marginBottom: '6px', textTransform: 'uppercase' }}>{d.day}</div>
              {d.run && <div style={{ fontSize: '10px', background: 'rgba(255, 152, 0, 0.2)', color: '#FFB74D', padding: '4px', marginBottom: '4px', borderRadius: '3px' }}>🏃 5:30am</div>}
              {d.gym && <div style={{ fontSize: '10px', background: 'rgba(30, 95, 116, 0.2)', color: '#1E5F74', padding: '4px', borderRadius: '3px' }}>💪 12pm</div>}
              {!d.run && !d.gym && <div style={{ fontSize: '10px', color: '#9E9E9E' }}>REST</div>}
            </div>
          ))}
        </div>
      </div>

      {showNewTask && <NewTaskForm />}
    </div>
  );
};

export default TaskCommander;
