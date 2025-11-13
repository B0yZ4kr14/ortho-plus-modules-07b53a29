import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OdontogramaTabProps {
  patient: any;
}

export function OdontogramaTab({ patient }: OdontogramaTabProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Smile className="h-4 w-4" />
        <AlertDescription>
          O odontograma integrado será carregado aqui. Integração com o módulo existente de Odontograma.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Odontograma do Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Smile className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Integração com o módulo de Odontograma em desenvolvimento</p>
            <p className="text-sm mt-2">
              Paciente ID: {patient.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
