import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilter } from '@/components/shared/TableFilter';
import { Shield, Calendar as CalendarIcon, User, Filter, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface AuditLog {
  id: number;
  created_at: string;
  user_id: string;
  clinic_id: string;
  action: string;
  details: any;
  target_module_id: number | null;
}

interface User {
  id: string;
  full_name: string | null;
}

export default function AuditLogs() {
  const { hasRole, clinicId } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  useEffect(() => {
    if (hasRole('ADMIN')) {
      loadUsers();
      loadLogs();
    }
  }, [hasRole, clinicId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('clinic_id', clinicId);

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Aplicar filtros
      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      if (selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedUser('all');
    setSelectedAction('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    loadLogs();
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Usuário', 'Ação', 'Detalhes'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        users.find(u => u.id === log.user_id)?.full_name || log.user_id,
        log.action,
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Logs exportados com sucesso!');
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('DEACTIVATE')) return 'destructive';
    if (action.includes('CREATE') || action.includes('ACTIVATE')) return 'default';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'secondary';
    return 'outline';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'MODULE_ACTIVATED': 'Módulo Ativado',
      'MODULE_DEACTIVATED': 'Módulo Desativado',
      'USER_CREATED': 'Usuário Criado',
      'USER_UPDATED': 'Usuário Atualizado',
      'USER_DELETED': 'Usuário Removido',
      'BACKUP_MANUAL': 'Backup Manual',
      'BACKUP_CLEANUP': 'Limpeza de Backups',
      'BI_EXPORT_SCHEDULED': 'Exportação BI Agendada',
      'ODONTOGRAMA_UPDATED': 'Odontograma Atualizado',
    };
    return labels[action] || action;
  };

  if (!hasRole('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Auditoria e Logs"
        icon={Shield}
        description="Histórico completo de acessos, alterações e ações no sistema"
      />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          <CardDescription>
            Refine sua pesquisa usando os filtros abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar nos detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Usuários</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Tipo de Ação</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  <SelectItem value="MODULE_ACTIVATED">Módulo Ativado</SelectItem>
                  <SelectItem value="MODULE_DEACTIVATED">Módulo Desativado</SelectItem>
                  <SelectItem value="USER_CREATED">Usuário Criado</SelectItem>
                  <SelectItem value="USER_UPDATED">Usuário Atualizado</SelectItem>
                  <SelectItem value="USER_DELETED">Usuário Removido</SelectItem>
                  <SelectItem value="BACKUP_MANUAL">Backup Manual</SelectItem>
                  <SelectItem value="BI_EXPORT_SCHEDULED">Exportação BI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'dd/MM', { locale: ptBR }) : 'De'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'dd/MM', { locale: ptBR }) : 'Até'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Aplicar Filtros
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Limpar
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            {logs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const user = users.find(u => u.id === log.user_id);
                return (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getActionColor(log.action)}>
                                {getActionLabel(log.action)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                por {user?.full_name || 'Usuário desconhecido'}
                              </span>
                            </div>
                            <p className="text-sm">
                              {format(new Date(log.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                            {log.details && (
                              <div className="mt-2 p-3 bg-muted rounded-md">
                                <pre className="text-xs overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
