// Hardcoded API URL for production deployment on Vercel
const API_BASE_URL = 'https://server-ten-liart-22.vercel.app/api';

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