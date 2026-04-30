import React, { useState, useEffect } from 'react';

const TaskCommander = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('Beachhead');
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

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
    try {
      setLoading(true);
      const savedTasks = localStorage.getItem('taskCommanderTasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
        setSaveStatus('✅ Loaded from local storage');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError('Error loading tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTasks = (updatedTasks) => {
    try {
      localStorage.setItem('taskCommanderTasks', JSON.stringify(updatedTasks));
      setSaveStatus('💾 Saved locally');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setError('Error saving: ' + err.message);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      title: newTask,
      org: selectedOrg,
      timeframe: selectedTimeframe,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    setNewTask('');
    saveTasks(updatedTasks);
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const exportTasksAsCSV = () => {
    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }
    const headers = ['Task', 'Organization', 'Timeframe', 'Status', 'Created'];
    const rows = tasks.map(task => [
      `"${task.title}"`,
      task.org,
      task.timeframe,
      task.completed ? 'Completed' : 'Pending',
      new Date(task.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskCommander-Export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportTasksAsJSON = () => {
    if (tasks.length === 0) {
      alert('No tasks to backup');
      return;
    }
    const jsonContent = JSON.stringify({ tasks }, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskCommander-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredTasks = tasks.filter(task => task.timeframe === selectedTimeframe);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1E5F74', marginBottom: '30px' }}>TASK COMMANDER</h1>

      {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
      {saveStatus && <div style={{ color: '#1E5F74', marginBottom: '1rem', fontWeight: 'bold', padding: '10px', backgroundColor: '#e6f2f0', borderRadius: '4px' }}>{saveStatus}</div>}

      {/* Input section */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {organizations.map(org => (
            <option key={org.name} value={org.name}>{org.name}</option>
          ))}
        </select>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {timeframes.map(tf => (
            <option key={tf} value={tf}>{tf}</option>
          ))}
        </select>
        <button
          onClick={addTask}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1E5F74',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ➕ Add
        </button>
      </div>

      {/* Export buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={exportTasksAsCSV}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2F5233',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          📥 Export CSV (Outlook)
        </button>
        <button
          onClick={exportTasksAsJSON}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0047AB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          💾 Backup JSON (OneDrive)
        </button>
      </div>

      {/* Tasks */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#1E5F74', borderBottom: '2px solid #1E5F74', paddingBottom: '10px' }}>
          {selectedTimeframe} ({filteredTasks.length})
        </h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ color: '#999' }}>No tasks for {selectedTimeframe}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredTasks.map(task => (
              <li
                key={task.id}
                style={{
                  marginBottom: '10px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderLeft: `4px solid ${organizations.find(o => o.name === task.org)?.color}`,
                  borderRadius: '4px',
                  opacity: task.completed ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span style={{
                    flex: 1,
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    backgroundColor: organizations.find(o => o.name === task.org)?.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '3px',
                  }}>
                    {task.org}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fitness schedule */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#1E5F74', borderBottom: '2px solid #1E5F74', paddingBottom: '10px' }}>
          📋 FITNESS SCHEDULE (Locked)
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {fitnessSchedule.map((item, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: '10px',
                padding: '15px',
                border: '1px solid #ddd',
                borderLeft: '4px solid #D4A574',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '100px' }}>{item.day}</span>
                <span style={{ color: '#666' }}>{item.time} — {item.activity}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Data storage info */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '14px',
      }}>
        <strong>📊 Data Storage:</strong>
        <ul style={{ marginTop: '10px', marginBottom: 0 }}>
          <li>✅ Tasks: Saved to your browser (local storage)</li>
          <li>💾 Backup: Click "Backup JSON" for OneDrive</li>
          <li>📅 Calendar: Export CSV weekly to Outlook</li>
          <li>💰 Cost: FREE (no paywalls ever)</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskCommander;
