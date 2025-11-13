import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '../icons/Icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 
        ${theme === 'light' 
          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
          : 'text-gray-400 bg-gray-700 hover:bg-gray-600 hover:text-yellow-300'
        }`}
      title={theme === 'light' ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع المضيء'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;