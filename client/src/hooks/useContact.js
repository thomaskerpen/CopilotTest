import { useState } from 'react';
import { contactService } from '../services/api';

export const useContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Name ist erforderlich');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('E-Mail ist erforderlich');
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Nachricht ist erforderlich');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await contactService.sendContactForm(
        formData.name,
        formData.email,
        formData.message
      );

      if (response.ok) {
        await response.json(); // Parse response but don't store
        setSuccessMessage('Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Fehler beim Senden der Anfrage');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setErrorMessage('Netzwerkfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: ''
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  return {
    // Form data
    formData,
    
    // States
    loading,
    successMessage,
    errorMessage,
    
    // Actions
    handleInputChange,
    handleSubmit,
    resetForm
  };
};