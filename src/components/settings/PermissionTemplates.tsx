import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  UserPlus,
  DollarSign,
  Briefcase,
  HeartPulse,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  module_keys: string[];
}

interface User {
  id: string;
  full_name: string;
}

const templateIcons: Record<string, any> = {
  Stethoscope: Stethoscope,
  UserPlus: UserPlus,
  DollarSign: DollarSign,
  Briefcase: Briefcase,
  HeartPulse: HeartPulse,
};

export function PermissionTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [applying, setApplying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar templates
      const templatesData = await apiClient.get<any[]>(
        "/configuracoes/permissoes/templates",
      );
      setTemplates(templatesData || []);

      // Buscar usuários MEMBER
      const profilesData = await apiClient.get<any[]>(
        "/configuracoes/usuarios",
      );

      // Buscar roles
      // Backend retorna roles nos profiles
      const rolesData = profilesData;

      // Filtrar apenas MEMBERs
      const memberUsers =
        profilesData?.filter((profile: any) => {
          return (profile.role || "MEMBER") === "MEMBER";
        }) || [];

      setUsers(memberUsers);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!selectedUser) {
      toast.error("Selecione um usuário primeiro");
      return;
    }

    try {
      setApplying(templateId);

      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      // Buscar IDs dos módulos
      const modulesData = await apiClient.get<any[]>(
        "/configuracoes/modulos",
        { params: { module_keys: template.module_keys.join(",") } },
      );

      // Remover permissões existentes
      await apiClient.delete(
        `/configuracoes/permissoes/${selectedUser}`,
      );

      // Adicionar novas permissões
      const permissions =
        modulesData?.map((module) => ({
          user_id: selectedUser,
          module_catalog_id: module.id,
          can_view: true,
          can_edit: false,
          can_delete: false,
        })) || [];

      await apiClient.post("/configuracoes/permissoes/batch", permissions);

      // Registrar auditoria
      const authUser = await apiClient.get<any>("/auth/me");
      const user = authUser?.user;

      const profileDataArray = await apiClient.get<any[]>(
        `/configuracoes/usuarios/${user?.id}`,
      );
      const profileData = profileDataArray?.[0];

      await apiClient.post("/configuracoes/permissoes/audit", {
        clinic_id: profileData?.clinic_id,
        user_id: user?.id,
        target_user_id: selectedUser,
        action: "TEMPLATE_APPLIED",
        template_name: template.name,
        details: {
          module_keys: template.module_keys,
          permissions_count: permissions.length,
        },
      });

      toast.success(`Template "${template.name}" aplicado com sucesso!`);
      setSelectedUser("");
    } catch (error) {
      console.error("Erro ao aplicar template:", error);
      toast.error("Erro ao aplicar template");
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Templates de Permissões</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Aplique rapidamente conjuntos pré-definidos de permissões aos usuários
        </p>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">
            Selecionar Usuário
          </label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um usuário MEMBER" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const Icon = templateIcons[template.icon] || Briefcase;
          const isApplying = applying === template.id;

          return (
            <Card
              key={template.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {template.module_keys.length} módulos incluídos:
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.module_keys.slice(0, 3).map((key) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                  {template.module_keys.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.module_keys.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                disabled={!selectedUser || isApplying}
                onClick={() => applyTemplate(template.id)}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Aplicar Template
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
