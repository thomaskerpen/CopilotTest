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
      const response = await todoService.fetchTodos();
      if (response.status === 401 || response.status === 403) {
        authUtils.logout();
        setTodos([]);
        return;
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !dueDate) return;
    
    try {
      const response = await todoService.addTodo(newTodo, dueDate);
      
      if (response.status === 401 || response.status === 403) {
        authUtils.logout();
        setTodos([]);
        return;
      }
      
      if (!response.ok) {
        console.error('Error adding todo:', await response.text());
        return;
      }
      
      const todo = await response.json();
      setTodos(prev => [...prev, todo]);
      setNewTodo('');
      setDueDate(dateUtils.getTodayString());
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await todoService.toggleTodo(id, completed);
      if (response.ok) {
        const updated = await response.json();
        setTodos(prev => prev.map(todo => todo.id === id ? updated : todo));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
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