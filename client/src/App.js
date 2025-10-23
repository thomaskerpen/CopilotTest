
import React from 'react';
import './styles/App.css';
import Login from './components/Login';
import Register from './components/Register';
import Booking from './components/Booking';
import TodoList from './components/TodoList';
import Contact from './components/Contact';
import { useAuth } from './hooks/useAuth';
import { useNavigation } from './hooks/useNavigation';

function App() {
  const { 
    isAuthenticated, 
    showRegister, 
    setShowRegister, 
    handleLogin, 
    handleLogout 
  } = useAuth();
  
  const { 
    menuOpen, 
    currentView, 
    toggleMenu, 
    switchToView 
  } = useNavigation();
  // Authentication check
  if (!isAuthenticated) {
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

  // Main authenticated app
  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          {currentView === 'todos' && 'Todo List'}
          {currentView === 'booking' && 'Terminbuchung'}
          {currentView === 'contact' && 'Kontakt'}
        </h1>
        <div className="hamburger-menu">
          <div 
            className={`hamburger-icon ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button 
                className="dropdown-item"
                onClick={() => switchToView('todos')}
              >
                Todo
              </button>
              <button 
                className="dropdown-item"
                onClick={() => switchToView('booking')}
              >
                Terminbuchung
              </button>
              <button 
                className="dropdown-item"
                onClick={() => switchToView('contact')}
              >
                Kontakt
              </button>
              <button 
                className="dropdown-item logout"
                onClick={() => {
                  switchToView('todos');
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {currentView === 'todos' && <TodoList />}
      {currentView === 'booking' && <Booking />}
      {currentView === 'contact' && <Contact />}
    </div>
  );
}

export default App;