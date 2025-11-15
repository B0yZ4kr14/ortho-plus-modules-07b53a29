/**
 * FASE 3: CRM - Repositório Supabase para Leads
 */

import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadProps } from '../../domain/entities/Lead';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';

export class SupabaseLeadRepository implements ILeadRepository {
  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.toDomain(row));
  }

  async findByStatus(clinicId: string, status: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', status)
      .order('created_at', { ascending: false});

    if (error || !data) {
      return [];
    }

    return data.map(row => this.toDomain(row));
  }

  async save(lead: Lead): Promise<void> {
    const insert = this.toSupabaseInsert(lead);

    const { error } = await supabase
      .from('crm_leads')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar lead: ${error.message}`);
    }
  }

  async update(lead: Lead): Promise<void> {
    const insert = this.toSupabaseInsert(lead);

    const { error } = await supabase
      .from('crm_leads')
      .update(insert)
      .eq('id', lead.id);

    if (error) {
      throw new Error(`Erro ao atualizar lead: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar lead: ${error.message}`);
    }
  }

  private toDomain(row: any): Lead {
    const props: LeadProps = {
      id: row.id,
      clinicId: row.clinic_id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      origem: row.origem,
      status: row.status,
      responsavelId: row.responsavel_id,
      valorEstimado: row.valor_estimado,
      proximoContato: row.proximo_contato ? new Date(row.proximo_contato) : undefined,
      observacoes: row.observacoes,
      tags: row.tags || [],
      motivoPerdido: row.motivo_perdido,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Lead(props);
  }

  private toSupabaseInsert(lead: Lead): any {
    return {
      id: lead.id,
      clinic_id: lead.clinicId,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      origem: lead.origem,
      status: lead.status,
      responsavel_id: lead.responsavelId,
      valor_estimado: lead.valorEstimado,
      proximo_contato: lead.proximoContato?.toISOString(),
      observacoes: lead.observacoes,
      tags: lead.tags,
      motivo_perdido: lead.motivoPerdido,
      created_at: lead.createdAt.toISOString(),
      updated_at: lead.updatedAt.toISOString(),
    };
  }
}
