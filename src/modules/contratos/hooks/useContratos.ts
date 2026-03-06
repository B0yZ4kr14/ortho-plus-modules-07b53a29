import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Contrato,
  ContratoComplete,
  ContratoTemplate,
} from "../types/contrato.types";

export function useContratos() {
  const { selectedClinic } = useAuth();
  const [contratos, setContratos] = useState<ContratoComplete[]>([]);
  const [templates, setTemplates] = useState<ContratoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar contratos
  const loadContratos = async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);
      const data: any = await apiClient.get("/contratos", {
        params: { clinic_id: selectedClinic.id, sort: "created_at.desc" },
      });
      setContratos(data as ContratoComplete[]);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      toast.error("Erro ao carregar contratos");
    } finally {
      setLoading(false);
    }
  };

  // Carregar templates
  const loadTemplates = async () => {
    if (!selectedClinic) return;

    try {
      const data: any = await apiClient.get("/contrato-templates", {
        params: {
          clinic_id: selectedClinic.id,
          ativo: "eq.true",
          sort: "nome.asc",
        },
      });
      setTemplates(data as ContratoTemplate[]);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar templates");
    }
  };

  // Criar contrato
  const createContrato = async (contrato: Partial<Contrato>) => {
    if (!selectedClinic) return null;

    try {
      const numero = `CTR-${Date.now()}`;

      const data: any = await apiClient.post("/contratos", {
        ...contrato,
        clinic_id: selectedClinic.id,
        numero_contrato: numero,
        // created_by should ideally be injected by backend from auth token
      });

      await loadContratos();
      toast.success("Contrato criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
      toast.error("Erro ao criar contrato");
      return null;
    }
  };

  // Criar contrato a partir de template
  const createFromTemplate = async (
    templateId: string,
    patientId: string,
    orcamentoId?: string,
  ) => {
    try {
      const template: any = await apiClient.get(
        `/contrato-templates/${templateId}`,
      );

      const conteudoProcessado = template.conteudo_html;

      return await createContrato({
        patient_id: patientId,
        template_id: templateId,
        orcamento_id: orcamentoId,
        titulo: template.nome,
        conteudo_html: conteudoProcessado,
        valor_contrato: 0,
        data_inicio: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Erro ao criar contrato do template:", error);
      toast.error("Erro ao criar contrato do template");
      return null;
    }
  };

  // Atualizar contrato
  const updateContrato = async (id: string, updates: Partial<Contrato>) => {
    try {
      await apiClient.put(`/contratos/${id}`, updates);
      await loadContratos();
      toast.success("Contrato atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato");
      return false;
    }
  };

  // Assinar contrato
  const signContrato = async (
    id: string,
    assinaturaPaciente: string,
    assinaturaDentista: string,
  ) => {
    try {
      await apiClient.put(`/contratos/${id}/sign`, {
        status: "ASSINADO",
        assinado_em: new Date().toISOString(),
        assinatura_paciente_base64: assinaturaPaciente,
        assinatura_dentista_base64: assinaturaDentista,
      });

      await loadContratos();
      toast.success("Contrato assinado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao assinar contrato:", error);
      toast.error("Erro ao assinar contrato");
      return false;
    }
  };

  // Cancelar contrato
  const cancelContrato = async (id: string, motivo: string) => {
    try {
      await apiClient.put(`/contratos/${id}/cancel`, {
        status: "CANCELADO",
        cancelado_em: new Date().toISOString(),
        motivo_cancelamento: motivo,
      });

      await loadContratos();
      toast.success("Contrato cancelado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao cancelar contrato:", error);
      toast.error("Erro ao cancelar contrato");
      return false;
    }
  };

  // Criar template
  const createTemplate = async (template: Partial<ContratoTemplate>) => {
    if (!selectedClinic) return null;

    try {
      const data: any = await apiClient.post("/contrato-templates", {
        ...template,
        clinic_id: selectedClinic.id,
      });

      await loadTemplates();
      toast.success("Template criado com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar template:", error);
      toast.error("Erro ao criar template");
      return null;
    }
  };

  // Atualizar template
  const updateTemplate = async (
    id: string,
    updates: Partial<ContratoTemplate>,
  ) => {
    try {
      await apiClient.put(`/contrato-templates/${id}`, updates);
      await loadTemplates();
      toast.success("Template atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      toast.error("Erro ao atualizar template");
      return false;
    }
  };

  useEffect(() => {
    loadContratos();
    loadTemplates();

    const interval = setInterval(() => {
      loadContratos();
    }, 45000); // Polling every 45s

    return () => clearInterval(interval);
  }, [selectedClinic]);

  return {
    contratos,
    templates,
    loading,
    createContrato,
    createFromTemplate,
    updateContrato,
    signContrato,
    cancelContrato,
    createTemplate,
    updateTemplate,
    refreshContratos: loadContratos,
    refreshTemplates: loadTemplates,
  };
}
