import { useState, useEffect } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { User, FileSpreadsheet, Calendar } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useDebounce } from 'use-debounce';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const navigate = useNavigate();
  
  const { data: results } = useGlobalSearch(debouncedQuery);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Buscar pacientes, prontuários, orçamentos..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        {results?.patients && results.patients.length > 0 && (
          <CommandGroup heading="Pacientes">
            {results.patients.map((patient) => (
              <CommandItem
                key={patient.id}
                onSelect={() => {
                  navigate(patient.url);
                  setOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{patient.title} - {patient.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {results?.budgets && results.budgets.length > 0 && (
          <CommandGroup heading="Orçamentos">
            {results.budgets.map((budget) => (
              <CommandItem
                key={budget.id}
                onSelect={() => {
                  navigate(budget.url);
                  setOpen(false);
                }}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>{budget.title} - {budget.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {results?.appointments && results.appointments.length > 0 && (
          <CommandGroup heading="Agendamentos">
            {results.appointments.map((appointment) => (
              <CommandItem
                key={appointment.id}
                onSelect={() => {
                  navigate(appointment.url);
                  setOpen(false);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{appointment.title} - {appointment.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
