import { useState, useEffect } from 'react';
import { contactService } from '../services/api';
import { authUtils } from '../utils/helpers';

export const useContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill name with logged-in username
  useEffect(() => {
    const currentUsername = authUtils.getCurrentUsername();
    if (currentUsername) {
      setFormData(prev => ({
        ...prev,
        name: currentUsername
      }));
    }
  }, []);

  const handleInputChange = (field, value) => {
    // Prevent changing the name field if user is logged in
    const currentUsername = authUtils.getCurrentUsername();
    if (field === 'name' && currentUsername) {
      return; // Don't allow name changes when logged in
    }

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
      await contactService.sendContactForm(
        formData.name,
        formData.email,
        formData.message
      );

      setSuccessMessage('Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.');
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      setErrorMessage(error.message || 'Fehler beim Senden der Anfrage');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const currentUsername = authUtils.getCurrentUsername();
    setFormData({
      name: currentUsername || '', // Keep username if logged in
      email: '',
      message: ''
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const isLoggedIn = () => {
    return Boolean(authUtils.getCurrentUsername());
  };

  return {
    // Form data
    formData,
    
    // States
    loading,
    successMessage,
    errorMessage,
    isLoggedIn: isLoggedIn(),
    
    // Actions
    handleInputChange,
    handleSubmit,
    resetForm
  };
};