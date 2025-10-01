import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'de' : 'en';
    setLanguage(newLanguage);
  };

  const getLanguageDisplay = () => {
    return language.toUpperCase();
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 min-w-[60px] ${className}`}
      title={language === 'en' ? t('navigation.switchToGerman') : t('navigation.switchToEnglish')}
      aria-label={t('navigation.languageSwitcherAria')}
    >
      <Globe size={16} />
      <span className="font-medium">{getLanguageDisplay()}</span>
    </Button>
  );
};

export default LanguageSwitcher;