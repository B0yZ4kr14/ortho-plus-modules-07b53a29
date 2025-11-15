import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface HotkeyConfig {
  key: string;
  description: string;
  action: () => void;
  category: string;
}

export function useGlobalHotkeys() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Navegação rápida
  useHotkeys('ctrl+1', (e) => {
    e.preventDefault();
    navigate('/');
    toast({ title: 'Dashboard', description: 'Ctrl+1' });
  });

  useHotkeys('ctrl+2', (e) => {
    e.preventDefault();
    navigate('/agenda');
    toast({ title: 'Agenda', description: 'Ctrl+2' });
  });

  useHotkeys('ctrl+3', (e) => {
    e.preventDefault();
    navigate('/pacientes');
    toast({ title: 'Pacientes', description: 'Ctrl+3' });
  });

  useHotkeys('ctrl+4', (e) => {
    e.preventDefault();
    navigate('/prontuario');
    toast({ title: 'Prontuário', description: 'Ctrl+4' });
  });

  useHotkeys('ctrl+5', (e) => {
    e.preventDefault();
    navigate('/financeiro');
    toast({ title: 'Financeiro', description: 'Ctrl+5' });
  });

  // Quick Search (implementar depois)
  useHotkeys('ctrl+p', (e) => {
    e.preventDefault();
    // TODO: Abrir modal de busca rápida de pacientes
    toast({ title: 'Busca Rápida', description: 'Em breve!' });
  });

  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    // TODO: Command palette (estilo VS Code)
    toast({ title: 'Command Palette', description: 'Em breve!' });
  });

  // Help
  useHotkeys('shift+?', (e) => {
    e.preventDefault();
    // TODO: Abrir modal de atalhos
    toast({ title: 'Atalhos de Teclado', description: 'Pressione ? para ver todos' });
  });
}

// Hook para exibir cheatsheet
export function useHotkeyCheatsheet() {
  const hotkeys: HotkeyConfig[] = [
    { key: 'Ctrl+1', description: 'Ir para Dashboard', action: () => {}, category: 'Navegação' },
    { key: 'Ctrl+2', description: 'Ir para Agenda', action: () => {}, category: 'Navegação' },
    { key: 'Ctrl+3', description: 'Ir para Pacientes', action: () => {}, category: 'Navegação' },
    { key: 'Ctrl+4', description: 'Ir para Prontuário', action: () => {}, category: 'Navegação' },
    { key: 'Ctrl+5', description: 'Ir para Financeiro', action: () => {}, category: 'Navegação' },
    { key: 'Ctrl+P', description: 'Busca Rápida de Pacientes', action: () => {}, category: 'Busca' },
    { key: 'Ctrl+K', description: 'Command Palette', action: () => {}, category: 'Busca' },
    { key: 'Shift+?', description: 'Exibir Atalhos', action: () => {}, category: 'Ajuda' },
  ];

  return { hotkeys };
}
