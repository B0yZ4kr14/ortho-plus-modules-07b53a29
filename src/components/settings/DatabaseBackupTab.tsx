import { useState, useEffect } from 'react';
import { Database, Download, Upload, Clock, Play, AlertCircle, CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BackupHistory {
  id: string;
  backup_type: 'manual' | 'automatic' | 'scheduled';
  status: 'pending' | 'success' | 'failed' | 'in_progress';
  file_size_bytes: number | null;
  file_path: string | null;
  format: 'json' | 'csv' | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  metadata: any;
}

export function DatabaseBackupTab() {
  const { clinicId } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('json');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(true);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Buscar histórico de backups e configurações
  useEffect(() => {
    if (clinicId) {
      fetchBackupHistory();
      fetchRetentionConfig();
    }
  }, [clinicId]);

  const fetchRetentionConfig = async () => {
    if (!clinicId) return;

    setIsLoadingConfig(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('backup_retention_days, auto_cleanup_enabled')
        .eq('id', clinicId)
        .single();

      if (error) throw error;

      if (data) {
        setRetentionDays(data.backup_retention_days || 90);
        setAutoCleanupEnabled(data.auto_cleanup_enabled ?? true);
      }
    } catch (error: any) {
      console.error('Erro ao buscar configuração de retenção:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchBackupHistory = async () => {
    if (!clinicId) return;

    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setBackupHistory((data || []) as BackupHistory[]);
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de backups');
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
      
      // Atualizar histórico após exportação bem-sucedida
      await fetchBackupHistory();
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

      // Atualizar histórico
      await fetchBackupHistory();
    } catch (error: any) {
      console.error('Erro ao iniciar backup:', error);
      toast.error('Erro ao iniciar backup', { 
        description: error.message 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBackup = async (backup: BackupHistory) => {
    if (!backup.file_path) {
      toast.error('Arquivo de backup não disponível');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('download-backup', {
        body: { backup_id: backup.id, clinic_id: clinicId }
      });

      if (error) throw error;

      // Criar arquivo para download
      const blob = new Blob([data.content], { 
        type: backup.format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backup.created_at.split('T')[0]}.${backup.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Backup baixado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao baixar backup:', error);
      toast.error('Erro ao baixar backup', { description: error.message });
    }
  };

  const handleRestoreBackup = async (backup: BackupHistory) => {
    if (!backup.file_path) {
      toast.error('Arquivo de backup não disponível para restauração');
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja restaurar este backup? Esta ação irá sobrescrever os dados atuais.'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase.functions.invoke('restore-backup', {
        body: { backup_id: backup.id, clinic_id: clinicId }
      });

      if (error) throw error;

      toast.success('Backup restaurado com sucesso!', {
        description: 'Os dados foram restaurados. Recarregue a página para ver as alterações.'
      });

      // Atualizar histórico
      await fetchBackupHistory();
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup', { description: error.message });
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

  const handleUpdateRetention = async () => {
    if (!clinicId) return;

    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          backup_retention_days: retentionDays,
          auto_cleanup_enabled: autoCleanupEnabled
        })
        .eq('id', clinicId);

      if (error) throw error;

      toast.success('Configuração de retenção atualizada!', {
        description: `Backups serão mantidos por ${retentionDays} dias`
      });
    } catch (error: any) {
      console.error('Erro ao atualizar retenção:', error);
      toast.error('Erro ao atualizar configuração', { 
        description: error.message 
      });
    }
  };

  const handleManualCleanup = async () => {
    if (!clinicId) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja executar a limpeza manual de backups?\n\nBackups com mais de ${retentionDays} dias serão removidos permanentemente.`
    );

    if (!confirmed) return;

    try {
      const { data, error } = await supabase.functions.invoke('cleanup-old-backups', {
        body: { clinic_id: clinicId }
      });

      if (error) throw error;

      toast.success('Limpeza concluída!', {
        description: `${data.deleted_count} backup(s) removido(s), ${formatBytes(data.freed_bytes)} liberados`
      });

      // Atualizar histórico
      await fetchBackupHistory();
    } catch (error: any) {
      console.error('Erro ao executar limpeza:', error);
      toast.error('Erro ao executar limpeza', { 
        description: error.message 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      failed: 'destructive',
      in_progress: 'secondary',
      pending: 'outline'
    };

    const labels: Record<string, string> = {
      success: 'Concluído',
      failed: 'Falhou',
      in_progress: 'Em Progresso',
      pending: 'Pendente'
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {/* Retenção e Limpeza Automática */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Retenção e Limpeza de Backups
          </CardTitle>
          <CardDescription>
            Configure por quanto tempo os backups devem ser mantidos antes da limpeza automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-cleanup">Ativar Limpeza Automática</Label>
              <p className="text-sm text-muted-foreground">
                Backups antigos serão removidos automaticamente
              </p>
            </div>
            <Switch
              id="auto-cleanup"
              checked={autoCleanupEnabled}
              onCheckedChange={setAutoCleanupEnabled}
              disabled={isLoadingConfig}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Período de Retenção</Label>
            <Select 
              value={retentionDays.toString()} 
              onValueChange={(value) => setRetentionDays(parseInt(value))}
              disabled={isLoadingConfig}
            >
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias (1 mês)</SelectItem>
                <SelectItem value="60">60 dias (2 meses)</SelectItem>
                <SelectItem value="90">90 dias (3 meses) - Recomendado</SelectItem>
                <SelectItem value="180">180 dias (6 meses)</SelectItem>
                <SelectItem value="365">365 dias (1 ano)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {autoCleanupEnabled 
                ? `Backups com mais de ${retentionDays} dias serão automaticamente removidos`
                : 'A limpeza automática está desativada. Backups serão mantidos indefinidamente.'
              }
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdateRetention}
              disabled={isLoadingConfig}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Salvar Configuração
            </Button>
            
            <Button 
              onClick={handleManualCleanup}
              variant="outline"
              disabled={isLoadingConfig}
              className="flex-1"
            >
              <Database className="mr-2 h-4 w-4" />
              Executar Limpeza Agora
            </Button>
          </div>

          {autoCleanupEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A limpeza automática é executada diariamente às 3h da manhã. 
                Backups com status "falhou" ou "pendente" não são removidos automaticamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Todos os backups executados nos últimos 90 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : backupHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum backup encontrado</p>
              <p className="text-sm">Execute seu primeiro backup para começar</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(backup.status)}
                          {getStatusBadge(backup.status)}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {backup.backup_type === 'manual' ? 'Manual' : 
                         backup.backup_type === 'automatic' ? 'Automático' : 'Agendado'}
                      </TableCell>
                      <TableCell>{formatDate(backup.created_at)}</TableCell>
                      <TableCell>{formatBytes(backup.file_size_bytes)}</TableCell>
                      <TableCell className="uppercase">{backup.format || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {backup.status === 'success' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadBackup(backup)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestoreBackup(backup)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {backup.status === 'failed' && backup.error_message && (
                            <span className="text-xs text-destructive max-w-[200px] truncate" title={backup.error_message}>
                              {backup.error_message}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
