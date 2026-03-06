import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Building,
  Stethoscope,
  Activity,
  Zap,
  Baby,
  Rocket,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  specialty: string;
  description: string;
  icon: string;
  modules: string[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building,
  Stethoscope,
  Activity,
  Zap,
  Baby,
  Sparkles,
  Rocket,
};

export function ModuleTemplateSelector({ onApply }: { onApply?: () => void }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get<any[]>(
        "/module_configuration_templates?is_active=eq.true&order=name",
      );

      // Cast modules from Json to string[]
      const processedTemplates = (data || []).map((template) => ({
        ...template,
        modules: Array.isArray(template.modules)
          ? (template.modules as string[])
          : [],
      }));

      setTemplates(processedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (
    templateId: string,
    templateName: string,
  ) => {
    setApplying(templateId);
    try {
      const data = await apiClient.post<any>(
        "/functions/v1/apply-module-template",
        {
          template_id: templateId,
        },
      );

      toast({
        title: "Template aplicado!",
        description: `${data.activated} módulos ativados com sucesso.`,
      });

      setDialogOpen(false);
      onApply?.();
    } catch (error: any) {
      console.error("Error applying template:", error);
      toast({
        title: "Erro ao aplicar template",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Templates por Especialidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Templates de Configuração por Especialidade
          </DialogTitle>
          <DialogDescription>
            Escolha um template pré-configurado baseado na especialidade da sua
            clínica. Todos os módulos necessários serão ativados
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => {
            const Icon = iconMap[template.icon] || Stethoscope;
            const isApplying = applying === template.id;

            return (
              <Card
                key={template.id}
                variant="elevated"
                className={cn(
                  "transition-all hover:shadow-xl hover:-translate-y-1",
                  isApplying && "opacity-60",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>{template.modules.length} módulos inclusos</span>
                  </div>

                  <Button
                    onClick={() =>
                      handleApplyTemplate(template.id, template.name)
                    }
                    disabled={isApplying}
                    className="w-full gap-2"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Aplicar Template
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
