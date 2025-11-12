import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Check, X, FileText, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  template_name: string | null;
  details: any;
  user: {
    full_name: string;
  };
  target_user: {
    full_name: string;
  };
  module?: {
    name: string;
  };
}

const actionLabels: Record<string, { label: string; variant: 'success' | 'destructive' | 'default' }> = {
  'PERMISSION_GRANTED': { label: 'Permissão Concedida', variant: 'success' },
  'PERMISSION_REVOKED': { label: 'Permissão Revogada', variant: 'destructive' },
  'TEMPLATE_APPLIED': { label: 'Template Aplicado', variant: 'default' },
};

export function PermissionAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [users, setUsers] = useState<Array<{ id: string; full_name: string }>>([]);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (!profileData) return;

      const { data, error } = await supabase
        .from('permission_audit_logs')
        .select(`
          id,
          created_at,
          action,
          template_name,
          details,
          module_catalog_id,
          user:user_id (
            full_name:profiles(full_name)
          ),
          target_user:target_user_id (
            full_name:profiles(full_name)
          )
        `)
        .eq('clinic_id', profileData.clinic_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Buscar informações dos módulos
      const moduleIds = data?.map(log => log.module_catalog_id).filter(Boolean) || [];
      let modulesMap: Record<number, any> = {};

      if (moduleIds.length > 0) {
        const { data: modulesData } = await supabase
          .from('module_catalog')
          .select('id, name')
          .in('id', moduleIds);

        if (modulesData) {
          modulesMap = Object.fromEntries(
            modulesData.map(m => [m.id, m])
          );
        }
      }

      const processedLogs = data?.map(log => ({
        ...log,
        user: { full_name: (log.user as any)?.full_name?.[0]?.full_name || 'Desconhecido' },
        target_user: { full_name: (log.target_user as any)?.full_name?.[0]?.full_name || 'Desconhecido' },
        module: log.module_catalog_id ? modulesMap[log.module_catalog_id] : undefined
      })) || [];

      setLogs(processedLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterUser !== 'all' && log.target_user.full_name !== filterUser) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Auditoria de Permissões</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Histórico completo de todas as alterações de permissões de acesso
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {Array.from(new Set(logs.map(l => l.target_user.full_name))).map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="PERMISSION_GRANTED">Permissão Concedida</SelectItem>
              <SelectItem value="PERMISSION_REVOKED">Permissão Revogada</SelectItem>
              <SelectItem value="TEMPLATE_APPLIED">Template Aplicado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <ScrollArea className="h-[500px]">
          <div className="p-6 space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro de auditoria encontrado</p>
              </div>
            ) : (
              filteredLogs.map(log => {
                const actionConfig = actionLabels[log.action] || { label: log.action, variant: 'default' as const };
                
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      {log.action === 'PERMISSION_GRANTED' ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : log.action === 'PERMISSION_REVOKED' ? (
                        <X className="h-5 w-5 text-destructive" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={actionConfig.variant} className="text-xs">
                          {actionConfig.label}
                        </Badge>
                        {log.template_name && (
                          <Badge variant="outline" className="text-xs">
                            {log.template_name}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium mb-1">
                        <span className="text-primary">{log.user.full_name}</span>
                        {' alterou permissões de '}
                        <span className="text-primary">{log.target_user.full_name}</span>
                      </p>

                      {log.module && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Módulo: {log.module.name}
                        </p>
                      )}

                      {log.details?.module_keys && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {log.details.permissions_count} permissões aplicadas
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
