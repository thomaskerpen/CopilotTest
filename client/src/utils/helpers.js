//comment
// comment 2


export const dateUtils = {
  getTodayString: () => new Date().toISOString().slice(0, 10),
  
  isWeekend: (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Sonntag oder Samstag
  },

  isPastDate: (dateString) => {
    const today = new Date().toISOString().slice(0, 10);
    return dateString < today;
  },

  formatDateForDisplay: (dateString) => {
    return new Date(dateString).toLocaleDateString();
  }
};

export const authUtils = {
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token) => localStorage.setItem('token', token),
  
  removeToken: () => localStorage.removeItem('token'),
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  isTokenValid: (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  getUsernameFromToken: (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch {
      return null;
    }
  },

  getCurrentUsername: () => {
    const token = localStorage.getItem('token');
    return authUtils.getUsernameFromToken(token);
  }
};

export const timeSlots = [
  '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00', '17:30'
];