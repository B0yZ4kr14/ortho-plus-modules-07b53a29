import { useState, useEffect } from 'react';
import { Search, Users, Calendar, FileText, Stethoscope, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'patient' | 'dentist' | 'appointment' | 'procedure';
  route: string;
  icon: any;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }

    const searchGlobal = async () => {
      setIsLoading(true);
      try {
        const searchTerm = `%${search}%`;
        
        // Buscar pacientes através da tabela prontuarios (que tem patient_id)
        const { data: prontuarios } = await supabase
          .from('prontuarios')
          .select('id, patient_id')
          .limit(5);

        // Buscar agendamentos
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, title, start_time, status')
          .ilike('title', searchTerm)
          .limit(5);

        // Buscar tratamentos
        const { data: tratamentos } = await supabase
          .from('pep_tratamentos')
          .select('id, descricao, status')
          .ilike('descricao', searchTerm)
          .limit(5);

        const newResults: SearchResult[] = [];

        prontuarios?.forEach((p) => {
          newResults.push({
            id: p.id,
            title: `Paciente ${p.patient_id?.substring(0, 8)}`,
            subtitle: 'Prontuário',
            type: 'patient',
            route: `/pacientes`,
            icon: Users,
          });
        });

        appointments?.forEach((apt) => {
          newResults.push({
            id: apt.id,
            title: apt.title,
            subtitle: new Date(apt.start_time).toLocaleDateString('pt-BR'),
            type: 'appointment',
            route: `/agenda`,
            icon: Calendar,
          });
        });

        tratamentos?.forEach((trat) => {
          newResults.push({
            id: trat.id,
            title: trat.descricao || 'Tratamento',
            subtitle: trat.status,
            type: 'procedure',
            route: `/pep`,
            icon: Stethoscope,
          });
        });

        setResults(newResults);
      } catch (error) {
        console.error('Erro ao buscar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchGlobal, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.route);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <div 
        className="relative w-full max-w-2xl cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="h-10 w-full rounded-xl border-0 bg-muted/50 pl-10 pr-3 text-sm text-muted-foreground flex items-center hover:bg-muted/70 transition-all shadow-sm hover:shadow-md backdrop-blur-sm">
          Buscar pacientes, agendamentos, tratamentos...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shadow-sm">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar pacientes, agendamentos, tratamentos..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isLoading && search.length >= 2 && results.length === 0 && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}

          {!isLoading && results.length > 0 && (
            <>
              {['patient', 'appointment', 'procedure'].map((type) => {
                const filtered = results.filter((r) => r.type === type);
                if (filtered.length === 0) return null;

                const groupLabels = {
                  patient: 'Pacientes',
                  appointment: 'Agendamentos',
                  procedure: 'Tratamentos',
                  dentist: 'Dentistas',
                };

                return (
                  <CommandGroup key={type} heading={groupLabels[type as keyof typeof groupLabels]}>
                    {filtered.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <result.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
