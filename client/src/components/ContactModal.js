import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import { contactService } from '../services/api';
import { dateUtils } from '../utils/helpers';

export default function ContactModal({ contactId, isOpen, onClose }) {
  const [contactDetails, setContactDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contactId]);

  const fetchContactDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await contactService.getContactById(contactId);
      if (response.ok) {
        const data = await response.json();
        setContactDetails(data);
      } else {
        setError('Kontaktdetails konnten nicht geladen werden');
      }
    } catch (err) {
      setError('Fehler beim Laden der Kontaktdetails');
      console.error('Error fetching contact details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setContactDetails(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content contact-modal">
        <div className="modal-header">
          <h3>📧 Kontaktanfrage Details</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Lade Kontaktdetails...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {contactDetails && (
            <div className="contact-details">
              <div className="detail-group">
                <label>📅 Eingegangen am:</label>
                <span>{dateUtils.formatDateForDisplay(contactDetails.createdAt)} um {new Date(contactDetails.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
              </div>

              <div className="detail-group">
                <label>👤 Name:</label>
                <span>{contactDetails.name}</span>
              </div>

              <div className="detail-group">
                <label>📧 E-Mail:</label>
                <span>
                  <a href={`mailto:${contactDetails.email}`} className="email-link">
                    {contactDetails.email}
                  </a>
                </span>
              </div>

              <div className="detail-group message-group">
                <label>💬 Nachricht:</label>
                <div className="message-content">
                  {contactDetails.message}
                </div>
              </div>

              <div className="detail-group">
                <label>🔗 Anfrage-ID:</label>
                <span>#{contactDetails.id}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Schließen
          </button>
          {contactDetails && (
            <a 
              href={`mailto:${contactDetails.email}?subject=Antwort auf Ihre Anfrage&body=Hallo ${contactDetails.name},%0D%0A%0D%0AVielen Dank für Ihre Anfrage.%0D%0A%0D%0AMit freundlichen Grüßen`}
              className="btn-primary"
            >
              📧 Antworten
            </a>
          )}
        </div>
      </div>
    </div>
  );
}