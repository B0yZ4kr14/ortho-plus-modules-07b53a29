import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Edit, Trash2, Shield, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  full_name: string | null;
  role: 'ADMIN' | 'MEMBER';
  clinic_id: string;
  created_at: string;
}

interface ModulePermission {
  module_key: string;
  module_name: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const UserManagementTab = () => {
  const { clinicId, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modules, setModules] = useState<any[]>([]);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [userPermissions, setUserPermissions] = useState<ModulePermission[]>([]);

  useEffect(() => {
    if (hasRole('ADMIN')) {
      loadUsers();
      loadModules();
    }
  }, [hasRole, clinicId]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Buscar perfis da clínica
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinicId);

      if (profilesError) throw profilesError;

      // Buscar roles de cada usuário
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .maybeSingle();

          return {
            id: profile.id,
            full_name: profile.full_name,
            role: roleData?.role || 'MEMBER',
            clinic_id: profile.clinic_id,
            created_at: profile.created_at,
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('module_catalog')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setModules(data || []);

      // Inicializar permissões
      const initialPermissions: ModulePermission[] = (data || []).map((module: any) => ({
        module_key: module.module_key,
        module_name: module.name,
        can_view: false,
        can_edit: false,
        can_delete: false,
      }));
      setUserPermissions(initialPermissions);
    } catch (error: any) {
      console.error('Erro ao carregar módulos:', error);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName || !newUserPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      // Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Usuário não criado');
      }

      // Atualizar perfil com clinic_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ clinic_id: clinicId })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Adicionar role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: newUserRole,
        });

      if (roleError) throw roleError;

      toast.success('Usuário criado com sucesso');
      setIsAddDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Role atualizada com sucesso');
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast.error('Erro ao atualizar role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      // Remover roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Nota: A exclusão do perfil será automática devido ao trigger on delete cascade
      toast.success('Usuário removido com sucesso');
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const resetForm = () => {
    setNewUserEmail('');
    setNewUserName('');
    setNewUserPassword('');
    setNewUserRole('MEMBER');
    setUserPermissions([]);
  };

  const updatePermission = (moduleKey: string, field: 'can_view' | 'can_edit' | 'can_delete', value: boolean) => {
    setUserPermissions(prev =>
      prev.map(perm =>
        perm.module_key === moduleKey
          ? { ...perm, [field]: value }
          : perm
      )
    );
  };

  if (!hasRole('ADMIN')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Apenas administradores podem acessar esta área.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie funcionários, roles e permissões por módulo
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>
                Crie um novo usuário e configure suas permissões
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                <TabsTrigger value="permissions">Permissões</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="João Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="joao@clinica.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha Temporária</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Nível de Acesso</Label>
                  <Select value={newUserRole} onValueChange={(value: 'ADMIN' | 'MEMBER') => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Membro (Acesso Limitado)
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrador (Acesso Total)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Configure as permissões granulares por módulo (disponível apenas para MEMBER)
                </p>

                {newUserRole === 'ADMIN' ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      Administradores têm acesso total a todos os módulos automaticamente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userPermissions.map((perm) => (
                      <Card key={perm.module_key}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{perm.module_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${perm.module_key}-view`} className="text-sm">
                              Visualizar
                            </Label>
                            <Switch
                              id={`${perm.module_key}-view`}
                              checked={perm.can_view}
                              onCheckedChange={(checked) => updatePermission(perm.module_key, 'can_view', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${perm.module_key}-edit`} className="text-sm">
                              Editar
                            </Label>
                            <Switch
                              id={`${perm.module_key}-edit`}
                              checked={perm.can_edit}
                              onCheckedChange={(checked) => updatePermission(perm.module_key, 'can_edit', checked)}
                              disabled={!perm.can_view}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${perm.module_key}-delete`} className="text-sm">
                              Excluir
                            </Label>
                            <Switch
                              id={`${perm.module_key}-delete`}
                              checked={perm.can_delete}
                              onCheckedChange={(checked) => updatePermission(perm.module_key, 'can_delete', checked)}
                              disabled={!perm.can_view}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddUser} className="flex-1">
                Criar Usuário
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários da Clínica</CardTitle>
          <CardDescription>
            Total de {users.length} usuário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário cadastrado
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold">{user.full_name || 'Sem nome'}</h4>
                          <p className="text-sm text-muted-foreground">{user.id}</p>
                        </div>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role === 'ADMIN' ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <Settings className="h-3 w-3 mr-1" />
                              Membro
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value: 'ADMIN' | 'MEMBER') => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Membro</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
