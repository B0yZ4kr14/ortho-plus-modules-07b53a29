import { supabase } from '@/integrations/supabase/client';
import { Orcamento, StatusOrcamento } from '../../domain/entities/Orcamento';
import { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export class SupabaseOrcamentoRepository implements IOrcamentoRepository {
  async findById(id: string): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByNumero(numeroOrcamento: string, clinicId: string): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('numero_orcamento', numeroOrcamento)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByPatientId(patientId: string, clinicId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.toDomain);
  }

  async findByStatus(clinicId: string, status: StatusOrcamento): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(this.toDomain);
  }

  async findPendentes(clinicId: string): Promise<Orcamento[]> {
    return this.findByStatus(clinicId, 'PENDENTE');
  }

  async findExpirados(clinicId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .lt('data_expiracao', new Date().toISOString())
      .eq('status', 'PENDENTE')
      .order('data_expiracao', { ascending: true });

    if (error || !data) return [];
    return data.map(this.toDomain);
  }

  async save(orcamento: Orcamento): Promise<void> {
    const data = this.toPersistence(orcamento);
    const { error } = await supabase.from('budgets').insert(data);
    if (error) throw new Error(`Erro ao salvar orçamento: ${error.message}`);
  }

  async update(orcamento: Orcamento): Promise<void> {
    const data = this.toPersistence(orcamento);
    const { error } = await supabase
      .from('budgets')
      .update(data)
      .eq('id', orcamento.id);
    if (error) throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw new Error(`Erro ao deletar orçamento: ${error.message}`);
  }

  private toDomain(data: any): Orcamento {
    return Orcamento.restore({
      id: data.id,
      numeroOrcamento: data.numero_orcamento,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      createdBy: data.created_by,
      titulo: data.titulo,
      descricao: data.descricao,
      tipoPlano: data.tipo_plano,
      validadeDias: data.validade_dias,
      dataExpiracao: new Date(data.data_expiracao),
      status: data.status as StatusOrcamento,
      valorSubtotal: data.valor_subtotal,
      descontoPercentual: data.desconto_percentual,
      descontoValor: data.desconto_valor,
      valorTotal: data.valor_total,
      observacoes: data.observacoes,
      aprovadoPor: data.aprovado_por,
      aprovadoEm: data.aprovado_em ? new Date(data.aprovado_em) : undefined,
      rejeitadoPor: data.rejeitado_por,
      rejeitadoEm: data.rejeitado_em ? new Date(data.rejeitado_em) : undefined,
      motivoRejeicao: data.motivo_rejeicao,
      convertidoContrato: data.convertido_contrato,
      contratoId: data.contrato_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  private toPersistence(orcamento: Orcamento): any {
    return {
      id: orcamento.id,
      numero_orcamento: orcamento.numeroOrcamento,
      clinic_id: orcamento.clinicId,
      patient_id: orcamento.patientId,
      created_by: orcamento.createdBy,
      titulo: orcamento.titulo,
      descricao: orcamento.descricao,
      tipo_plano: orcamento.tipoPlano,
      validade_dias: orcamento.validadeDias,
      data_expiracao: orcamento.dataExpiracao.toISOString(),
      status: orcamento.status,
      valor_subtotal: orcamento.valorSubtotal,
      desconto_percentual: orcamento.descontoPercentual,
      desconto_valor: orcamento.descontoValor,
      valor_total: orcamento.valorTotal,
      observacoes: orcamento.observacoes,
      aprovado_por: orcamento.aprovadoPor,
      aprovado_em: orcamento.aprovadoEm?.toISOString(),
      rejeitado_por: orcamento.rejeitadoPor,
      rejeitado_em: orcamento.rejeitadoEm?.toISOString(),
      motivo_rejeicao: orcamento.motivoRejeicao,
      convertido_contrato: orcamento.convertidoContrato,
      contrato_id: orcamento.contratoId,
      created_at: orcamento.createdAt.toISOString(),
      updated_at: orcamento.updatedAt.toISOString(),
    };
  }
}
