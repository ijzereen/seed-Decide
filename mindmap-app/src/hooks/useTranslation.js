import { useState, useEffect } from 'react';
import i18n from '../utils/i18n';

const useTranslation = () => {
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

  const t = (key) => {
    return i18n.t(key);
  };

  return { t, currentLanguage };
};

export default useTranslation; 