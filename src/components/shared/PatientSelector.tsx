import { useState, useEffect } from 'react';
import { Search, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';
import type { Patient } from '@/types/patient';

interface PatientSelectorProps {
  onSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
  placeholder?: string;
  compact?: boolean;
}

export function PatientSelector({ 
  onSelect, 
  selectedPatient, 
  placeholder = "Buscar paciente...",
  compact = false 
}: PatientSelectorProps) {
  const { patients, loading } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(patient => 
      patient.full_name?.toLowerCase().includes(term) ||
      patient.cpf?.includes(term) ||
      patient.phone_primary?.includes(term) ||
      patient.email?.toLowerCase().includes(term)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Carregando pacientes...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (compact && selectedPatient) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedPatient.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            CPF: {selectedPatient.cpf || 'Não informado'}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onSelect(null as any)}
        >
          Trocar
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {selectedPatient ? 'Paciente Selecionado' : 'Selecione um Paciente'}
        </CardTitle>
        <CardDescription>
          {selectedPatient 
            ? 'Paciente atual do prontuário eletrônico'
            : 'Busque e selecione o paciente para acessar o prontuário'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPatient ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-primary/5">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-lg">{selectedPatient.full_name}</p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {selectedPatient.cpf && (
                    <span>CPF: {selectedPatient.cpf}</span>
                  )}
                  {selectedPatient.phone_primary && (
                    <span>• {selectedPatient.phone_primary}</span>
                  )}
                  {selectedPatient.email && (
                    <span>• {selectedPatient.email}</span>
                  )}
                </div>
                <Badge variant={selectedPatient.status === 'Ativo' ? 'default' : 'secondary'}>
                  {selectedPatient.status}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelect(null as any)}
              >
                Trocar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum paciente encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => onSelect(patient)}
                      className="w-full flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{patient.full_name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          {patient.cpf && <span>CPF: {patient.cpf}</span>}
                          {patient.phone_primary && <span>• {patient.phone_primary}</span>}
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
