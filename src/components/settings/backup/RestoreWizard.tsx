import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RestoreWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestoreWizard({ open, onOpenChange }: RestoreWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedBackup, setSelectedBackup] = useState('');

  const backups = [
    { id: '1', date: '15/11/2025 18:30', type: 'Full', size: '2.3 GB', status: 'success' },
    { id: '2', date: '15/11/2025 12:00', type: 'Incremental', size: '156 MB', status: 'success' },
    { id: '3', date: '14/11/2025 18:30', type: 'Full', size: '2.2 GB', status: 'success' },
  ];

  const selectedBackupData = backups.find(b => b.id === selectedBackup);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    // Implementar lógica de restauração
    console.log({ selectedBackup });
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Restaurar Backup - Etapa {step} de 3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <Label>Selecione o Backup</Label>
            <RadioGroup value={selectedBackup} onValueChange={setSelectedBackup}>
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                >
                  <RadioGroupItem value={backup.id} id={backup.id} />
                  <Label htmlFor={backup.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{backup.date}</div>
                        <div className="text-sm text-muted-foreground">
                          {backup.type} • {backup.size}
                        </div>
                      </div>
                      {backup.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 2 && selectedBackupData && (
          <div className="space-y-4 py-4">
            <Label>Pré-visualização dos Dados</Label>
            <div className="space-y-3">
              {[
                { label: 'Pacientes', count: '1.234', icon: Database },
                { label: 'Consultas', count: '5.678', icon: Clock },
                { label: 'Prontuários', count: '987', icon: CheckCircle },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="text-muted-foreground">{item.count} registros</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-1">
              <div className="font-medium">Detalhes do Backup</div>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Data: {selectedBackupData.date}</p>
                <p>Tipo: {selectedBackupData.type}</p>
                <p>Tamanho: {selectedBackupData.size}</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta ação irá sobrescrever os dados atuais do sistema.
                Certifique-se de ter um backup recente antes de continuar.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-5 w-5 text-destructive" />
                O que será restaurado?
              </div>
              <ul className="text-sm space-y-1 ml-7 text-muted-foreground">
                <li>• Todos os dados serão revertidos para {selectedBackupData?.date}</li>
                <li>• Alterações feitas após esta data serão perdidas</li>
                <li>• O processo pode levar alguns minutos</li>
                <li>• O sistema ficará temporariamente indisponível</li>
              </ul>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Recomendamos criar um backup dos dados atuais antes de prosseguir.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 && !selectedBackup}>
              Próximo
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleConfirm}>
              Confirmar Restauração
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
