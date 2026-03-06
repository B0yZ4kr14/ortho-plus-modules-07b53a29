import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  ContaPagar,
  ContaReceber,
  DashboardFinanceiroData,
  NotaFiscal,
} from "../../types/financeiro-completo.types";

export function useFinanceiro() {
  const { user, selectedClinic } = useAuth();
  const [loading, setLoading] = useState(true);

  // Estados
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);

  // ============= CONTAS A RECEBER =============

  const loadContasReceber = async () => {
    if (!user || !selectedClinic) return;

    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${selectedClinic}`);
      params.append("order", "data_vencimento.asc");
      const data = await apiClient.get<ContaReceber[]>(
        `/rest/v1/contas_receber?${params.toString()}`,
      );
      setContasReceber(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas a receber:", error);
      toast.error("Erro ao carregar contas a receber");
    }
  };

  const addContaReceber = async (
    conta: Omit<ContaReceber, "id" | "created_at" | "updated_at">,
  ) => {
    if (!user || !selectedClinic) return;

    try {
      const payload = {
        ...conta,
        clinic_id: selectedClinic,
        created_by: user.id,
      };

      const data = await apiClient.post<ContaReceber[]>(
        "/rest/v1/contas_receber",
        payload,
        {
          headers: { Prefer: "return=representation" },
        },
      );
      await loadContasReceber();
      toast.success("Conta a receber adicionada com sucesso!");
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Erro ao adicionar conta a receber:", error);
      toast.error("Erro ao adicionar conta a receber");
      throw error;
    }
  };

  const updateContaReceber = async (
    id: string,
    updates: Partial<ContaReceber>,
  ) => {
    try {
      await apiClient.patch(`/rest/v1/contas_receber?id=eq.${id}`, updates);
      await loadContasReceber();
      toast.success("Conta a receber atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar conta a receber:", error);
      toast.error("Erro ao atualizar conta a receber");
      throw error;
    }
  };

  const deleteContaReceber = async (id: string) => {
    try {
      await apiClient.delete(`/rest/v1/contas_receber?id=eq.${id}`);
      await loadContasReceber();
      toast.success("Conta a receber excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir conta a receber:", error);
      toast.error("Erro ao excluir conta a receber");
      throw error;
    }
  };

  // ============= CONTAS A PAGAR =============

  const loadContasPagar = async () => {
    if (!user || !selectedClinic) return;

    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${selectedClinic}`);
      params.append("order", "data_vencimento.asc");
      const data = await apiClient.get<ContaPagar[]>(
        `/rest/v1/contas_pagar?${params.toString()}`,
      );
      setContasPagar(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas a pagar:", error);
      toast.error("Erro ao carregar contas a pagar");
    }
  };

  const addContaPagar = async (
    conta: Omit<ContaPagar, "id" | "created_at" | "updated_at">,
  ) => {
    if (!user || !selectedClinic) return;

    try {
      const payload = {
        ...conta,
        clinic_id: selectedClinic,
        created_by: user.id,
      };

      const data = await apiClient.post<ContaPagar[]>(
        "/rest/v1/contas_pagar",
        payload,
        {
          headers: { Prefer: "return=representation" },
        },
      );
      await loadContasPagar();
      toast.success("Conta a pagar adicionada com sucesso!");
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Erro ao adicionar conta a pagar:", error);
      toast.error("Erro ao adicionar conta a pagar");
      throw error;
    }
  };

  const updateContaPagar = async (id: string, updates: Partial<ContaPagar>) => {
    try {
      await apiClient.patch(`/rest/v1/contas_pagar?id=eq.${id}`, updates);
      await loadContasPagar();
      toast.success("Conta a pagar atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar conta a pagar:", error);
      toast.error("Erro ao atualizar conta a pagar");
      throw error;
    }
  };

  const deleteContaPagar = async (id: string) => {
    try {
      await apiClient.delete(`/rest/v1/contas_pagar?id=eq.${id}`);
      await loadContasPagar();
      toast.success("Conta a pagar excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir conta a pagar:", error);
      toast.error("Erro ao excluir conta a pagar");
      throw error;
    }
  };

  // ============= NOTAS FISCAIS =============

  const loadNotasFiscais = async () => {
    if (!user || !selectedClinic) return;

    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${selectedClinic}`);
      params.append("order", "data_emissao.desc");
      const data = await apiClient.get<NotaFiscal[]>(
        `/rest/v1/notas_fiscais?${params.toString()}`,
      );
      setNotasFiscais(data || []);
    } catch (error) {
      console.error("Erro ao carregar notas fiscais:", error);
      toast.error("Erro ao carregar notas fiscais");
    }
  };

  const addNotaFiscal = async (
    nota: Omit<NotaFiscal, "id" | "created_at" | "updated_at">,
  ) => {
    if (!user || !selectedClinic) return;

    try {
      const payload = {
        ...nota,
        clinic_id: selectedClinic,
        created_by: user.id,
      };

      const data = await apiClient.post<NotaFiscal[]>(
        "/rest/v1/notas_fiscais",
        payload,
        {
          headers: { Prefer: "return=representation" },
        },
      );
      await loadNotasFiscais();
      toast.success("Nota fiscal emitida com sucesso!");
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Erro ao emitir nota fiscal:", error);
      toast.error("Erro ao emitir nota fiscal");
      throw error;
    }
  };

  const updateNotaFiscal = async (id: string, updates: Partial<NotaFiscal>) => {
    try {
      await apiClient.patch(`/rest/v1/notas_fiscais?id=eq.${id}`, updates);
      await loadNotasFiscais();
      toast.success("Nota fiscal atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar nota fiscal:", error);
      toast.error("Erro ao atualizar nota fiscal");
      throw error;
    }
  };

  const deleteNotaFiscal = async (id: string) => {
    try {
      await apiClient.delete(`/rest/v1/notas_fiscais?id=eq.${id}`);
      await loadNotasFiscais();
      toast.success("Nota fiscal excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir nota fiscal:", error);
      toast.error("Erro ao excluir nota fiscal");
      throw error;
    }
  };

  // ============= DASHBOARD CONSOLIDADO =============

  const getDashboardData = (): DashboardFinanceiroData => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calcular totais de contas a receber
    const totalReceber = contasReceber
      .filter((c) => c.status !== "pago" && c.status !== "cancelado")
      .reduce((sum, c) => sum + (c.valor - (c.valor_pago || 0)), 0);

    const recibidasMes = contasReceber
      .filter((c) => c.status === "pago")
      .reduce((sum, c) => sum + (c.valor_pago || 0), 0);

    const vencidasReceber = contasReceber
      .filter((c) => c.status === "atrasado")
      .reduce((sum, c) => sum + c.valor, 0);

    // Calcular totais de contas a pagar
    const totalPagar = contasPagar
      .filter((c) => c.status !== "pago" && c.status !== "cancelado")
      .reduce((sum, c) => sum + c.valor, 0);

    const pagasMes = contasPagar
      .filter((c) => c.status === "pago")
      .reduce((sum, c) => sum + c.valor, 0);

    const vencidasPagar = contasPagar
      .filter((c) => c.status === "atrasado")
      .reduce((sum, c) => sum + c.valor, 0);

    // Fluxo de Caixa
    const entradas = recibidasMes;
    const saidas = pagasMes;
    const saldo = entradas - saidas;

    // DRE
    const receitaBruta = recibidasMes;
    const deducoes = 0; // Impostos sobre receita
    const receitaLiquida = receitaBruta - deducoes;
    const despesasOperacionais = pagasMes;
    const despesasFinanceiras = 0;
    const lucroLiquido =
      receitaLiquida - despesasOperacionais - despesasFinanceiras;

    // Notas Fiscais
    const emitidas = notasFiscais.filter(
      (n) => n.status === "emitida" || n.status === "enviada",
    ).length;
    const valorTotalNF = notasFiscais
      .filter((n) => n.status === "emitida" || n.status === "enviada")
      .reduce((sum, n) => sum + n.valor_total, 0);
    const pendentesNF = notasFiscais.filter(
      (n) => n.status === "pendente",
    ).length;

    return {
      fluxoCaixa: {
        entradas,
        saidas,
        saldo,
        projecao7dias: totalReceber * 0.3,
        projecao30dias: totalReceber * 0.7,
      },
      contasReceber: {
        total: totalReceber,
        vencidas: vencidasReceber,
        aVencer: totalReceber - vencidasReceber,
        recebidas: recibidasMes,
      },
      contasPagar: {
        total: totalPagar,
        vencidas: vencidasPagar,
        aVencer: totalPagar - vencidasPagar,
        pagas: pagasMes,
      },
      dre: {
        receitaBruta,
        deducoes,
        receitaLiquida,
        despesasOperacionais,
        despesasFinanceiras,
        lucroLiquido,
      },
      notasFiscais: {
        emitidas,
        valorTotal: valorTotalNF,
        pendentes: pendentesNF,
      },
    };
  };

  // Load inicial e Realtime
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        loadContasReceber(),
        loadContasPagar(),
        loadNotasFiscais(),
      ]);
      if (mounted) setLoading(false);
    };

    const pollData = async () => {
      if (!user || !selectedClinic || !mounted) return;
      try {
        await Promise.all([
          loadContasReceber(),
          loadContasPagar(),
          loadNotasFiscais(),
        ]);
      } catch (error) {
        console.error("Polling error:", error);
      }

      if (mounted) {
        timeoutId = setTimeout(pollData, 10000); // Poll every 10 seconds
      }
    };

    if (user && selectedClinic) {
      loadAll().then(() => {
        if (mounted) {
          timeoutId = setTimeout(pollData, 10000);
        }
      });

      return () => {
        mounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, [user, selectedClinic]);

  return {
    loading,
    // Contas a Receber
    contasReceber,
    addContaReceber,
    updateContaReceber,
    deleteContaReceber,
    loadContasReceber,
    // Contas a Pagar
    contasPagar,
    addContaPagar,
    updateContaPagar,
    deleteContaPagar,
    loadContasPagar,
    // Notas Fiscais
    notasFiscais,
    addNotaFiscal,
    updateNotaFiscal,
    deleteNotaFiscal,
    loadNotasFiscais,
    // Dashboard
    getDashboardData,

    // ============= MÉTODOS ADAPTER PARA COMPATIBILIDADE =============
    // Combina contas a receber e pagar em um único array "transactions"
    transactions: [
      ...contasReceber.map((c) => ({
        ...c,
        type: "RECEITA" as const,
        status: c.status?.toUpperCase() as any,
        category: (c as any).categoria || "OUTROS",
      })),
      ...contasPagar.map((c) => ({
        ...c,
        type: "DESPESA" as const,
        status: c.status?.toUpperCase() as any,
        category: (c as any).categoria || "OUTROS",
      })),
    ].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime(),
    ),

    addTransaction: async (transaction: any) => {
      if (transaction.tipo === "RECEITA") {
        return addContaReceber(transaction);
      } else {
        return addContaPagar(transaction);
      }
    },

    updateTransaction: async (id: string, updates: any) => {
      // Tentar atualizar em contas a receber primeiro
      const isReceber = contasReceber.some((c) => c.id === id);
      if (isReceber) {
        return updateContaReceber(id, updates);
      } else {
        return updateContaPagar(id, updates);
      }
    },

    deleteTransaction: async (id: string) => {
      // Tentar deletar de contas a receber primeiro
      const isReceber = contasReceber.some((c) => c.id === id);
      if (isReceber) {
        return deleteContaReceber(id);
      } else {
        return deleteContaPagar(id);
      }
    },

    getFinancialSummary: () => {
      const totalReceitas = contasReceber
        .filter((c) => c.status === "pago")
        .reduce((sum, c) => sum + (c.valor_pago || 0), 0);

      const totalDespesas = contasPagar
        .filter((c) => c.status === "pago")
        .reduce((sum, c) => sum + (c.valor || 0), 0);

      const saldoTotal = totalReceitas - totalDespesas;

      const receitasPendentes = contasReceber
        .filter((c) => c.status === "pendente")
        .reduce((sum, c) => sum + (c.valor || 0), 0);

      const despesasPendentes = contasPagar
        .filter((c) => c.status === "pendente")
        .reduce((sum, c) => sum + (c.valor || 0), 0);

      return {
        totalRevenue: totalReceitas,
        totalExpenses: totalDespesas,
        netProfit: saldoTotal,
        pendingRevenue: receitasPendentes,
        pendingPayments: despesasPendentes,
        revenueChange: 0,
        paymentsChange: 0,
        expensesChange: 0,
        profitChange: 0,
        totalReceitas,
        totalDespesas,
        saldoTotal,
        receitasPendentes,
        despesasPendentes,
      };
    },

    getMonthlyData: () => {
      const now = new Date();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
          month: date.toLocaleString("pt-BR", { month: "short" }),
          year: date.getFullYear(),
          key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        };
      }).reverse();

      return last6Months.map(({ month, key }) => {
        const receitas = contasReceber
          .filter((c) => {
            const createdDate = new Date(c.created_at || "");
            const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
            return createdKey === key && c.status === "pago";
          })
          .reduce((sum, c) => sum + (c.valor_pago || 0), 0);

        const despesas = contasPagar
          .filter((c) => {
            const createdDate = new Date(c.created_at || "");
            const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
            return createdKey === key && c.status === "pago";
          })
          .reduce((sum, c) => sum + (c.valor || 0), 0);

        return {
          month,
          revenue: receitas,
          expense: despesas,
          receitas,
          despesas,
        };
      });
    },

    getCategoryDistribution: () => {
      const categories: Record<string, number> = {};

      contasReceber
        .filter((c) => c.status === "pago")
        .forEach((c) => {
          const category = (c as any).categoria || "OUTROS";
          categories[category] =
            (categories[category] || 0) + (c.valor_pago || 0);
        });

      return Object.entries(categories).map(([name, value]) => ({
        name,
        category: name,
        value,
        percentage: 0, // Calculado posteriormente se necessário
      }));
    },
  };
}
