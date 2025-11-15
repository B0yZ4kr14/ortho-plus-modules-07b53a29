import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

export function BackupLogsTab() {
  const logs = [
    {
      id: '1',
      timestamp: '15/11/2025 18:30:45',
      level: 'success',
      message: 'Backup completo finalizado com sucesso',
      details: 'Arquivo: backup_20251115_183045.tar.gz (2.3 GB)',
    },
    {
      id: '2',
      timestamp: '15/11/2025 18:30:12',
      level: 'info',
      message: 'Iniciando backup completo',
      details: 'Tipo: Full | Compressão: Ativada | Criptografia: Ativada',
    },
    {
      id: '3',
      timestamp: '15/11/2025 12:00:23',
      level: 'success',
      message: 'Backup incremental concluído',
      details: 'Arquivo: backup_20251115_120023.tar.gz (156 MB)',
    },
    {
      id: '4',
      timestamp: '14/11/2025 12:00:15',
      level: 'error',
      message: 'Falha no backup incremental',
      details: 'Erro: Timeout na conexão com o banco de dados',
    },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      info: 'secondary' as const,
    };
    return (
      <Badge variant={variants[level as keyof typeof variants] || 'secondary'}>
        {level}
      </Badge>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-3 py-3 px-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">{getLevelIcon(log.level)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{log.message}</p>
                  {getLevelBadge(log.level)}
                </div>
                <p className="text-sm text-muted-foreground">{log.details}</p>
                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
