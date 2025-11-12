import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'light',
    name: 'Light',
    description: 'Tema claro clássico',
    icon: Sun,
    preview: {
      background: 'bg-white',
      card: 'bg-gray-50',
      text: 'text-gray-900',
      accent: 'bg-teal-500',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Tema escuro padrão',
    icon: Moon,
    preview: {
      background: 'bg-slate-900',
      card: 'bg-slate-800',
      text: 'text-slate-100',
      accent: 'bg-teal-500',
    },
  },
  {
    id: 'professional-dark',
    name: 'Professional Dark',
    description: 'Tema dark premium (Padrão)',
    icon: Palette,
    preview: {
      background: 'bg-[#0f1419]',
      card: 'bg-[#1a1f28]',
      text: 'text-slate-100',
      accent: 'bg-teal-400',
    },
  },
] as const;

export function ThemePreview() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.id;

        return (
          <Card
            key={themeOption.id}
            variant={isActive ? 'elevated' : 'interactive'}
            className={cn(
              'relative overflow-hidden',
              isActive && 'ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => setTheme(themeOption.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{themeOption.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {themeOption.description}
                    </CardDescription>
                  </div>
                </div>
                {isActive && (
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Ativo
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Theme Preview Mockup */}
              <div
                className={cn(
                  'rounded-lg p-4 space-y-2 border border-border/50',
                  themeOption.preview.background
                )}
              >
                <div className={cn('h-3 w-3/4 rounded', themeOption.preview.accent)} />
                <div
                  className={cn(
                    'rounded-md p-3 space-y-2',
                    themeOption.preview.card
                  )}
                >
                  <div className={cn('h-2 w-full rounded', themeOption.preview.text, 'opacity-70')} />
                  <div className={cn('h-2 w-2/3 rounded', themeOption.preview.text, 'opacity-50')} />
                </div>
                <div className="flex gap-2">
                  <div className={cn('h-6 w-20 rounded', themeOption.preview.accent)} />
                  <div
                    className={cn(
                      'h-6 w-20 rounded',
                      themeOption.preview.card,
                      'border border-current opacity-30'
                    )}
                  />
                </div>
              </div>

              <Button
                variant={isActive ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setTheme(themeOption.id)}
              >
                {isActive ? 'Tema Ativo' : 'Aplicar Tema'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
