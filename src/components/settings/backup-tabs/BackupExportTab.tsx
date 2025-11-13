import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileJson, FileSpreadsheet, FileText, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

export function BackupExportTab() {
  const { clinicId } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');

  const formats = [
    { value: 'json', label: 'JSON', icon: FileJson, description: 'Formato estruturado' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Planilha Excel' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'XLSX nativo' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Documento' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-clinic-data', {
        body: {
          clinic_id: clinicId,
          format: selectedFormat
        }
      });

      if (error) throw error;

      const blob = new Blob([data], { 
        type: selectedFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.${selectedFormat}`;
      a.click();

      toast.success('Exportação concluída com sucesso');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportação de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato de Exportação</label>
            <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{format.label}</p>
                          <p className="text-xs text-muted-foreground">{format.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Dados incluídos na exportação:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Informações da clínica</li>
            <li>Cadastros de pacientes</li>
            <li>Prontuários e anamneses</li>
            <li>Agenda e consultas</li>
            <li>Dados financeiros</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertDescription className="text-sm">
          <strong>Conformidade LGPD:</strong> Todas as exportações são registradas no audit log 
          para fins de compliance e rastreabilidade.
        </AlertDescription>
      </Alert>
    </div>
  );
}
