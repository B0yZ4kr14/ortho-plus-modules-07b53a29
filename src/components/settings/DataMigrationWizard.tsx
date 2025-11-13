import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  Database,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Settings as SettingsIcon,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface ExportOptions {
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  format: 'json' | 'csv' | 'excel';
}

interface ImportOptions {
  overwriteExisting: boolean;
  skipConflicts: boolean;
  mergeData: boolean;
}

interface DataMigrationWizardProps {
  open: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
}

export function DataMigrationWizard({ open, onClose, mode }: DataMigrationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeModules: true,
    includePatients: true,
    includeHistory: true,
    includeProntuarios: true,
    includeAppointments: true,
    includeFinanceiro: false,
    format: 'json'
  });

  // Import options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwriteExisting: false,
    skipConflicts: true,
    mergeData: false
  });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any>(null);
  const [importResults, setImportResults] = useState<any>(null);

  const totalSteps = mode === 'export' ? 3 : 4;

  const handleExport = async () => {
    setLoading(true);
    setProgress(0);

    try {
      setProgress(20);
      
      const { data, error } = await supabase.functions.invoke('export-clinic-data', {
        body: exportOptions
      });

      setProgress(60);

      if (error) throw error;

      setProgress(80);

      // Criar blob e download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orthoplus-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setProgress(100);
      toast.success('Exportação concluída com sucesso!', {
        description: 'O arquivo foi baixado para seu computador.'
      });

      setStep(3); // Passo final
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setLoading(true);
    setProgress(0);

    try {
      setProgress(20);

      const { data, error } = await supabase.functions.invoke('import-clinic-data', {
        body: {
          data: importData,
          options: importOptions
        }
      });

      setProgress(80);

      if (error) throw error;

      setProgress(100);
      setImportResults(data);

      toast.success('Importação concluída!', {
        description: `${data.imported.modules + data.imported.patients + data.imported.prontuarios + data.imported.appointments} registros importados.`
      });

      setStep(4); // Passo final
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Erro ao importar dados', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setImportData(json);
        toast.success('Arquivo carregado com sucesso!');
        setStep(2); // Avançar para preview
      } catch (error) {
        toast.error('Erro ao ler arquivo', {
          description: 'Arquivo JSON inválido'
        });
      }
    };

    reader.readAsText(file);
  };

  const renderExportStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Selecione os dados para exportar</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <Checkbox 
              id="modules" 
              checked={exportOptions.includeModules}
              onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeModules: checked as boolean }))}
            />
            <Label htmlFor="modules" className="flex items-center gap-2 cursor-pointer flex-1">
              <SettingsIcon className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Configurações de Módulos</div>
                <div className="text-xs text-muted-foreground">Módulos ativos e suas configurações</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <Checkbox 
              id="patients" 
              checked={exportOptions.includePatients}
              onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includePatients: checked as boolean }))}
            />
            <Label htmlFor="patients" className="flex items-center gap-2 cursor-pointer flex-1">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Dados de Pacientes</div>
                <div className="text-xs text-muted-foreground">Informações cadastrais dos pacientes</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <Checkbox 
              id="prontuarios" 
              checked={exportOptions.includeProntuarios}
              onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeProntuarios: checked as boolean }))}
            />
            <Label htmlFor="prontuarios" className="flex items-center gap-2 cursor-pointer flex-1">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Prontuários Eletrônicos (PEP)</div>
                <div className="text-xs text-muted-foreground">Prontuários completos e odontogramas</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <Checkbox 
              id="history" 
              checked={exportOptions.includeHistory}
              onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeHistory: checked as boolean }))}
            />
            <Label htmlFor="history" className="flex items-center gap-2 cursor-pointer flex-1">
              <Database className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Histórico Clínico</div>
                <div className="text-xs text-muted-foreground">Evolução e anamnese dos pacientes</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <Checkbox 
              id="appointments" 
              checked={exportOptions.includeAppointments}
              onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeAppointments: checked as boolean }))}
            />
            <Label htmlFor="appointments" className="flex items-center gap-2 cursor-pointer flex-1">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Agendamentos</div>
                <div className="text-xs text-muted-foreground">Consultas agendadas e histórico</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <Checkbox 
              id="financeiro" 
              checked={exportOptions.includeFinanceiro}
              onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeFinanceiro: checked as boolean }))}
            />
            <Label htmlFor="financeiro" className="flex items-center gap-2 cursor-pointer flex-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Dados Financeiros</div>
                <div className="text-xs text-muted-foreground">Contas a receber e pagar</div>
              </div>
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="font-medium">Formato de Exportação</h4>
        <RadioGroup 
          value={exportOptions.format} 
          onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json" className="cursor-pointer">JSON Completo (Recomendado)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderExportStep2 = () => (
    <div className="space-y-6">
      <Alert>
        <FileJson className="h-4 w-4" />
        <AlertDescription>
          Confirme os dados selecionados para exportação. O processo pode levar alguns minutos dependendo do volume de dados.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <h4 className="font-semibold">Dados Selecionados:</h4>
        <div className="space-y-1">
          {exportOptions.includeModules && <Badge variant="secondary">Módulos</Badge>}
          {exportOptions.includePatients && <Badge variant="secondary">Pacientes</Badge>}
          {exportOptions.includeProntuarios && <Badge variant="secondary">Prontuários</Badge>}
          {exportOptions.includeHistory && <Badge variant="secondary">Histórico Clínico</Badge>}
          {exportOptions.includeAppointments && <Badge variant="secondary">Agendamentos</Badge>}
          {exportOptions.includeFinanceiro && <Badge variant="secondary">Financeiro</Badge>}
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">Exportando dados... {progress}%</p>
        </div>
      )}
    </div>
  );

  const renderImportStep1 = () => (
    <div className="space-y-6">
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Selecione um arquivo de exportação do Ortho+ (formato JSON) para importar os dados.
        </AlertDescription>
      </Alert>

      <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h4 className="font-medium mb-2">Selecione o arquivo de importação</h4>
          <p className="text-sm text-muted-foreground mb-4">Apenas arquivos .json gerados pelo Ortho+</p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="import-file"
          />
          <Label htmlFor="import-file">
            <Button variant="outline" asChild>
              <span>Selecionar Arquivo</span>
            </Button>
          </Label>
        </div>
        {importFile && (
          <div className="text-sm text-muted-foreground">
            Arquivo selecionado: <strong>{importFile.name}</strong>
          </div>
        )}
      </div>
    </div>
  );

  const renderImportStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Preview dos Dados</h3>
      
      {importData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Versão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{importData.version}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Data de Exportação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{new Date(importData.exportedAt).toLocaleString('pt-BR')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conteúdo do Arquivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {importData.data.modules && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Módulos</span>
                  <Badge>{importData.data.modules.length} registros</Badge>
                </div>
              )}
              {importData.data.patients && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pacientes</span>
                  <Badge>{importData.data.patientCount} registros</Badge>
                </div>
              )}
              {importData.data.prontuarios && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prontuários</span>
                  <Badge>{importData.data.prontuarios.length} registros</Badge>
                </div>
              )}
              {importData.data.appointments && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agendamentos</span>
                  <Badge>{importData.data.appointments.length} registros</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderImportStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Opções de Importação</h3>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Configure como os dados serão importados caso existam conflitos.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-lg border">
          <Checkbox 
            id="skip" 
            checked={importOptions.skipConflicts}
            onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, skipConflicts: checked as boolean }))}
          />
          <Label htmlFor="skip" className="cursor-pointer flex-1">
            <div className="font-medium">Ignorar Conflitos</div>
            <div className="text-xs text-muted-foreground">Pular registros que já existem</div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border">
          <Checkbox 
            id="overwrite" 
            checked={importOptions.overwriteExisting}
            onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, overwriteExisting: checked as boolean }))}
          />
          <Label htmlFor="overwrite" className="cursor-pointer flex-1">
            <div className="font-medium">Sobrescrever Existentes</div>
            <div className="text-xs text-muted-foreground">Atualizar registros duplicados</div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border">
          <Checkbox 
            id="merge" 
            checked={importOptions.mergeData}
            onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, mergeData: checked as boolean }))}
          />
          <Label htmlFor="merge" className="cursor-pointer flex-1">
            <div className="font-medium">Mesclar Dados</div>
            <div className="text-xs text-muted-foreground">Combinar dados novos com existentes</div>
          </Label>
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">Importando dados... {progress}%</p>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (mode === 'export') {
      return (
        <div className="space-y-6 text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Exportação Concluída!</h3>
            <p className="text-muted-foreground">
              Os dados foram exportados com sucesso. O arquivo foi baixado para seu computador.
            </p>
          </div>
        </div>
      );
    }

    if (importResults) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Importação Concluída!</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resumo da Importação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Módulos importados:</span>
                <Badge variant="success">{importResults.imported.modules}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pacientes importados:</span>
                <Badge variant="success">{importResults.imported.patients}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Prontuários importados:</span>
                <Badge variant="success">{importResults.imported.prontuarios}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Agendamentos importados:</span>
                <Badge variant="success">{importResults.imported.appointments}</Badge>
              </div>
              
              {importResults.skipped.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm">Registros ignorados:</span>
                    <Badge variant="secondary">{importResults.skipped.length}</Badge>
                  </div>
                </>
              )}

              {importResults.errors.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-destructive">Erros:</span>
                    <Badge variant="destructive">{importResults.errors.length}</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'export' ? <Download className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            {mode === 'export' ? 'Exportar Dados' : 'Importar Dados'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'export' 
              ? 'Exporte dados da clínica para backup ou migração'
              : 'Importe dados de outro sistema Ortho+ ou arquivo de backup'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i + 1 === step ? 'bg-primary text-primary-foreground' :
                  i + 1 < step ? 'bg-success text-success-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-12 h-1 mx-2 ${i + 1 < step ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {mode === 'export' && step === 1 && renderExportStep1()}
          {mode === 'export' && step === 2 && renderExportStep2()}
          {mode === 'export' && step === 3 && renderResults()}
          
          {mode === 'import' && step === 1 && renderImportStep1()}
          {mode === 'import' && step === 2 && renderImportStep2()}
          {mode === 'import' && step === 3 && renderImportStep3()}
          {mode === 'import' && step === 4 && renderResults()}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => step === 1 ? onClose() : setStep(step - 1)}
              disabled={loading || (mode === 'export' && step === 3) || (mode === 'import' && step === 4)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </Button>

            {mode === 'export' && step === 1 && (
              <Button onClick={() => setStep(2)}>
                Avançar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {mode === 'export' && step === 2 && (
              <Button onClick={handleExport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Agora
                  </>
                )}
              </Button>
            )}

            {mode === 'export' && step === 3 && (
              <Button onClick={onClose}>Concluir</Button>
            )}

            {mode === 'import' && step === 2 && (
              <Button onClick={() => setStep(3)} disabled={!importData}>
                Avançar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {mode === 'import' && step === 3 && (
              <Button onClick={handleImport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Agora
                  </>
                )}
              </Button>
            )}

            {mode === 'import' && step === 4 && (
              <Button onClick={onClose}>Concluir</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
