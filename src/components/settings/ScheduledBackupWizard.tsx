import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
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
  isIncremental: boolean;
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  cloudStorageProvider: 's3' | 'google_drive' | 'dropbox' | 'none';
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
    isIncremental: false,
    includeModules: true,
    includePatients: true,
    includeHistory: true,
    includeProntuarios: true,
    includeAppointments: true,
    includeFinanceiro: true,
    enableCompression: true,
    enableEncryption: false,
    cloudStorageProvider: 'none',
    notificationEmails: [],
    isActive: true
  });

  const totalSteps = 5;
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
    if (step === 5) {
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

        {/* Step 2: Dados a Incluir */}
        {step === 2 && (
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
                { key: 'includeFinanceiro', label: 'Dados Financeiros' }
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

        {/* Step 3: Opções Avançadas */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Opções Avançadas</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.isIncremental}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, isIncremental: checked as boolean })
                  }
                />
                <Label>
                  Backup Incremental
                  <p className="text-xs text-muted-foreground">
                    Exporta apenas dados modificados desde o último backup
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.enableCompression}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, enableCompression: checked as boolean })
                  }
                />
                <Label>
                  Compressão Automática
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
                  Criptografia de Dados
                  <p className="text-xs text-muted-foreground">
                    Protege backups com criptografia AES-256
                  </p>
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Cloud Storage e Notificações */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Cloud Storage e Notificações</h3>
            </div>

            <div className="space-y-2">
              <Label>Provedor de Cloud Storage</Label>
              <Select
                value={config.cloudStorageProvider}
                onValueChange={(value: any) => 
                  setConfig({ ...config, cloudStorageProvider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (apenas local)</SelectItem>
                  <SelectItem value="s3">AWS S3</SelectItem>
                  <SelectItem value="google_drive">Google Drive</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                <Mail className="h-4 w-4 inline mr-1" />
                Emails para Notificação
              </Label>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={config.notificationEmails.join(', ')}
                onChange={(e) => 
                  setConfig({ 
                    ...config, 
                    notificationEmails: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Separe múltiplos emails com vírgula
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Resumo e Preview */}
        {step === 5 && (
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
                {config.isIncremental ? 'Incremental' : 'Completo'}
              </div>
              <div>
                <span className="font-medium">Compressão:</span>{' '}
                {config.enableCompression ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">Criptografia:</span>{' '}
                {config.enableEncryption ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">Cloud Storage:</span>{' '}
                {config.cloudStorageProvider === 'none' ? 'Não configurado' : config.cloudStorageProvider.toUpperCase()}
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