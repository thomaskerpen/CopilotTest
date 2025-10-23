import React from 'react';
import '../styles/App.css';
import { useTodos } from '../hooks/useTodos';
import { dateUtils } from '../utils/helpers';

export default function TodoList() {
  const {
    todos,
    newTodo,
    dueDate,
    showCompleted,
    loading,
    setNewTodo,
    setDueDate,
    setShowCompleted,
    addTodo,
    toggleTodo,
    deleteTodo,
    isOverdue
  } = useTodos();

  return (
    <>
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
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {todos.map((todo) => {
            const todoIsOverdue = !todo.completed && isOverdue(todo.dueDate);
            return (
              <li key={todo.id}>
                <label className={`toggle-switch todo-toggle${todoIsOverdue ? ' overdue-toggle' : ''}`}>
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
                    Due: {dateUtils.formatDateForDisplay(todo.dueDate)}
                  </span>
                </div>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}