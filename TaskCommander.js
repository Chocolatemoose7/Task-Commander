import React, { useState, useEffect } from 'react';
import styles from '../styles/globals.css';

const TaskCommander = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('Beachhead');
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
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
          setError('Failed to load tasks');
        }
      } catch (err) {
        setError('Error loading tasks: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const addTask = async () => {
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

    try {
      await fetch('/.netlify/functions/sync-tasks', {
        method: 'POST',
        body: JSON.stringify({ tasks: updatedTasks }),
      });
    } catch (err) {
      setError('Error saving task: ' + err.message);
    }
  };

  const toggleTask = async (id) => {
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    try {
      await fetch('/.netlify/functions/sync-tasks', {
        method: 'POST',
        body: JSON.stringify({ tasks: updatedTasks }),
      });
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);

    try {
      await fetch('/.netlify/functions/sync-tasks', {
        method: 'POST',
        body: JSON.stringify({ tasks: updatedTasks }),
      });
    } catch (err) {
      setError('Error deleting task: ' + err.message);
    }
  };

  // EXPORT TO CSV
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

  const filteredTasks = tasks.filter(
    task => task.timeframe === selectedTimeframe
  );

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
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          style={styles.select}
        >
          {organizations.map(org => (
            <option key={org.name} value={org.name}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          style={styles.select}
        >
          {timeframes.map(tf => (
            <option key={tf} value={tf}>{tf}</option>
          ))}
        </select>
        <button onClick={addTask} style={styles.button}>
          ➕ Add
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={exportTasksAsCSV}
          style={{
            ...styles.button,
            backgroundColor: '#2F5233',
            fontSize: '0.9rem',
          }}
        >
          📥 Export to CSV
        </button>
        <span style={{ fontSize: '0.85rem', color: '#666', alignSelf: 'center' }}>
          (For Google Calendar import)
        </span>
      </div>

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
                  borderLeftColor: organizations.find(o => o.name === task.org)?.color,
                  opacity: task.completed ? 0.6 : 1,
                }}
              >
                <div style={styles.taskContent}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}>
                    {task.title}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    backgroundColor: organizations.find(o => o.name === task.org)?.color,
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '3px',
                  }}>
                    {task.org}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ ...styles.deleteButton, marginTop: '0.5rem' }}
                >
                  🗑️ Delete
                </button>
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
                <span style={{ fontWeight: 'bold', minWidth: '120px' }}>
                  {item.day}
                </span>
                <span style={{ color: '#666' }}>
                  {item.time} — {item.activity}
                </span>
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
