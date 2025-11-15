import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Database, FileText, Users, Calendar, Package, CheckCircle } from 'lucide-react';

interface BackupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupWizard({ open, onOpenChange }: BackupWizardProps) {
  const [step, setStep] = useState(1);
  const [backupType, setBackupType] = useState('full');
  const [selectedData, setSelectedData] = useState<string[]>(['patients', 'appointments', 'records']);
  const [compression, setCompression] = useState(true);
  const [encryption, setEncryption] = useState(true);

  const dataOptions = [
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Agenda', icon: Calendar },
    { id: 'records', label: 'Prontuários', icon: FileText },
    { id: 'financial', label: 'Financeiro', icon: Database },
    { id: 'inventory', label: 'Estoque', icon: Package },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    // Implementar lógica de backup
    console.log({ backupType, selectedData, compression, encryption });
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Backup - Etapa {step} de 3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <Label>Tipo de Backup</Label>
            <RadioGroup value={backupType} onValueChange={setBackupType}>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="font-medium">Backup Completo (Full)</div>
                  <div className="text-sm text-muted-foreground">Cópia completa de todos os dados selecionados</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="incremental" id="incremental" />
                <Label htmlFor="incremental" className="flex-1 cursor-pointer">
                  <div className="font-medium">Backup Incremental</div>
                  <div className="text-sm text-muted-foreground">Apenas dados modificados desde o último backup</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="differential" id="differential" />
                <Label htmlFor="differential" className="flex-1 cursor-pointer">
                  <div className="font-medium">Backup Diferencial</div>
                  <div className="text-sm text-muted-foreground">Dados modificados desde o último backup completo</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <Label>Selecione os Dados</Label>
            <div className="grid grid-cols-2 gap-4">
              {dataOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedData(prev =>
                        prev.includes(option.id)
                          ? prev.filter(id => id !== option.id)
                          : [...prev, option.id]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedData.includes(option.id)}
                      onCheckedChange={() => {}}
                    />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Label className="flex-1 cursor-pointer font-medium">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 py-4">
            <Label>Opções Avançadas</Label>
            
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="space-y-0.5">
                <div className="font-medium">Compressão</div>
                <div className="text-sm text-muted-foreground">Reduz o tamanho do arquivo de backup</div>
              </div>
              <Switch checked={compression} onCheckedChange={setCompression} />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="space-y-0.5">
                <div className="font-medium">Criptografia</div>
                <div className="text-sm text-muted-foreground">Protege os dados com AES-256</div>
              </div>
              <Switch checked={encryption} onCheckedChange={setEncryption} />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="h-5 w-5 text-primary" />
                Resumo do Backup
              </div>
              <div className="text-sm space-y-1 ml-7">
                <p>Tipo: <span className="font-medium">{backupType === 'full' ? 'Completo' : backupType === 'incremental' ? 'Incremental' : 'Diferencial'}</span></p>
                <p>Dados: <span className="font-medium">{selectedData.length} categorias</span></p>
                <p>Compressão: <span className="font-medium">{compression ? 'Ativada' : 'Desativada'}</span></p>
                <p>Criptografia: <span className="font-medium">{encryption ? 'Ativada' : 'Desativada'}</span></p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Próximo</Button>
          ) : (
            <Button onClick={handleConfirm}>Confirmar Backup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
