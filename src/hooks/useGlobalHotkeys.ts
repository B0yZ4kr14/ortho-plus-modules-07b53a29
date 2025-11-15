import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function useGlobalHotkeys() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCheatsheet, setShowCheatsheet] = useState(false);

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

  // Quick Search
  useHotkeys('ctrl+p', (e) => {
    e.preventDefault();
    toast({ title: 'Busca Rápida', description: 'Em breve!' });
  });

  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    toast({ title: 'Command Palette', description: 'Em breve!' });
  });

  // Help - Cheatsheet
  useHotkeys('shift+?', (e) => {
    e.preventDefault();
    setShowCheatsheet(true);
  });

  return { showCheatsheet, setShowCheatsheet };
}
