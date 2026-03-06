import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface BackupTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupId: string;
  backupName?: string;
}

interface TestResult {
  success: boolean;
  backupId: string;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  errors: string[];
  duration: number;
  timestamp: string;
}

export function BackupTestDialog({
  open,
  onOpenChange,
  backupId,
  backupName,
}: BackupTestDialogProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    setTesting(true);
    setProgress(0);
    setTestResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 500);

      const data = await apiClient.post<TestResult>(
        "/functions/v1/test-backup-restore",
        {
          backupId,
          testEnvironment: "sandbox",
        },
      );

      clearInterval(progressInterval);
      setProgress(100);

      setTestResult(data);

      if (data.success) {
        toast.success("Teste de restauração concluído com sucesso!");
      } else {
        toast.error(`Teste falhou: ${data.testsFailed} erro(s) encontrado(s)`);
      }
    } catch (error: any) {
      console.error("Error running backup test:", error);
      toast.error("Erro ao executar teste de restauração");
      setTestResult({
        success: false,
        backupId,
        testsRun: 1,
        testsPassed: 0,
        testsFailed: 1,
        errors: [error.message || "Erro desconhecido"],
        duration: 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (testing)
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (!testResult) return <Info className="h-5 w-5 text-muted-foreground" />;
    if (testResult.success)
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (!testResult) return "border-border";
    return testResult.success ? "border-green-500/50" : "border-red-500/50";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Teste de Restauração de Backup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este teste valida a integridade e restaurabilidade do backup sem
              aplicar mudanças reais. Ideal para garantir que seus backups estão
              funcionando corretamente.
            </AlertDescription>
          </Alert>

          {backupName && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Backup selecionado:</p>
              <p className="text-sm text-muted-foreground">{backupName}</p>
            </div>
          )}

          {testing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Executando testes...
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {testResult && (
            <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Resultado do Teste</h3>
                  <Badge
                    variant={testResult.success ? "success" : "destructive"}
                  >
                    {testResult.success ? "Aprovado" : "Reprovado"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <p className="text-2xl font-bold">{testResult.testsRun}</p>
                    <p className="text-xs text-muted-foreground">
                      Testes Executados
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded">
                    <p className="text-2xl font-bold text-green-600">
                      {testResult.testsPassed}
                    </p>
                    <p className="text-xs text-muted-foreground">Aprovados</p>
                  </div>
                  <div className="text-center p-3 bg-red-500/10 rounded">
                    <p className="text-2xl font-bold text-red-600">
                      {testResult.testsFailed}
                    </p>
                    <p className="text-xs text-muted-foreground">Reprovados</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="text-sm text-muted-foreground text-center">
                  Duração: {(testResult.duration / 1000).toFixed(2)}s
                </div>

                {/* Errors */}
                {testResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Erros encontrados:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {testResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success message */}
                {testResult.success && (
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      ✓ Backup validado com sucesso! Todos os testes passaram e
                      o backup está pronto para ser restaurado caso necessário.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={runTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {testResult ? "Executar Novamente" : "Iniciar Teste"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
