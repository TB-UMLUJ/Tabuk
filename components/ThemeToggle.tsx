import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '../icons/Icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="header-icon-btn"
      title={theme === 'light' ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع المضيء'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </button>
  );
};

export default ThemeToggle;