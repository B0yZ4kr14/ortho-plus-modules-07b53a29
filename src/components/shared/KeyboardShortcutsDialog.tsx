import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts: KeyboardShortcut[] = [
  // Navegação
  { key: 'Ctrl + 1', description: 'Ir para Dashboard', category: 'Navegação' },
  { key: 'Ctrl + 2', description: 'Ir para Agenda', category: 'Navegação' },
  { key: 'Ctrl + 3', description: 'Ir para Pacientes', category: 'Navegação' },
  { key: 'Ctrl + 4', description: 'Ir para Prontuário', category: 'Navegação' },
  { key: 'Ctrl + 5', description: 'Ir para Financeiro', category: 'Navegação' },
  
  // Busca e Comandos
  { key: 'Ctrl + P', description: 'Busca Rápida de Pacientes', category: 'Busca' },
  { key: 'Ctrl + K', description: 'Command Palette', category: 'Busca' },
  
  // Quick Actions
  { key: 'Ctrl + N', description: 'Novo Paciente', category: 'Ações Rápidas' },
  { key: 'Ctrl + T', description: 'Novo Tratamento', category: 'Ações Rápidas' },
  { key: 'Ctrl + R', description: 'Nova Prescrição', category: 'Ações Rápidas' },
  { key: 'Ctrl + O', description: 'Abrir Prontuário (menu contextual)', category: 'Ações Rápidas' },
  { key: 'Ctrl + A', description: 'Agendar Consulta (menu contextual)', category: 'Ações Rápidas' },
  
  // Odontograma (quando focado)
  { key: 'H', description: 'Marcar dente como Hígido', category: 'Odontograma' },
  { key: 'C', description: 'Marcar dente com Cárie', category: 'Odontograma' },
  { key: 'T', description: 'Marcar dente como Tratado', category: 'Odontograma' },
  
  // Ajuda
  { key: 'Shift + ?', description: 'Exibir este menu de atalhos', category: 'Ajuda' },
  { key: 'Esc', description: 'Fechar diálogos/modais', category: 'Ajuda' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente pelo sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
                {category}
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <Badge variant="outline" className="font-mono">
                            {shortcut.key}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center pt-4 text-sm text-muted-foreground">
          <p>
            Pressione <Badge variant="outline" className="mx-1">Shift + ?</Badge> a qualquer momento para ver este menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
