import React from 'react';
import '../styles/App.css';
import { useContact } from '../hooks/useContact';

export default function Contact() {
  const {
    formData,
    loading,
    successMessage,
    errorMessage,
    isLoggedIn,
    handleInputChange,
    handleSubmit
  } = useContact();

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h2>Kontakt</h2>
        <div className="address-section">
          <h3>Unsere Adresse</h3>
          <div className="address">
            <p><strong>Musterpraxis Dr. Beispiel</strong></p>
            <p>Musterstraße 123</p>
            <p>12345 Musterstadt</p>
            <p>Deutschland</p>
            <div className="contact-details">
              <p>📞 Tel: +49 (0) 123 456 789</p>
              <p>📧 E-Mail: info@musterpraxis.de</p>
              <p>🕒 Öffnungszeiten: Mo-Fr 8:00-18:00 Uhr</p>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-form-section">
        <h3>Schreiben Sie uns</h3>
        <p>Haben Sie Fragen oder möchten Sie einen Termin vereinbaren? Nutzen Sie unser Kontaktformular:</p>
        
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={isLoggedIn ? "Automatisch ausgefüllt" : "Ihr vollständiger Name"}
              required
              readOnly={isLoggedIn}
              className={isLoggedIn ? 'readonly-field' : ''}
              title={isLoggedIn ? "Name wird automatisch aus Ihrem Login übernommen" : ""}
            />
            {isLoggedIn && (
              <small className="field-info">
                ℹ️ Name wird automatisch aus Ihrem Login übernommen
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">E-Mail *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="ihre.email@beispiel.de"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Ihre Anfrage *</label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Beschreiben Sie hier Ihre Anfrage oder Ihr Anliegen..."
              rows={6}
              required
            />
          </div>

          {errorMessage && (
            <div className="error-message">
              ❌ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              ✅ {successMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Wird gesendet...' : 'Anfrage senden'}
          </button>
        </form>

        <div className="form-note">
          <p><small>* Pflichtfelder</small></p>
          <p><small>Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.</small></p>
        </div>
      </div>
    </div>
  );
}