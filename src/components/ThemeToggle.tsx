import { Moon, Sun, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/hooks/useFontSize";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, resetSize, min, max } = useFontSize();

  const themes = [
    { id: 'professional-dark', name: 'Professional Dark', icon: Palette, description: 'Tema padrão profissional', badge: undefined },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Tema escuro clássico', badge: undefined },
    { id: 'light', name: 'Light', icon: Sun, description: 'Tema claro', badge: undefined },
    { id: 'dark-gold', name: 'Dark Gold', icon: Palette, description: 'Tema escuro com dourado', badge: undefined },
    { id: 'high-contrast', name: 'High Contrast Light', icon: Sun, description: 'Alto contraste claro (WCAG AAA)', badge: 'AAA' as const },
    { id: 'high-contrast-dark', name: 'High Contrast Dark', icon: Moon, description: 'Alto contraste escuro (WCAG AAA)', badge: 'AAA' as const },
  ];
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'professional-dark':
        return <Palette className="h-5 w-5" />;
      case 'dark-gold':
        return <Palette className="h-5 w-5 text-yellow-500" />;
      case 'high-contrast':
        return <Sun className="h-5 w-5" />;
      case 'high-contrast-dark':
        return <Moon className="h-5 w-5" />;
      default:
        return <Palette className="h-5 w-5" />;
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Configurações de aparência">
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 bg-popover shadow-xl z-[1000] border border-border">
        {/* Temas Section */}
        <div className="p-4 space-y-3">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0">
            Temas
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <Card
                  key={t.id}
                  variant={isActive ? 'elevated' : 'default'}
                  className={`cursor-pointer ${
                    isActive ? 'ring-2 ring-ring bg-accent text-accent-foreground' : 'hover:bg-accent/40'
                  }`}
                  onClick={() => setTheme(t.id as any)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                      {t.badge && (
                        <Badge variant={isActive ? 'secondary' : 'outline'} className={`text-[9px] px-1 py-0 h-4 ${isActive ? 'bg-accent-foreground text-accent border-transparent' : ''}`}>
                          {t.badge}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${isActive ? 'text-accent-foreground' : 'text-card-foreground'}`}>
                        {t.name}
                      </p>
                      <p className={`text-[10px] line-clamp-1 ${isActive ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                        {t.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Font Size Section */}
        <div className="p-4 space-y-3 border-t border-border/30">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0">
            Tamanho da Fonte
          </DropdownMenuLabel>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Type className="h-3 w-3" />
                {fontSize}px
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetSize();
                }}
                className="h-7 px-2 text-xs"
              >
                Resetar
              </Button>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={min}
              max={max}
              step={1}
              className="cursor-pointer"
              aria-label="Ajustar tamanho da fonte"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min}px</span>
              <span>Padrão: 16px</span>
              <span>{max}px</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}