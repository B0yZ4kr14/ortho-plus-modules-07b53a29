import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TratamentosTabProps {
  patient: any;
}

export function TratamentosTab({ patient }: TratamentosTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Planos de Tratamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Módulo de tratamentos em desenvolvimento</p>
            <p className="text-sm mt-2">
              Aqui serão exibidos os planos de tratamento, procedimentos realizados e agendados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
