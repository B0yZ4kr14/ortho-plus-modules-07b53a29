import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HistoricoTabProps {
  patient: any;
}

export function HistoricoTab({ patient }: HistoricoTabProps) {
  return (
    <div className="space-y-6">
      {/* Resumo do Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo do Histórico
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Primeira Consulta
            </label>
            <p className="text-lg font-semibold mt-2">
              {patient.first_appointment_date 
                ? new Date(patient.first_appointment_date).toLocaleDateString('pt-BR')
                : 'Não registrado'
              }
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Última Consulta
            </label>
            <p className="text-lg font-semibold mt-2">
              {patient.last_appointment_date 
                ? new Date(patient.last_appointment_date).toLocaleDateString('pt-BR')
                : 'Nunca consultou'
              }
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Total de Consultas
            </label>
            <p className="text-3xl font-bold mt-2">
              {patient.total_appointments || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Eventos - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Timeline de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Timeline de eventos em desenvolvimento</p>
            <p className="text-sm mt-2">
              Aqui será exibida uma timeline completa com todas as consultas, procedimentos, 
              pagamentos e eventos relacionados ao paciente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Cadastro */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Cadastro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Data de Cadastro
            </label>
            <p className="text-lg mt-2">
              {new Date(patient.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Última Atualização
            </label>
            <p className="text-lg mt-2">
              {new Date(patient.updated_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <div className="mt-2">
              <Badge 
                variant={
                  patient.status === 'ativo' ? 'default' :
                  patient.status === 'inativo' ? 'secondary' :
                  'outline'
                }
                className="text-base py-1.5"
              >
                {patient.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
