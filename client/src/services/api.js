// Smart API URL detection based on environment
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // Check if running on localhost (even if built)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Production: Use Vercel server
  return 'https://server-ten-liart-22.vercel.app/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('Environment:', process.env.NODE_ENV);
console.log('Hostname:', window.location.hostname);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login fehlgeschlagen');
    }
    
    return await response.json();
  },

  register: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registrierung fehlgeschlagen');
    }
    
    return await response.json();
  }
};

export const todoService = {
  fetchTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Laden der Todos');
    }
    
    return await response.json();
  },

  addTodo: async (text, dueDate) => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, dueDate })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Hinzufügen des Todos');
    }
    
    return await response.json();
  },

  toggleTodo: async (id, completed) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed: !completed })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Aktualisieren des Todos');
    }
    
    return await response.json();
  },

  deleteTodo: async (id) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Löschen des Todos');
    }
    
    // 204 No Content - kein JSON zurück
    if (response.status === 204) {
      return;
    }
    
    return await response.json();
  }
};

export const appointmentService = {
  fetchMyAppointments: async () => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Laden der Termine');
    }
    
    return await response.json();
  },

  fetchAvailableSlots: async (date) => {
    const response = await fetch(`${API_BASE_URL}/appointments/available/${date}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Laden der verfügbaren Zeiten');
    }
    
    return await response.json();
  },

  bookAppointment: async (date, time) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, time })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Buchen des Termins');
    }
    
    return await response.json();
  },

  deleteAppointment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Löschen des Termins');
    }
    
    // 204 No Content - kein JSON zurück
    if (response.status === 204) {
      return;
    }
    
    return await response.json();
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Senden der Nachricht');
    }
    
    return await response.json();
  },

  getContactRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Laden der Kontaktanfragen');
    }
    
    return await response.json();
  },

  getContactById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht autorisiert - bitte erneut anmelden');
      }
      throw new Error('Fehler beim Laden der Kontaktanfrage');
    }
    
    return await response.json();
  }
};