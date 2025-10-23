
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState(today);
  const [showCompleted, setShowCompleted] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
  const response = await fetch('http://192.168.2.141:5000/api/todos', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.status === 401 || response.status === 403) {
        setToken('');
        localStorage.removeItem('token');
        setTodos([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !dueDate) return;
    const response = await fetch('http://192.168.2.141:5000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ text: newTodo, dueDate })
    });
    if (response.status === 401 || response.status === 403) {
      setToken('');
      localStorage.removeItem('token');
      setTodos([]);
      return;
    }
    if (!response.ok) {
      console.error('Fehler beim Hinzufügen:', await response.text());
      return;
    }
    const todo = await response.json();
    setTodos([...todos, todo]);
    setNewTodo('');
    setDueDate(today);
  };

  const toggleTodo = async (id, completed) => {
    const response = await fetch(`http://192.168.2.141:5000/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ completed: !completed })
    });
    if (response.ok) {
      const updated = await response.json();
      setTodos(todos => todos.map(todo => todo.id === id ? updated : todo));
    }
  };

  const deleteTodo = async (id) => {
  await fetch(`http://192.168.2.141:5000/api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    fetchTodos();
  };

  const handleLogin = (tok) => {
    setToken(tok);
    localStorage.setItem('token', tok);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setTodos([]);
  };

  const filteredTodos = todos.filter(todo => showCompleted || !todo.completed);

  if (!token) {
    if (showRegister) {
      return <Register onRegister={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <Login onLogin={handleLogin} />
        <div style={{marginTop: 10, fontSize: '0.98em', color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}
             onClick={() => setShowRegister(true)}>
          Noch keinen Account? Jetzt registrieren
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Todo List</h1>
        <button onClick={handleLogout} style={{ background: '#dc3545', marginLeft: 20 }}>Logout</button>
      </div>
      <div className="view-toggle">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span>Show completed tasks</span>
      </div>
      <form onSubmit={addTodo}>
        <div className="form-inputs">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {filteredTodos.map((todo) => {
            const isOverdue = !todo.completed && new Date(todo.dueDate) < new Date(today);
            return (
              <li key={todo.id}>
                <label className={`toggle-switch todo-toggle${isOverdue ? ' overdue-toggle' : ''}`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="todo-content">
                  <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                    {todo.text}
                  </span>
                  <span className="due-date">
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default App;