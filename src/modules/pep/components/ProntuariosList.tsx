import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Plus } from 'lucide-react';
import { Prontuario } from '../types/pep.types';
import { useState } from 'react';

interface ProntuariosListProps {
  prontuarios: Prontuario[];
  onSelect: (prontuario: Prontuario) => void;
  onCreate: () => void;
}

export function ProntuariosList({ prontuarios, onSelect, onCreate }: ProntuariosListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProntuarios = prontuarios.filter(p =>
    p.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Prontuário
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredProntuarios.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum prontuário encontrado' : 'Nenhum prontuário cadastrado'}
            </p>
          </Card>
        ) : (
          filteredProntuarios.map((prontuario) => (
            <Card
              key={prontuario.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(prontuario)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {prontuario.patient_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Criado em {formatDate(prontuario.created_at)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
