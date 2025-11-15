import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: number;
  timestamp: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  sensitivity_level: string;
}

export default function AuditTrailViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-trail', actionFilter, sensitivityFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_trail')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (sensitivityFilter !== 'all') {
        query = query.eq('sensitivity_level', sensitivityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const filteredLogs = logs.filter(log =>
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSensitivityBadge = (level: string) => {
    const variants: Record<string, any> = {
      CRITICAL: { variant: 'destructive', icon: AlertCircle },
      HIGH: { variant: 'default', icon: Shield },
      MEDIUM: { variant: 'secondary', icon: FileText },
      LOW: { variant: 'outline', icon: FileText },
    };

    const config = variants[level] || variants.LOW;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {level}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      INSERT: 'bg-green-500/10 text-green-700 dark:text-green-400',
      UPDATE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400',
      SELECT: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
      EXPORT: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    };

    return (
      <Badge className={colors[action] || ''}>
        {action}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Audit Trail - Rastreabilidade LGPD
        </h1>
        <p className="text-muted-foreground mt-2">
          Registro completo de todas as operações em dados sensíveis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine a busca de logs de auditoria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por entidade ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="SELECT">SELECT</SelectItem>
                <SelectItem value="EXPORT">EXPORT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nível de sensibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum log encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Sensibilidade</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.entity_type}</span>
                          {log.entity_id && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {log.entity_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getSensitivityBadge(log.sensitivity_level)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-mono">
                            {log.user_id ? log.user_id.substring(0, 8) : 'SYSTEM'}...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
