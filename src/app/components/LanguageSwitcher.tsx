import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import useGameStore from '../../store/useGameStore';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useGameStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-slate-800"
          title="Switch language"
        >
          <Languages className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setLanguage('zh')}
          className={language === 'zh' ? 'bg-slate-800' : ''}
        >
          <span>中文 (Chinese)</span>
          {language === 'zh' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-slate-800' : ''}
        >
          <span>English</span>
          {language === 'en' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
