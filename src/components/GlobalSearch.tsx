import { useState, useEffect, memo } from 'react';
import { Search, Loader2, User, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'patient' | 'appointment' | 'procedure' | 'transaction' | 'product';
  route: string;
  icon: any;
}

const GlobalSearch = memo(function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clinicId } = useAuth();

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
    if (!debouncedSearch || !clinicId) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const searchResults: SearchResult[] = [];
      try {
        const query = debouncedSearch.toLowerCase();
        
        // Buscar pacientes
        const { data: patients } = await supabase
          .from('patients' as any)
          .select('id, full_name, cpf')
          .eq('clinic_id', clinicId)
          .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%`)
          .limit(3);
        
        if (patients) {
          searchResults.push(...patients.map((p: any) => ({ 
            id: p.id, 
            title: p.full_name, 
            subtitle: p.cpf, 
            type: 'patient' as const, 
            route: `/pacientes/${p.id}`, 
            icon: User 
          })));
        }

        // Buscar agendamentos
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, title, start_time')
          .eq('clinic_id', clinicId)
          .ilike('title', `%${query}%`)
          .limit(3);
        
        if (appointments) {
          searchResults.push(...appointments.map((a: any) => ({ 
            id: a.id, 
            title: a.title, 
            subtitle: new Date(a.start_time).toLocaleDateString('pt-BR'), 
            type: 'appointment' as const, 
            route: `/agenda`, 
            icon: Calendar 
          })));
        }

        // Buscar procedimentos
        const { data: procedures } = await supabase
          .from('procedimentos_odontologicos' as any)
          .select('id, nome, codigo')
          .ilike('nome', `%${query}%`)
          .limit(3);
        
        if (procedures) {
          searchResults.push(...procedures.map((p: any) => ({ 
            id: p.id, 
            title: p.nome, 
            subtitle: p.codigo || 'Procedimento', 
            type: 'procedure' as const, 
            route: `/procedimentos`, 
            icon: FileText 
          })));
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Erro ao buscar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedSearch, clinicId]);

  return (
    <>
      <div className="relative cursor-pointer" onClick={() => setOpen(true)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="w-full md:w-64 pl-10 pr-4 py-2 text-sm text-muted-foreground border border-border rounded-md bg-background hover:bg-accent/50 transition-colors">
          Buscar... <kbd className="ml-auto text-xs">⌘K</kbd>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar..." value={search} onValueChange={setSearch} />
        <CommandList>
          {loading && <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!loading && results.length === 0 && search && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}
          
          {results.filter(r => r.type === 'patient').length > 0 && (
            <CommandGroup heading="Pacientes">
              {results.filter(r => r.type === 'patient').map((r) => (
                <CommandItem key={r.id} onSelect={() => { navigate(r.route); setOpen(false); }}>
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.filter(r => r.type === 'appointment').length > 0 && (
            <CommandGroup heading="Agendamentos">
              {results.filter(r => r.type === 'appointment').map((r) => (
                <CommandItem key={r.id} onSelect={() => { navigate(r.route); setOpen(false); }}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.filter(r => r.type === 'procedure').length > 0 && (
            <CommandGroup heading="Procedimentos">
              {results.filter(r => r.type === 'procedure').map((r) => (
                <CommandItem key={r.id} onSelect={() => { navigate(r.route); setOpen(false); }}>
                  <FileText className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
});

export default GlobalSearch;
