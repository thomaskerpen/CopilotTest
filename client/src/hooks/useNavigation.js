import { useState, useEffect } from 'react';

export const useNavigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('todos');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.hamburger-menu')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const switchToView = (view) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return {
    menuOpen,
    currentView,
    toggleMenu,
    switchToView,
    setMenuOpen
  };
};