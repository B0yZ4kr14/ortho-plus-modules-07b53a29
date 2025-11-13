import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Inventario, InventarioItem } from '../types/estoque.types';
import { toast } from 'sonner';

export function useInventarioSupabase() {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [inventarioItems, setInventarioItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount and setup realtime
  useEffect(() => {
    loadAllData();

    // Setup Realtime subscriptions
    const inventariosChannel = supabase
      .channel('inventarios_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventarios' }, () => {
        loadInventarios();
      })
      .subscribe();

    const inventarioItensChannel = supabase
      .channel('inventario_itens_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_itens' }, () => {
        loadInventarioItems();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(inventariosChannel);
      supabase.removeChannel(inventarioItensChannel);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInventarios(),
        loadInventarioItems(),
      ]);
    } catch (error) {
      console.error('Error loading inventário data:', error);
      toast.error('Erro ao carregar dados do inventário');
    } finally {
      setLoading(false);
    }
  };

  // Inventários
  const loadInventarios = async () => {
    const { data, error } = await supabase
      .from('inventarios' as any)
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      console.error('Error loading inventarios:', error);
      return;
    }

    setInventarios((data as any[]).map((inv: any) => ({
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
    })));
  };

  const addInventario = async (inventario: Inventario) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    const { data, error } = await supabase
      .from('inventarios' as any)
      .insert({
        clinic_id: profile?.clinic_id,
        numero: inventario.numero,
        data: inventario.data,
        tipo: inventario.tipo,
        status: inventario.status || 'PLANEJADO',
        responsavel: inventario.responsavel,
        total_itens: inventario.totalItens || 0,
        itens_contados: inventario.itensContados || 0,
        divergencias_encontradas: inventario.divergenciasEncontradas || 0,
        valor_divergencias: inventario.valorDivergencias || 0,
        observacoes: inventario.observacoes,
        created_by: userData.user?.id,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar inventário');
      throw error;
    }

    toast.success('Inventário criado com sucesso');
    await loadInventarios();
    return data;
  };

  const updateInventario = async (id: string, data: Partial<Inventario>) => {
    const updateData: any = {};
    
    if (data.numero !== undefined) updateData.numero = data.numero;
    if (data.data !== undefined) updateData.data = data.data;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.responsavel !== undefined) updateData.responsavel = data.responsavel;
    if (data.totalItens !== undefined) updateData.total_itens = data.totalItens;
    if (data.itensContados !== undefined) updateData.itens_contados = data.itensContados;
    if (data.divergenciasEncontradas !== undefined) updateData.divergencias_encontradas = data.divergenciasEncontradas;
    if (data.valorDivergencias !== undefined) updateData.valor_divergencias = data.valorDivergencias;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    const { error } = await supabase
      .from('inventarios' as any)
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar inventário');
      throw error;
    }

    toast.success('Inventário atualizado com sucesso');
    await loadInventarios();
  };

  const deleteInventario = async (id: string) => {
    const { error } = await supabase
      .from('inventarios' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir inventário');
      throw error;
    }

    toast.success('Inventário excluído com sucesso');
    await loadInventarios();
  };

  const getInventarioById = (id: string) => inventarios.find(inv => inv.id === id);

  // Itens do Inventário
  const loadInventarioItems = async () => {
    const { data, error } = await supabase
      .from('inventario_itens' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading inventario_itens:', error);
      return;
    }

    setInventarioItems((data as any[]).map((item: any) => ({
      id: item.id as string,
      inventarioId: item.inventario_id,
      produtoId: item.produto_id,
      produtoNome: item.produto_nome,
      quantidadeSistema: Number(item.quantidade_sistema),
      quantidadeFisica: item.quantidade_fisica ? Number(item.quantidade_fisica) : undefined,
      divergencia: item.divergencia ? Number(item.divergencia) : undefined,
      percentualDivergencia: item.percentual_divergencia ? Number(item.percentual_divergencia) : undefined,
      valorUnitario: Number(item.valor_unitario),
      valorDivergencia: item.valor_divergencia ? Number(item.valor_divergencia) : undefined,
      lote: item.lote || undefined,
      contadoPor: item.contado_por || undefined,
      contadoEm: item.contado_em || undefined,
      observacoes: item.observacoes || undefined,
    })));
  };

  const addInventarioItem = async (item: InventarioItem) => {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('inventario_itens' as any)
      .insert({
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
        contado_por: userData.user?.id,
        contado_em: new Date().toISOString(),
        observacoes: item.observacoes,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao adicionar item ao inventário');
      throw error;
    }

    await loadInventarioItems();
    return data;
  };

  const updateInventarioItem = async (id: string, data: Partial<InventarioItem>) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const updateData: any = {};
    
    if (data.quantidadeFisica !== undefined) {
      updateData.quantidade_fisica = data.quantidadeFisica;
      updateData.contado_por = userData.user?.id;
      updateData.contado_em = new Date().toISOString();
    }
    if (data.divergencia !== undefined) updateData.divergencia = data.divergencia;
    if (data.percentualDivergencia !== undefined) updateData.percentual_divergencia = data.percentualDivergencia;
    if (data.valorDivergencia !== undefined) updateData.valor_divergencia = data.valorDivergencia;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    const { error } = await supabase
      .from('inventario_itens' as any)
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar item do inventário');
      throw error;
    }

    await loadInventarioItems();
  };

  const getInventarioItemsByInventarioId = (inventarioId: string) => 
    inventarioItems.filter(item => item.inventarioId === inventarioId);

  // Gerar ajustes automáticos baseados nas divergências
  const gerarAjustesAutomaticos = async (inventarioId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    // Buscar itens com divergências do inventário
    const { data: items, error: itemsError } = await supabase
      .from('inventario_itens' as any)
      .select('*')
      .eq('inventario_id', inventarioId)
      .neq('divergencia', 0);

    if (itemsError) {
      toast.error('Erro ao buscar divergências');
      throw itemsError;
    }

    if (!items || items.length === 0) {
      toast.info('Nenhuma divergência encontrada para ajustar');
      return;
    }

    // Criar movimentações de AJUSTE para cada divergência
    const movimentacoes = (items as any[]).map((item: any) => ({
      clinic_id: profile?.clinic_id,
      produto_id: item.produto_id,
      tipo: 'AJUSTE',
      quantidade: Math.abs(item.divergencia),
      tipo_movimentacao: item.divergencia > 0 ? 'ENTRADA' : 'SAIDA',
      motivo: `Ajuste automático - Inventário ${inventarioId}`,
      lote: item.lote,
      created_by: userData.user?.id,
    }));

    const { error: movError } = await supabase
      .from('estoque_movimentacoes' as any)
      .insert(movimentacoes);

    if (movError) {
      toast.error('Erro ao criar movimentações de ajuste');
      throw movError;
    }

    // Atualizar quantidades dos produtos
    for (const item of (items as any[])) {
      const { data: produto } = await supabase
        .from('estoque_produtos' as any)
        .select('quantidade_atual')
        .eq('id', item.produto_id)
        .single();

      if (produto) {
        const novaQuantidade = Number((produto as any).quantidade_atual) + Number(item.divergencia);
        
        await supabase
          .from('estoque_produtos' as any)
          .update({ quantidade_atual: novaQuantidade })
          .eq('id', item.produto_id);
      }
    }

    // Atualizar status do inventário para CONCLUIDO
    await updateInventario(inventarioId, { status: 'CONCLUIDO' });

    toast.success(`${items.length} ajuste(s) de estoque criado(s) com sucesso`);
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
