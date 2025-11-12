import { useState } from 'react';
import { Database, Download, Upload, Clock, Play, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function DatabaseBackupTab() {
  const { clinicId } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('json');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const handleExportData = async () => {
    if (!clinicId) {
      toast.error('Clínica não identificada');
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-clinic-data', {
        body: { format: exportFormat, clinic_id: clinicId }
      });

      if (error) throw error;

      // Criar arquivo para download
      const blob = new Blob([data.content], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ortho-plus-backup-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Dados exportados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados', { 
        description: error.message || 'Tente novamente mais tarde' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !clinicId) return;

    setIsImporting(true);
    try {
      const content = await file.text();
      let parsedData;

      try {
        parsedData = JSON.parse(content);
      } catch (e) {
        toast.error('Formato de arquivo inválido', {
          description: 'O arquivo deve estar em formato JSON válido'
        });
        setIsImporting(false);
        return;
      }

      const { error } = await supabase.functions.invoke('import-clinic-data', {
        body: { data: parsedData, clinic_id: clinicId }
      });

      if (error) throw error;

      toast.success('Dados importados com sucesso!', {
        description: 'Os dados foram carregados para o sistema'
      });
    } catch (error: any) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados', { 
        description: error.message || 'Verifique o formato do arquivo' 
      });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleManualBackup = async () => {
    if (!clinicId) return;

    setIsExporting(true);
    try {
      const { error } = await supabase.functions.invoke('manual-backup', {
        body: { clinic_id: clinicId }
      });

      if (error) throw error;

      toast.success('Backup manual iniciado!', {
        description: 'Você receberá uma notificação quando concluído'
      });
    } catch (error: any) {
      console.error('Erro ao iniciar backup:', error);
      toast.error('Erro ao iniciar backup', { 
        description: error.message 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleAutoBackup = async (enabled: boolean) => {
    if (!clinicId) return;

    try {
      const { error } = await supabase.functions.invoke('configure-auto-backup', {
        body: { 
          clinic_id: clinicId,
          enabled,
          frequency: backupFrequency
        }
      });

      if (error) throw error;

      setAutoBackupEnabled(enabled);
      toast.success(
        enabled ? 'Backup automático ativado!' : 'Backup automático desativado',
        { description: enabled ? `Frequência: ${backupFrequency}` : undefined }
      );
    } catch (error: any) {
      console.error('Erro ao configurar backup automático:', error);
      toast.error('Erro ao configurar backup automático', { 
        description: error.message 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Mantenha seus dados seguros com backups regulares. Os backups são criptografados e armazenados com segurança.
        </AlertDescription>
      </Alert>

      {/* Backup Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Backup Manual
          </CardTitle>
          <CardDescription>
            Execute um backup completo dos dados da clínica imediatamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleManualBackup}
            disabled={isExporting}
            className="w-full"
          >
            <Database className="mr-2 h-4 w-4" />
            {isExporting ? 'Executando Backup...' : 'Executar Backup Agora'}
          </Button>
        </CardContent>
      </Card>

      {/* Backup Automático */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backup Automático Agendado
          </CardTitle>
          <CardDescription>
            Configure backups automáticos periódicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Ativar Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Backups serão executados automaticamente
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={autoBackupEnabled}
              onCheckedChange={handleToggleAutoBackup}
            />
          </div>

          {autoBackupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência de Backup</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Próximo backup agendado: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exportação de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Dados
          </CardTitle>
          <CardDescription>
            Faça download dos dados da clínica em CSV ou JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Recomendado)</SelectItem>
                <SelectItem value="csv">CSV (Planilha)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {exportFormat === 'json' 
                ? 'JSON preserva toda a estrutura dos dados, ideal para reimportação'
                : 'CSV é compatível com Excel e Google Sheets, mas possui limitações estruturais'
              }
            </p>
          </div>

          <Button 
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar Dados'}
          </Button>
        </CardContent>
      </Card>

      {/* Importação de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Dados
          </CardTitle>
          <CardDescription>
            Importe dados de backups anteriores ou outros sistemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> A importação pode sobrescrever dados existentes. 
              Faça um backup antes de importar.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="import-file">Selecionar Arquivo</Label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportData}
              disabled={isImporting}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                file:cursor-pointer cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Apenas arquivos JSON exportados pelo sistema são suportados
            </p>
          </div>

          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Importando dados...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
