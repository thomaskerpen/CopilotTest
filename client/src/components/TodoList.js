import React, { useState } from 'react';
import '../styles/App.css';
import { useTodos } from '../hooks/useTodos';
import { dateUtils } from '../utils/helpers';
import ContactModal from './ContactModal';

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Function to extract contact ID from TODO text
  const extractContactId = (todoText) => {
    const match = todoText.match(/\[ID:(\d+)\]/);
    return match ? parseInt(match[1]) : null;
  };

  // Handle clicking on contact TODO
  const handleContactTodoClick = (todo) => {
    const contactId = extractContactId(todo.text);
    if (contactId) {
      setSelectedContactId(contactId);
      setModalOpen(true);
    }
  };

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
            const isContactTodo = todo.text.includes('📧');
            const contactId = isContactTodo ? extractContactId(todo.text) : null;
            
            return (
              <li key={todo.id} className={isContactTodo ? 'contact-todo' : ''}>
                <label className={`toggle-switch todo-toggle${todoIsOverdue ? ' overdue-toggle' : ''}`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div 
                  className={`todo-content ${isContactTodo ? 'clickable-contact' : ''}`}
                  onClick={() => isContactTodo && contactId && handleContactTodoClick(todo)}
                  title={isContactTodo ? 'Klicken Sie hier, um Details der Kontaktanfrage zu sehen' : ''}
                >
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

      {/* Contact Modal */}
      <ContactModal
        contactId={selectedContactId}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedContactId(null);
        }}
      />
    </>
  );
}