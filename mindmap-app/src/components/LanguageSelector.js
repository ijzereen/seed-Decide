import React, { useState, useEffect } from 'react';
import i18n from '../utils/i18n';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setCurrentLanguage(newLanguage);
    };

    i18n.addListener(handleLanguageChange);
    return () => {
      i18n.removeListener(handleLanguageChange);
    };
  }, []);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    i18n.setLanguage(newLanguage);
  };

  const languages = [
    { code: 'ko', label: i18n.t('korean'), flag: '🇰🇷' },
    { code: 'ja', label: i18n.t('japanese'), flag: '🇯🇵' },
    { code: 'en', label: i18n.t('english'), flag: '🇺🇸' }
  ];

  return (
    <div className="language-selector">
      <label className="language-label">
        🌐 {i18n.t('language')}
      </label>
      <select 
        value={currentLanguage} 
        onChange={handleLanguageChange}
        className="language-dropdown"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 