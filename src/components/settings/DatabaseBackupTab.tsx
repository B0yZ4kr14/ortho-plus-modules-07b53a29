import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BackupStatsDashboard } from "./BackupStatsDashboard";
import { ScheduledBackupWizard } from "./ScheduledBackupWizard";
import { BackupRestoreDialog } from "./BackupRestoreDialog";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Database
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

interface BackupHistory {
  id: string;
  created_at: string;
  format: string;
  file_size_bytes: number;
  status: string;
}

export default function DatabaseBackupTab() {
  const { toast } = useToast();
  const { clinicId } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [showScheduleWizard, setShowScheduleWizard] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File>();

  const formats = [
    { value: 'json', label: 'JSON', icon: FileJson, description: 'Formato estruturado' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Planilha simples' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Planilha avançada' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Documento visual' },
  ];

  const handleExport = async () => {
    if (!clinicId) {
      toast({
        title: "Erro",
        description: "Clínica não identificada",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke('export-clinic-data', {
        body: { 
          clinic_id: clinicId,
          format: selectedFormat 
        },
      });

      if (error) throw error;

      // Criar blob e fazer download
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: selectedFormat === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orthoplus_backup_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exportação concluída",
        description: `Dados exportados em formato ${selectedFormat.toUpperCase()}`,
      });

      // Recarregar histórico
      loadBackupHistory();

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const loadBackupHistory = async () => {
    if (!clinicId) return;

    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBackupHistory((data || []) as BackupHistory[]);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <BackupStatsDashboard />
      
      <ScheduledBackupWizard 
        open={showScheduleWizard}
        onClose={() => setShowScheduleWizard(false)}
      />
      
      <BackupRestoreDialog
        open={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        backupFile={selectedBackupFile}
      />
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Conformidade LGPD:</strong> Este recurso permite exportação completa dos dados da clínica
          para atendimento de solicitações de portabilidade de dados conforme Art. 18 da LGPD.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Exportação de Dados
            </h3>
            <p className="text-sm text-muted-foreground">
              Faça backup completo dos dados da clínica em diferentes formatos
            </p>
          </div>

          {/* Seletor de Formato */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formats.map((format) => {
              const Icon = format.icon;
              return (
                <Card
                  key={format.value}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedFormat === format.value
                      ? 'ring-2 ring-primary bg-primary/5'
                      : ''
                  }`}
                  onClick={() => setSelectedFormat(format.value as ExportFormat)}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Icon className={`h-8 w-8 ${
                      selectedFormat === format.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <div className="font-semibold">{format.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {format.description}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Exportar Agora
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setShowScheduleWizard(true)}
              variant="outline"
              size="lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Agendar
            </Button>
            
            <Button 
              onClick={() => setShowRestoreDialog(true)}
              variant="secondary"
              size="lg"
            >
              <Database className="mr-2 h-5 w-5" />
              Restaurar
            </Button>
          </div>
        </div>
      </Card>

      {/* Histórico de Backups */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Exportações
        </h3>

        {backupHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma exportação realizada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {backup.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      Backup {backup.format.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(backup.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={backup.status === 'success' ? 'success' : 'destructive'}>
                    {backup.status === 'success' ? 'Sucesso' : 'Falha'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(backup.file_size_bytes)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      supabase.functions.invoke('validate-backup-integrity', {
                        body: { backupId: backup.id }
                      }).then(({ data, error }) => {
                        if (error) {
                          toast({ title: 'Erro ao validar', variant: 'destructive' });
                        } else if (data.isValid) {
                          toast({ title: '✓ Backup íntegro', description: 'Checksums validados' });
                        } else {
                          toast({ title: '⚠ Backup corrompido', variant: 'destructive' });
                        }
                      });
                    }}
                  >
                    Validar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Informações Adicionais */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">O que está incluído na exportação:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Dados cadastrais de pacientes</li>
              <li>Prontuários eletrônicos (PEP)</li>
              <li>Histórico clínico e tratamentos</li>
              <li>Odontogramas e anexos</li>
              <li>Registros financeiros</li>
              <li>Logs de auditoria</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
