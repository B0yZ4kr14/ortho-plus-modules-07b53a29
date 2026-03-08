import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { Shield, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface IntegrityResult {
  backupId: string;
  isValid: boolean;
  originalMD5: string;
  currentMD5: string;
  originalSHA256: string;
  currentSHA256: string;
  createdAt: string;
  fileSize: number;
}

interface BackupIntegrityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackupIntegrityChecker({
  isOpen,
  onClose,
}: BackupIntegrityCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string>("");
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [backups, setBackups] = useState<any[]>([]);

  const loadBackups = async () => {
    try {
      const data = await apiClient.get<any[]>(
        "/configuracoes/backups/historico",
        { params: { status: "success", limit: 20 } },
      );
      if (data) setBackups(data);
    } catch (e) {
      console.error("Failed to load backups", e);
    }
  };

  const checkIntegrity = async () => {
    if (!selectedBackupId) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await apiClient.post<IntegrityResult>(
        "/functions/v1/validate-backup-integrity",
        {
          backupId: selectedBackupId,
        },
      );

      setResult(data);

      if (data.isValid) {
        toast.success("Backup íntegro!", {
          description: "Nenhuma corrupção detectada",
        });
      } else {
        toast.error("Backup corrompido!", {
          description: "Foram detectadas inconsistências nos checksums",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao validar backup");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-6 space-y-6" depth="normal">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Validação de Integridade</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecione um Backup para Validar
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedBackupId}
              onChange={(e) => setSelectedBackupId(e.target.value)}
              onFocus={loadBackups}
            >
              <option value="">Selecione...</option>
              {backups.map((b) => (
                <option key={b.id} value={b.id}>
                  {new Date(b.created_at).toLocaleString()} - {b.backup_type}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={checkIntegrity}
            disabled={loading || !selectedBackupId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Validar Integridade
              </>
            )}
          </Button>

          {result && (
            <Alert
              variant={result.isValid ? "default" : "destructive"}
              className="mt-4"
            >
              <div className="flex items-start gap-3">
                {result.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div className="flex-1 space-y-3">
                  <AlertDescription className="font-semibold">
                    {result.isValid
                      ? "✓ Backup íntegro"
                      : "⚠ Backup corrompido"}
                  </AlertDescription>

                  <div className="grid gap-2 text-sm font-mono bg-muted p-3 rounded">
                    <div className="flex justify-between">
                      <span>MD5:</span>
                      <Badge
                        variant={result.isValid ? "success" : "destructive"}
                      >
                        {result.isValid ? "Match" : "Mismatch"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>SHA256:</span>
                      <Badge
                        variant={result.isValid ? "success" : "destructive"}
                      >
                        {result.isValid ? "Match" : "Mismatch"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho:</span>
                      <span>{(result.fileSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span>
                        {new Date(result.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {!result.isValid && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <strong>Atenção:</strong> Este backup pode estar
                        corrompido ou foi modificado. Recomenda-se não
                        utilizá-lo para restauração.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
