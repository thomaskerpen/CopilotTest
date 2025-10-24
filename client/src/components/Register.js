import React, { useState } from 'react';
import '../styles/App.css';
import { authService } from '../services/api';

export default function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await authService.register(username, password);
      setSuccess(true);
      setTimeout(() => onSwitchToLogin(), 1200);
    } catch (err) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    }
  };

  return (
    <div className="login-container">
      <h2>Registrieren</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Registrieren</button>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Erfolgreich! Weiterleitung ...</div>}
      </form>
      <div style={{marginTop:16}}>
        <button type="button" onClick={onSwitchToLogin} style={{background:'#007bff'}}>Zum Login</button>
      </div>
    </div>
  );
}
