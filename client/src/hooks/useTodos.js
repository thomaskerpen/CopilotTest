import { useState, useEffect } from 'react';
import { todoService } from '../services/api';
import { dateUtils, authUtils } from '../utils/helpers';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState(() => dateUtils.getTodayString());
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(false);

  const token = authUtils.getToken();

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await todoService.fetchTodos();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      if (error.message.includes('Nicht autorisiert')) {
        authUtils.logout();
        setTodos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !dueDate) return;
    
    try {
      const todo = await todoService.addTodo(newTodo, dueDate);
      setTodos(prev => [...prev, todo]);
      setNewTodo('');
      setDueDate(dateUtils.getTodayString());
    } catch (error) {
      console.error('Error adding todo:', error);
      if (error.message.includes('Nicht autorisiert')) {
        authUtils.logout();
        setTodos([]);
      }
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const updated = await todoService.toggleTodo(id, completed);
      setTodos(prev => prev.map(todo => todo.id === id ? updated : todo));
    } catch (error) {
      console.error('Error toggling todo:', error);
      if (error.message.includes('Nicht autorisiert')) {
        authUtils.logout();
        setTodos([]);
      }
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      if (error.message.includes('Nicht autorisiert')) {
        authUtils.logout();
        setTodos([]);
      }
    }
  };

  const filteredTodos = todos.filter(todo => showCompleted || !todo.completed);

  return {
    // State
    todos: filteredTodos,
    newTodo,
    dueDate,
    showCompleted,
    loading,
    
    // Setters
    setNewTodo,
    setDueDate,
    setShowCompleted,
    
    // Actions
    addTodo,
    toggleTodo,
    deleteTodo,
    fetchTodos,
    
    // Utilities
    isOverdue: dateUtils.isPastDate
  };
};