import { apiClient } from "@/lib/api/apiClient";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Inventario, InventarioItem } from "../types/estoque.types";

export function useInventario() {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [inventarioItems, setInventarioItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadInventarios(), loadInventarioItems()]);
    } catch (error) {
      console.error("Error loading inventário data:", error);
      toast.error("Erro ao carregar dados do inventário");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Inventários
  const loadInventarios = async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/inventarios");
      setInventarios(
        data.map((inv) => ({
          id: inv.id as string,
          numero: inv.numero,
          data: inv.data,
          tipo: inv.tipo as any,
          status: inv.status as any,
          responsavel: inv.responsavel,
          totalItens: inv.total_itens || 0,
          itensContados: inv.itens_contados || 0,
          divergenciasEncontradas: inv.divergencias_encontradas || 0,
          valorDivergencias: Number(inv.valor_divergencias || 0),
          observacoes: inv.observacoes || undefined,
          createdAt: inv.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading inventarios:", error);
    }
  };

  const addInventario = async (inventario: Inventario) => {
    try {
      const data = await apiClient.post("/estoque/inventarios", {
        numero: inventario.numero,
        data: inventario.data,
        tipo: inventario.tipo,
        status: inventario.status || "PLANEJADO",
        responsavel: inventario.responsavel,
        total_itens: inventario.totalItens || 0,
        itens_contados: inventario.itensContados || 0,
        divergencias_encontradas: inventario.divergenciasEncontradas || 0,
        valor_divergencias: inventario.valorDivergencias || 0,
        observacoes: inventario.observacoes,
      });
      toast.success("Inventário criado com sucesso");
      await loadInventarios();
      return data;
    } catch (error) {
      toast.error("Erro ao criar inventário");
      throw error;
    }
  };

  const updateInventario = async (id: string, data: Partial<Inventario>) => {
    try {
      const updateData: any = {};

      if (data.numero !== undefined) updateData.numero = data.numero;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.responsavel !== undefined)
        updateData.responsavel = data.responsavel;
      if (data.totalItens !== undefined)
        updateData.total_itens = data.totalItens;
      if (data.itensContados !== undefined)
        updateData.itens_contados = data.itensContados;
      if (data.divergenciasEncontradas !== undefined)
        updateData.divergencias_encontradas = data.divergenciasEncontradas;
      if (data.valorDivergencias !== undefined)
        updateData.valor_divergencias = data.valorDivergencias;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes;

      await apiClient.patch(`/estoque/inventarios/${id}`, updateData);
      toast.success("Inventário atualizado com sucesso");
      await loadInventarios();
    } catch (error) {
      toast.error("Erro ao atualizar inventário");
      throw error;
    }
  };

  const deleteInventario = async (id: string) => {
    try {
      await apiClient.delete(`/estoque/inventarios/${id}`);
      toast.success("Inventário excluído com sucesso");
      await loadInventarios();
    } catch (error) {
      toast.error("Erro ao excluir inventário");
      throw error;
    }
  };

  const getInventarioById = (id: string) =>
    inventarios.find((inv) => inv.id === id);

  // Itens do Inventário
  const loadInventarioItems = async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/inventarios/itens");
      setInventarioItems(
        data.map((item) => ({
          id: item.id as string,
          inventarioId: item.inventario_id,
          produtoId: item.produto_id,
          produtoNome: item.produto_nome,
          quantidadeSistema: Number(item.quantidade_sistema),
          quantidadeFisica: item.quantidade_fisica
            ? Number(item.quantidade_fisica)
            : undefined,
          divergencia: item.divergencia ? Number(item.divergencia) : undefined,
          percentualDivergencia: item.percentual_divergencia
            ? Number(item.percentual_divergencia)
            : undefined,
          valorUnitario: Number(item.valor_unitario),
          valorDivergencia: item.valor_divergencia
            ? Number(item.valor_divergencia)
            : undefined,
          lote: item.lote || undefined,
          contadoPor: item.contado_por || undefined,
          contadoEm: item.contado_em || undefined,
          observacoes: item.observacoes || undefined,
        })),
      );
    } catch (error) {
      console.error("Error loading inventario_itens:", error);
    }
  };

  const addInventarioItem = async (item: InventarioItem) => {
    try {
      const data = await apiClient.post("/estoque/inventarios/itens", {
        inventario_id: item.inventarioId,
        produto_id: item.produtoId,
        produto_nome: item.produtoNome,
        quantidade_sistema: item.quantidadeSistema,
        quantidade_fisica: item.quantidadeFisica,
        divergencia: item.divergencia,
        percentual_divergencia: item.percentualDivergencia,
        valor_unitario: item.valorUnitario,
        valor_divergencia: item.valorDivergencia,
        lote: item.lote,
        observacoes: item.observacoes,
      });
      await loadInventarioItems();
      return data;
    } catch (error) {
      toast.error("Erro ao adicionar item ao inventário");
      throw error;
    }
  };

  const updateInventarioItem = async (
    id: string,
    data: Partial<InventarioItem>,
  ) => {
    try {
      const updateData: any = {};

      if (data.quantidadeFisica !== undefined) {
        updateData.quantidade_fisica = data.quantidadeFisica;
      }
      if (data.divergencia !== undefined)
        updateData.divergencia = data.divergencia;
      if (data.percentualDivergencia !== undefined)
        updateData.percentual_divergencia = data.percentualDivergencia;
      if (data.valorDivergencia !== undefined)
        updateData.valor_divergencia = data.valorDivergencia;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes;

      await apiClient.patch(`/estoque/inventarios/itens/${id}`, updateData);
      await loadInventarioItems();
    } catch (error) {
      toast.error("Erro ao atualizar item do inventário");
      throw error;
    }
  };

  const getInventarioItemsByInventarioId = (inventarioId: string) =>
    inventarioItems.filter((item) => item.inventarioId === inventarioId);

  // Gerar ajustes automáticos baseados nas divergências
  const gerarAjustesAutomaticos = async (inventarioId: string) => {
    try {
      await apiClient.post(
        `/estoque/inventarios/${inventarioId}/ajustes-automaticos`,
        {},
      );
      toast.success(`Ajustes de estoque criados com sucesso`);
      await loadAllData();
    } catch (error) {
      toast.error("Erro ao gerar ajustes automáticos");
      throw error;
    }
  };

  return {
    inventarios,
    inventarioItems,
    loading,
    loadInventarios,
    addInventario,
    updateInventario,
    deleteInventario,
    getInventarioById,
    loadInventarioItems,
    addInventarioItem,
    updateInventarioItem,
    getInventarioItemsByInventarioId,
    gerarAjustesAutomaticos,
  };
}
