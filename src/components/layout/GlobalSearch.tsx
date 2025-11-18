import { useState, useEffect } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { User, FileSpreadsheet, Calendar, DollarSign } from 'lucide-react';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
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
  
  const { data: results } = useQuery<{
    patients?: Array<{ id: string; full_name: string; phone_primary: string }>;
    budgets?: Array<{ id: string; patient_name: string }>;
  }>({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (query.length < 2) return null;
      try {
        return await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
      } catch (error) {
        console.error('Search error:', error);
        return null;
      }
    },
    enabled: query.length >= 2
  });
  
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
            {results.patients.map((patient: any) => (
              <CommandItem
                key={patient.id}
                onSelect={() => {
                  navigate(`/pacientes/${patient.id}`);
                  setOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{patient.full_name} - {patient.phone_primary}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {results?.budgets && results.budgets.length > 0 && (
          <CommandGroup heading="Orçamentos">
            {results.budgets.map((budget: any) => (
              <CommandItem
                key={budget.id}
                onSelect={() => {
                  navigate(`/orcamentos/${budget.id}`);
                  setOpen(false);
                }}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Orçamento #{budget.id} - {budget.patient_name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
