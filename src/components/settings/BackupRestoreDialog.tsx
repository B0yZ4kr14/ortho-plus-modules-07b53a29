import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Check, 
  Database, 
  Users, 
  Calendar, 
  FileText,
  Lock,
  Loader2
} from 'lucide-react';

interface BackupData {
  version: string;
  exportedAt: string;
  clinicId: string;
  backupId: string;
  isIncremental: boolean;
  data: {
    modules?: any[];
    patients?: any[];
    historicoClinico?: any[];
    prontuarios?: any[];
    odontogramas?: any[];
    appointments?: any[];
    financeiro?: {
      contasReceber: any[];
      contasPagar: any[];
    };
  };
}

interface BackupRestoreDialogProps {
  open: boolean;
  onClose: () => void;
  backupFile?: File;
}

export function BackupRestoreDialog({ open, onClose, backupFile }: BackupRestoreDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [decryptionPassword, setDecryptionPassword] = useState('');
  const [requiresDecryption, setRequiresDecryption] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [selectedItems, setSelectedItems] = useState({
    modules: true,
    patients: false,
    historicoClinico: false,
    prontuarios: false,
    appointments: false,
    financeiro: false
  });

  const [restoreResults, setRestoreResults] = useState<any>(null);

  const loadBackupFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      let data = text;
      
      // Check if encrypted (starts with base64)
      if (text.match(/^[A-Za-z0-9+/=]+$/)) {
        setRequiresDecryption(true);
        setStep(2); // Go to decryption step
        return;
      }
      
      const parsed = JSON.parse(data);
      setBackupData(parsed);
      setStep(3); // Go to selection step
      toast.success('Backup carregado com sucesso!');
    } catch (error) {
      console.error('Error loading backup:', error);
      toast.error('Erro ao carregar backup', {
        description: 'Arquivo inválido ou corrompido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!backupFile || !decryptionPassword) return;
    
    setLoading(true);
    try {
      const text = await backupFile.text();
      
      // Call restore-backup with decryption
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: {
          backupData: text,
          decryptionPassword
        }
      });
      
      if (error) throw error;
      
      setBackupData(data);
      setStep(3);
      toast.success('Backup descriptografado com sucesso!');
    } catch (error) {
      console.error('Error decrypting:', error);
      toast.error('Erro ao descriptografar', {
        description: 'Senha incorreta ou backup corrompido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!backupData) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      setProgress(20);
      
      // Filter data based on selection
      const dataToRestore = {
        version: backupData.version,
        data: {
          ...(selectedItems.modules && backupData.data.modules && { modules: backupData.data.modules }),
          ...(selectedItems.patients && backupData.data.patients && { patients: backupData.data.patients }),
          ...(selectedItems.historicoClinico && backupData.data.historicoClinico && { historicoClinico: backupData.data.historicoClinico }),
          ...(selectedItems.prontuarios && backupData.data.prontuarios && { prontuarios: backupData.data.prontuarios }),
          ...(selectedItems.appointments && backupData.data.appointments && { appointments: backupData.data.appointments }),
          ...(selectedItems.financeiro && backupData.data.financeiro && { financeiro: backupData.data.financeiro })
        }
      };
      
      setProgress(40);
      
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: {
          backupData: JSON.stringify(dataToRestore)
        }
      });
      
      setProgress(80);
      
      if (error) throw error;
      
      setProgress(100);
      setRestoreResults(data.results);
      setStep(4); // Go to results step
      
      toast.success('Restauração concluída!', {
        description: `${Object.values(data.results).reduce((a: number, b: number) => a + b, 0)} registros restaurados`
      });
      
    } catch (error) {
      console.error('Error restoring:', error);
      toast.error('Erro ao restaurar backup', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Restaurar Backup</DialogTitle>
          <DialogDescription>
            Restaure dados de um backup anterior
          </DialogDescription>
        </DialogHeader>

        {loading && <Progress value={progress} className="mb-4" />}

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> A restauração irá sobrescrever os dados atuais. Certifique-se de que deseja continuar.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Selecione o arquivo de backup</Label>
              <Input
                type="file"
                accept=".json,.zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadBackupFile(file);
                }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Decryption */}
        {step === 2 && requiresDecryption && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Backup Criptografado</h3>
            </div>

            <Alert>
              <AlertDescription>
                Este backup está criptografado. Digite a senha para continuar.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Senha de Descriptografia</Label>
              <Input
                type="password"
                value={decryptionPassword}
                onChange={(e) => setDecryptionPassword(e.target.value)}
                placeholder="Digite a senha do backup"
              />
            </div>

            <Button 
              onClick={handleDecrypt} 
              disabled={!decryptionPassword || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Descriptografando...
                </>
              ) : (
                'Descriptografar'
              )}
            </Button>
          </div>
        )}

        {/* Step 3: Data Selection and Preview */}
        {step === 3 && backupData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Selecione os Dados para Restaurar</h3>
            </div>

            <Card className="p-4 space-y-2 bg-muted/50">
              <div><strong>Backup ID:</strong> {backupData.backupId}</div>
              <div><strong>Exportado em:</strong> {new Date(backupData.exportedAt).toLocaleString('pt-BR')}</div>
              <div><strong>Versão:</strong> {backupData.version}</div>
              <div>
                <Badge variant={backupData.isIncremental ? "secondary" : "default"}>
                  {backupData.isIncremental ? 'Incremental' : 'Completo'}
                </Badge>
              </div>
            </Card>

            <div className="space-y-3">
              {backupData.data.modules && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={selectedItems.modules}
                    onCheckedChange={(checked) => 
                      setSelectedItems({ ...selectedItems, modules: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Configurações de Módulos
                      <Badge variant="outline">{backupData.data.modules.length} itens</Badge>
                    </Label>
                  </div>
                </div>
              )}

              {backupData.data.patients && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={selectedItems.patients}
                    onCheckedChange={(checked) => 
                      setSelectedItems({ ...selectedItems, patients: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Pacientes
                      <Badge variant="outline">{backupData.data.patients.length} itens</Badge>
                    </Label>
                  </div>
                </div>
              )}

              {backupData.data.historicoClinico && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={selectedItems.historicoClinico}
                    onCheckedChange={(checked) => 
                      setSelectedItems({ ...selectedItems, historicoClinico: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Histórico Clínico
                      <Badge variant="outline">{backupData.data.historicoClinico.length} itens</Badge>
                    </Label>
                  </div>
                </div>
              )}

              {backupData.data.prontuarios && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={selectedItems.prontuarios}
                    onCheckedChange={(checked) => 
                      setSelectedItems({ ...selectedItems, prontuarios: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Prontuários Completos
                      <Badge variant="outline">{backupData.data.prontuarios.length} itens</Badge>
                    </Label>
                  </div>
                </div>
              )}

              {backupData.data.appointments && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={selectedItems.appointments}
                    onCheckedChange={(checked) => 
                      setSelectedItems({ ...selectedItems, appointments: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Agendamentos
                      <Badge variant="outline">{backupData.data.appointments.length} itens</Badge>
                    </Label>
                  </div>
                </div>
              )}

              {backupData.data.financeiro && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    checked={selectedItems.financeiro}
                    onCheckedChange={(checked) => 
                      setSelectedItems({ ...selectedItems, financeiro: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2">
                      Dados Financeiros
                      <Badge variant="outline">
                        {(backupData.data.financeiro.contasReceber?.length || 0) + 
                         (backupData.data.financeiro.contasPagar?.length || 0)} itens
                      </Badge>
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação é irreversível. Os dados selecionados serão restaurados e sobrescreverão os dados atuais.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleRestore} 
              disabled={loading || !Object.values(selectedItems).some(v => v)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                'Confirmar Restauração'
              )}
            </Button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && restoreResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <Check className="h-5 w-5" />
              <h3 className="font-semibold">Restauração Concluída</h3>
            </div>

            <Card className="p-4 space-y-2">
              <div className="font-semibold mb-2">Itens Restaurados:</div>
              {restoreResults.modules > 0 && (
                <div>✓ {restoreResults.modules} configurações de módulos</div>
              )}
              {restoreResults.patients > 0 && (
                <div>✓ {restoreResults.patients} pacientes</div>
              )}
              {restoreResults.historico > 0 && (
                <div>✓ {restoreResults.historico} registros de histórico clínico</div>
              )}
              {restoreResults.prontuarios > 0 && (
                <div>✓ {restoreResults.prontuarios} prontuários</div>
              )}
              {restoreResults.appointments > 0 && (
                <div>✓ {restoreResults.appointments} agendamentos</div>
              )}
              {restoreResults.financeiro > 0 && (
                <div>✓ {restoreResults.financeiro} registros financeiros</div>
              )}
            </Card>

            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}