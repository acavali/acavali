import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'it', label: '🇮🇹 Italiano', flag: '🇮🇹' },
    { code: 'pt', label: '🇧🇷 Português', flag: '🇧🇷' },
    { code: 'en', label: '🇺🇸 English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {currentLanguage.flag} {currentLanguage.label.split(' ')[1]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
