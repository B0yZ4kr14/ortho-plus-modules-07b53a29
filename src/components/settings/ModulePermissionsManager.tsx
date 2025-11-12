import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

interface Module {
  id: number;
  module_key: string;
  name: string;
  category: string;
  is_active: boolean;
}

interface UserPermission {
  user_id: string;
  module_catalog_id: number;
  can_view: boolean;
}

export function ModulePermissionsManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar usuários MEMBER
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles = profilesData?.map(profile => {
        const role = rolesData?.find((r: any) => r.user_id === profile.id)?.role || 'MEMBER';
        return {
          id: profile.id,
          full_name: profile.full_name || 'Sem nome',
          email: `${profile.full_name}@ortho.com`.toLowerCase().replace(/\s+/g, '.'),
          role: role as 'ADMIN' | 'MEMBER'
        };
      }).filter(user => user.role === 'MEMBER') || [];

      setUsers(usersWithRoles);

      // Buscar módulos ativos
      const { data: modulesData, error: modulesError } = await supabase.functions.invoke('get-my-modules');
      if (modulesError) throw modulesError;

      const activeModules = modulesData?.modules?.filter((m: Module) => m.is_active) || [];
      setModules(activeModules);

      // Buscar permissões existentes
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_module_permissions')
        .select('user_id, module_catalog_id, can_view');

      if (permissionsError) throw permissionsError;

      setPermissions(permissionsData || []);

      if (usersWithRoles.length > 0 && !selectedUser) {
        setSelectedUser(usersWithRoles[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de permissões');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (userId: string, moduleId: number) => {
    return permissions.some(
      p => p.user_id === userId && p.module_catalog_id === moduleId && p.can_view
    );
  };

  const togglePermission = async (userId: string, moduleId: number) => {
    const currentPermission = hasPermission(userId, moduleId);

    try {
      // Buscar informações para auditoria
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user?.id)
        .single();

      if (currentPermission) {
        // Remover permissão
        const { error } = await supabase
          .from('user_module_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('module_catalog_id', moduleId);

        if (error) throw error;

        setPermissions(permissions.filter(
          p => !(p.user_id === userId && p.module_catalog_id === moduleId)
        ));

        // Registrar auditoria
        await supabase
          .from('permission_audit_logs')
          .insert({
            clinic_id: profileData?.clinic_id,
            user_id: user?.id,
            target_user_id: userId,
            action: 'PERMISSION_REVOKED',
            module_catalog_id: moduleId
          });
      } else {
        // Adicionar permissão
        const { error } = await supabase
          .from('user_module_permissions')
          .insert({
            user_id: userId,
            module_catalog_id: moduleId,
            can_view: true,
            can_edit: false,
            can_delete: false
          });

        if (error) throw error;

        setPermissions([...permissions, { user_id: userId, module_catalog_id: moduleId, can_view: true }]);

        // Registrar auditoria
        await supabase
          .from('permission_audit_logs')
          .insert({
            clinic_id: profileData?.clinic_id,
            user_id: user?.id,
            target_user_id: userId,
            action: 'PERMISSION_GRANTED',
            module_catalog_id: moduleId
          });
      }

      toast.success('Permissão atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const grantAllPermissions = async (userId: string) => {
    try {
      setSaving(true);

      // Remover todas as permissões existentes do usuário
      await supabase
        .from('user_module_permissions')
        .delete()
        .eq('user_id', userId);

      // Adicionar permissões para todos os módulos ativos
      const newPermissions = modules.map(module => ({
        user_id: userId,
        module_catalog_id: module.id,
        can_view: true,
        can_edit: false,
        can_delete: false
      }));

      const { error } = await supabase
        .from('user_module_permissions')
        .insert(newPermissions);

      if (error) throw error;

      await fetchData();
      toast.success('Todas as permissões concedidas com sucesso!');
    } catch (error) {
      console.error('Erro ao conceder permissões:', error);
      toast.error('Erro ao conceder permissões');
    } finally {
      setSaving(false);
    }
  };

  const revokeAllPermissions = async (userId: string) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_module_permissions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      await fetchData();
      toast.success('Todas as permissões revogadas com sucesso!');
    } catch (error) {
      console.error('Erro ao revogar permissões:', error);
      toast.error('Erro ao revogar permissões');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando permissões...</span>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhum usuário MEMBER encontrado</h3>
        <p className="text-sm text-muted-foreground">
          Cadastre usuários com role MEMBER para gerenciar suas permissões de acesso aos módulos.
        </p>
      </Card>
    );
  }

  const selectedUserData = users.find(u => u.id === selectedUser);

  // Agrupar módulos por categoria
  const groupedModules = modules.reduce((acc, module) => {
    const category = module.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Permissões de Acesso por Módulo</h3>
          <p className="text-sm text-muted-foreground">
            Defina quais módulos cada usuário MEMBER pode acessar
          </p>
        </div>
      </div>

      {/* Seleção de usuário */}
      <div className="flex gap-2 flex-wrap">
        {users.map(user => (
          <Button
            key={user.id}
            variant={selectedUser === user.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedUser(user.id)}
          >
            {user.full_name}
          </Button>
        ))}
      </div>

      {/* Permissões do usuário selecionado */}
      {selectedUser && selectedUserData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-semibold text-lg">{selectedUserData.full_name}</h4>
              <p className="text-sm text-muted-foreground">{selectedUserData.email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => grantAllPermissions(selectedUser)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Conceder Tudo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => revokeAllPermissions(selectedUser)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Revogar Tudo
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-semibold text-foreground">{category}</h5>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                <div className="grid gap-2">
                  {categoryModules.map(module => (
                    <div
                      key={module.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={hasPermission(selectedUser, module.id)}
                        onCheckedChange={() => togglePermission(selectedUser, module.id)}
                        id={`module-${module.id}`}
                      />
                      <label
                        htmlFor={`module-${module.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium"
                      >
                        {module.name}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {module.module_key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
