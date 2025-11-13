import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, Calendar, Clock, Database, Cloud, Mail } from 'lucide-react';

interface ScheduledBackupConfig {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  backupType: 'full' | 'incremental' | 'differential';
  isIncremental: boolean;
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  includePostgresDB: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  cloudStorageProvider: 's3' | 'google_drive' | 'dropbox' | 'ftp' | 'storj' | 'local' | 'none';
  ftpConfig?: {
    host: string;
    port: number;
    username: string;
    password: string;
    remotePath: string;
  };
  storjConfig?: {
    accessGrant: string;
    bucket: string;
    prefix: string;
  };
  localPath?: string;
  notificationEmails: string[];
  isActive: boolean;
}

interface ScheduledBackupWizardProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduledBackupWizard({ open, onClose }: ScheduledBackupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  
  const [config, setConfig] = useState<ScheduledBackupConfig>({
    name: '',
    frequency: 'daily',
    timeOfDay: '02:00',
    backupType: 'full',
    isIncremental: false,
    includeModules: true,
    includePatients: true,
    includeHistory: true,
    includeProntuarios: true,
    includeAppointments: true,
    includeFinanceiro: true,
    includePostgresDB: true,
    enableCompression: true,
    enableEncryption: false,
    cloudStorageProvider: 'local',
    notificationEmails: [],
    isActive: true
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const calculateNextExecutions = (cfg: ScheduledBackupConfig, count = 5) => {
    const executions: string[] = [];
    const now = new Date();
    const [hours, minutes] = cfg.timeOfDay.split(':').map(Number);
    
    for (let i = 0; i < count; i++) {
      const nextDate = new Date(now);
      nextDate.setHours(hours, minutes, 0, 0);
      
      switch (cfg.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + i + (i === 0 && nextDate <= now ? 1 : 0));
          break;
        case 'weekly':
          if (cfg.dayOfWeek !== undefined) {
            const daysUntilTarget = (cfg.dayOfWeek - now.getDay() + 7) % 7;
            nextDate.setDate(nextDate.getDate() + daysUntilTarget + (i * 7));
            if (i === 0 && nextDate <= now) {
              nextDate.setDate(nextDate.getDate() + 7);
            }
          }
          break;
        case 'monthly':
          if (cfg.dayOfMonth !== undefined) {
            nextDate.setDate(cfg.dayOfMonth);
            nextDate.setMonth(nextDate.getMonth() + i);
            if (i === 0 && nextDate <= now) {
              nextDate.setMonth(nextDate.getMonth() + 1);
            }
          }
          break;
      }
      
      executions.push(nextDate.toLocaleString('pt-BR'));
    }
    
    return executions;
  };

  useEffect(() => {
    if (step === 6) {
      setNextExecutions(calculateNextExecutions(config));
    }
  }, [step, config]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('configure-auto-backup', {
        body: config
      });

      if (error) throw error;

      toast.success('Backup agendado configurado com sucesso!');
      onClose();
      setStep(1);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao configurar backup');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Backup Agendado</DialogTitle>
          <DialogDescription>
            Configure backups automáticos para sua clínica
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        {/* Step 1: Informações Básicas */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Informações Básicas</h3>
            </div>

            <div className="space-y-2">
              <Label>Nome do Backup</Label>
              <Input
                placeholder="Ex: Backup Diário Completo"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={config.frequency}
                onValueChange={(value: any) => setConfig({ ...config, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={config.timeOfDay}
                onChange={(e) => setConfig({ ...config, timeOfDay: e.target.value })}
              />
            </div>

            {config.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select
                  value={config.dayOfWeek?.toString()}
                  onValueChange={(value) => setConfig({ ...config, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Segunda</SelectItem>
                    <SelectItem value="2">Terça</SelectItem>
                    <SelectItem value="3">Quarta</SelectItem>
                    <SelectItem value="4">Quinta</SelectItem>
                    <SelectItem value="5">Sexta</SelectItem>
                    <SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Dia do Mês</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={config.dayOfMonth || ''}
                  onChange={(e) => setConfig({ ...config, dayOfMonth: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Tipo de Backup */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Tipo de Backup</h3>
            </div>

            <div className="space-y-3">
              <Card 
                className={`cursor-pointer transition-all ${config.backupType === 'full' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setConfig({ ...config, backupType: 'full', isIncremental: false })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {config.backupType === 'full' && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">Backup Completo (Full)</h4>
                      <p className="text-sm text-muted-foreground">
                        Copia todos os dados do sistema. Ocupa mais espaço mas permite restauração independente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${config.backupType === 'incremental' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setConfig({ ...config, backupType: 'incremental', isIncremental: true })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {config.backupType === 'incremental' && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">Backup Incremental</h4>
                      <p className="text-sm text-muted-foreground">
                        Copia apenas dados modificados desde o último backup (full ou incremental). Mais rápido e econômico.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${config.backupType === 'differential' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setConfig({ ...config, backupType: 'differential' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {config.backupType === 'differential' && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">Backup Diferencial</h4>
                      <p className="text-sm text-muted-foreground">
                        Copia dados modificados desde o último backup completo. Equilíbrio entre velocidade e facilidade de restauração.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Dados a Incluir */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Dados a Incluir</h3>
            </div>

            <div className="space-y-3">
              {[
                { key: 'includeModules', label: 'Configurações de Módulos' },
                { key: 'includePatients', label: 'Dados de Pacientes' },
                { key: 'includeHistory', label: 'Histórico Clínico' },
                { key: 'includeProntuarios', label: 'Prontuários Completos' },
                { key: 'includeAppointments', label: 'Agendamentos' },
                { key: 'includeFinanceiro', label: 'Dados Financeiros' },
                { key: 'includePostgresDB', label: 'Banco de Dados PostgreSQL (dump completo)' }
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={config[item.key as keyof ScheduledBackupConfig] as boolean}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, [item.key]: checked })
                    }
                  />
                  <Label>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Opções Avançadas */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Opções Avançadas</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.enableCompression}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enableCompression: checked as boolean })
                  }
                />
                <Label>
                  Compressão Automática (.zip)
                  <p className="text-xs text-muted-foreground">
                    Reduz o tamanho dos arquivos em até 60%
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.enableEncryption}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enableEncryption: checked as boolean })
                  }
                />
                <Label>
                  Criptografia AES-256-GCM
                  <p className="text-xs text-muted-foreground">
                    Protege backups com senha forte (recomendado para dados sensíveis)
                  </p>
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Destino do Backup */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Destino do Backup</h3>
            </div>

            <div className="space-y-2">
              <Label>Onde deseja armazenar o backup?</Label>
              <Select
                value={config.cloudStorageProvider}
                onValueChange={(value: any) => setConfig({ ...config, cloudStorageProvider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Armazenamento Local</SelectItem>
                  <SelectItem value="s3">Amazon S3</SelectItem>
                  <SelectItem value="google_drive">Google Drive</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                  <SelectItem value="ftp">FTP/SFTP</SelectItem>
                  <SelectItem value="storj">Storj DCS (Descentralizado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.cloudStorageProvider === 'local' && (
              <div className="space-y-2">
                <Label>Caminho Local</Label>
                <Input
                  placeholder="/var/backups/orthoplus"
                  value={config.localPath || ''}
                  onChange={(e) => setConfig({ ...config, localPath: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Caminho no servidor onde os backups serão salvos
                </p>
              </div>
            )}

            {config.cloudStorageProvider === 'ftp' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Servidor FTP/SFTP</Label>
                  <Input
                    placeholder="ftp.example.com"
                    value={config.ftpConfig?.host || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      ftpConfig: { ...config.ftpConfig!, host: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input
                    type="number"
                    placeholder="21"
                    value={config.ftpConfig?.port || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      ftpConfig: { ...config.ftpConfig!, port: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input
                    placeholder="username"
                    value={config.ftpConfig?.username || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      ftpConfig: { ...config.ftpConfig!, username: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={config.ftpConfig?.password || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      ftpConfig: { ...config.ftpConfig!, password: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Caminho Remoto</Label>
                  <Input
                    placeholder="/backups"
                    value={config.ftpConfig?.remotePath || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      ftpConfig: { ...config.ftpConfig!, remotePath: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {config.cloudStorageProvider === 'storj' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Access Grant</Label>
                  <Input
                    placeholder="Seu access grant do Storj DCS"
                    value={config.storjConfig?.accessGrant || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storjConfig: { ...config.storjConfig!, accessGrant: e.target.value }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtenha seu access grant em: <a href="https://storj.io" target="_blank" className="text-primary underline">storj.io</a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Bucket</Label>
                  <Input
                    placeholder="orthoplus-backups"
                    value={config.storjConfig?.bucket || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storjConfig: { ...config.storjConfig!, bucket: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prefixo (opcional)</Label>
                  <Input
                    placeholder="clinic-name/"
                    value={config.storjConfig?.prefix || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      storjConfig: { ...config.storjConfig!, prefix: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label>E-mails para Notificação (opcional)</Label>
              <Input
                placeholder="admin@example.com, backup@example.com"
                value={config.notificationEmails.join(', ')}
                onChange={(e) => 
                  setConfig({ 
                    ...config, 
                    notificationEmails: e.target.value.split(',').map(e => e.trim()).filter(Boolean)
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Separe múltiplos e-mails com vírgula
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Resumo e Preview */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Resumo da Configuração</h3>
            </div>

            <Card className="p-4 space-y-2">
              <div>
                <span className="font-medium">Nome:</span> {config.name}
              </div>
              <div>
                <span className="font-medium">Frequência:</span>{' '}
                {config.frequency === 'daily' && 'Diário'}
                {config.frequency === 'weekly' && 'Semanal'}
                {config.frequency === 'monthly' && 'Mensal'}
                {' às '}{config.timeOfDay}
              </div>
              <div>
                <span className="font-medium">Tipo:</span>{' '}
                {config.backupType === 'full' && 'Completo (Full)'}
                {config.backupType === 'incremental' && 'Incremental'}
                {config.backupType === 'differential' && 'Diferencial'}
              </div>
              <div>
                <span className="font-medium">Compressão:</span>{' '}
                {config.enableCompression ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">Criptografia:</span>{' '}
                {config.enableEncryption ? 'Sim (AES-256-GCM)' : 'Não'}
              </div>
              <div>
                <span className="font-medium">Destino:</span>{' '}
                {config.cloudStorageProvider === 'local' && 'Armazenamento Local'}
                {config.cloudStorageProvider === 's3' && 'Amazon S3'}
                {config.cloudStorageProvider === 'google_drive' && 'Google Drive'}
                {config.cloudStorageProvider === 'dropbox' && 'Dropbox'}
                {config.cloudStorageProvider === 'ftp' && 'FTP/SFTP'}
                {config.cloudStorageProvider === 'storj' && 'Storj DCS'}
              </div>
            </Card>

            <div>
              <h4 className="font-medium mb-2">Próximas 5 Execuções:</h4>
              <div className="space-y-1">
                {nextExecutions.map((date, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{i + 1}</Badge>
                    <span>{date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !config.name}>
              {loading ? 'Configurando...' : 'Confirmar e Ativar'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}