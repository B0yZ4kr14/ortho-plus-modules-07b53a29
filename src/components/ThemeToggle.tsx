import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
export function ThemeToggle() {
  const {
    theme,
    setTheme
  } = useTheme();
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
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => setTheme('professional-dark')} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4" />
          <span>Professional Dark</span>
          {theme === 'professional-dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark-gold')} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Dark Gold</span>
          {theme === 'dark-gold' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('high-contrast')} className="cursor-pointer border-t mt-1 pt-1">
          <Sun className="mr-2 h-4 w-4" />
          <span>High Contrast Light</span>
          {theme === 'high-contrast' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('high-contrast-dark')} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span>High Contrast Dark</span>
          {theme === 'high-contrast-dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
}