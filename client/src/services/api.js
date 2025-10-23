// Static API URL for production deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server-4ri8gyf9v-thomas-projects-c6435665.vercel.app/api'  // Working server with in-memory DB
  : `http://${window.location.hostname}:5000/api`;  // Local development

console.log('API_BASE_URL:', API_BASE_URL);  // Debug log

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response;
  },

  register: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response;
  }
};

export const todoService = {
  fetchTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  addTodo: async (text, dueDate) => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, dueDate })
    });
    return response;
  },

  toggleTodo: async (id, completed) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed: !completed })
    });
    return response;
  },

  deleteTodo: async (id) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response;
  }
};

export const appointmentService = {
  fetchMyAppointments: async () => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  fetchAvailableSlots: async (date) => {
    const response = await fetch(`${API_BASE_URL}/appointments/available/${date}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  bookAppointment: async (date, time) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, time })
    });
    return response;
  },

  deleteAppointment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response;
  }
};

export const contactService = {
  sendContactForm: async (name, email, message) => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });
    return response;
  },

  getContactRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getContactById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};