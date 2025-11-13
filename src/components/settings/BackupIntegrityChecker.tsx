import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

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
  backupId: string;
  onClose?: () => void;
}

export function BackupIntegrityChecker({ backupId, onClose }: BackupIntegrityCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntegrityResult | null>(null);

  const checkIntegrity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-backup-integrity', {
        body: { backupId }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.isValid) {
        toast.success('Backup íntegro!', {
          description: 'Nenhuma corrupção detectada'
        });
      } else {
        toast.error('Backup corrompido!', {
          description: 'Foram detectadas inconsistências nos checksums'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao validar backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Validação de Integridade</h3>
        </div>
        
        <Button 
          onClick={checkIntegrity}
          disabled={loading}
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar Integridade'
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          <Alert variant={result.isValid ? "default" : "destructive"}>
            {result.isValid ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Backup Íntegro</strong>
                  <p className="text-sm mt-1">
                    Todos os checksums foram validados com sucesso. O backup não apresenta sinais de corrupção.
                  </p>
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Backup Corrompido</strong>
                  <p className="text-sm mt-1">
                    Os checksums não correspondem. Este backup pode estar corrompido e não é recomendado para restauração.
                  </p>
                </AlertDescription>
              </>
            )}
          </Alert>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backup ID:</span>
              <Badge variant="outline">{result.backupId.substring(0, 8)}</Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data de Criação:</span>
              <span>{new Date(result.createdAt).toLocaleString('pt-BR')}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tamanho:</span>
              <span>{(result.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            <div className="pt-3 border-t">
              <div className="font-medium mb-2">Checksums MD5:</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Original:</span>
                  <code className={result.originalMD5 === result.currentMD5 ? 'text-green-600' : 'text-red-600'}>
                    {result.originalMD5}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Atual:</span>
                  <code className={result.originalMD5 === result.currentMD5 ? 'text-green-600' : 'text-red-600'}>
                    {result.currentMD5}
                  </code>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="font-medium mb-2">Checksums SHA-256:</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Original:</span>
                  <code className={result.originalSHA256 === result.currentSHA256 ? 'text-green-600' : 'text-red-600'}>
                    {result.originalSHA256.substring(0, 32)}...
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Atual:</span>
                  <code className={result.originalSHA256 === result.currentSHA256 ? 'text-green-600' : 'text-red-600'}>
                    {result.currentSHA256.substring(0, 32)}...
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}