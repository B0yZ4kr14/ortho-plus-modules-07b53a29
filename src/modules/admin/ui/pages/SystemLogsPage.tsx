import { useState, useEffect } from 'react';
import { ScrollText, Filter, Download, RefreshCw, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  source: string;
  message: string;
  details?: any;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simular logs do sistema
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info',
        source: 'API',
        message: 'User login successful',
        details: { user_id: 'abc123', ip: '192.168.1.1' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000),
        level: 'info',
        source: 'Database',
        message: 'Backup completed successfully',
        details: { size: '2.3GB', duration: '45s' }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 120000),
        level: 'warning',
        source: 'Cache',
        message: 'Cache miss rate above threshold',
        details: { rate: '15%', threshold: '10%' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 180000),
        level: 'error',
        source: 'API',
        message: 'Failed to connect to external service',
        details: { service: 'payment-gateway', retries: 3 }
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 240000),
        level: 'info',
        source: 'Scheduler',
        message: 'Cron job executed',
        details: { job: 'cleanup-old-sessions', status: 'success' }
      }
    ];

    setLogs(mockLogs);
  }, []);

  const getLevelBadge = (level: LogEntry['level']) => {
    const config = {
      info: { variant: 'default' as const, icon: Info, color: 'text-blue-500' },
      warning: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-500' },
      error: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-500' }
    };

    const { variant, icon: Icon, color } = config[level];

    return (
      <Badge variant={variant} className="capitalize">
        <Icon className={`h-3 w-3 mr-1 ${color}`} />
        {level}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `system-logs-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="System Logs"
        description="Logs de sistema, erros e eventos em tempo real"
        icon={ScrollText}
      />

      {/* Filters and Actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {logs.filter(l => l.level === 'info').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {logs.filter(l => l.level === 'warning').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {logs.filter(l => l.level === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>Logs em tempo real do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors font-mono text-sm"
                >
                  <div className="text-muted-foreground whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="min-w-[100px]">
                    {getLevelBadge(log.level)}
                  </div>
                  <Badge variant="outline" className="min-w-[100px]">
                    {log.source}
                  </Badge>
                  <div className="flex-1">
                    <p>{log.message}</p>
                    {log.details && (
                      <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
