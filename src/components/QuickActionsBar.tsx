/**
 * Quick Actions Bar Component
 * Provides fast access to common actions with keyboard shortcuts
 * 
 * UX Best Practice: Enterprise SaaS pattern (Notion, Linear, Figma)
 */

import { Plus, UserPlus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAction {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
  moduleKey?: string;
}

const quickActions: QuickAction[] = [
  { 
    title: 'Buscar', 
    url: '/busca', 
    icon: Search, 
    shortcut: '⌘K',
  },
  { 
    title: 'Nova Consulta', 
    url: '/agenda', 
    icon: Calendar, 
    shortcut: '⌘N',
    moduleKey: 'AGENDA'
  },
  { 
    title: 'Novo Paciente', 
    url: '/pacientes/novo', 
    icon: UserPlus, 
    shortcut: '⌘P',
    moduleKey: 'PEP'
  },
];

export function QuickActionsBar() {
  const navigate = useNavigate();
  const { hasModuleAccess } = useAuth();

  const handleAction = (url: string) => {
    navigate(url);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-2 border-t border-sidebar-border/30">
      {quickActions.map((action) => {
        // Skip if module access required and user doesn't have access
        if (action.moduleKey && !hasModuleAccess(action.moduleKey)) {
          return null;
        }

        const Icon = action.icon;
        
        return (
          <Tooltip key={action.title}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-start text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                onClick={() => handleAction(action.url)}
              >
                <Icon className="h-3.5 w-3.5 mr-2" />
                <span>{action.title}</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border/50 bg-sidebar-accent/30 px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/60">
                  {action.shortcut}
                </kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{action.title} ({action.shortcut})</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
