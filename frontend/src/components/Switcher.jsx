import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const Switcher = () => {
  const { i18n } = useTranslation();
  const { darkMode, toggleTheme } = useTheme();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('palmas_lang', newLang);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher */}
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#00FF41]/20 transition border border-[#00FF41]/30"
        aria-label="Switch Language"
      >
        <span className="text-sm font-medium text-white">
          {currentLang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </span>
      </button>

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#00FF41]/20 transition border border-[#00FF41]/30"
        aria-label="Toggle Theme"
      >
        <span className="text-sm">
          {darkMode ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  );
};

export default Switcher;
