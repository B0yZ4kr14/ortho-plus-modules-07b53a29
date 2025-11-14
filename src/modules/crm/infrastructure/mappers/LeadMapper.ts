import { Lead, LeadProps, LeadStatus, LeadSource } from '../../domain/entities/Lead';
import { Database } from '@/integrations/supabase/types';

type LeadRow = Database['public']['Tables']['crm_leads']['Row'];
type LeadInsert = Database['public']['Tables']['crm_leads']['Insert'];

export class LeadMapper {
  static toDomain(raw: LeadRow): Lead {
    const props: LeadProps = {
      id: raw.id,
      clinicId: raw.clinic_id,
      nome: raw.name,
      email: raw.email || undefined,
      telefone: raw.phone || undefined,
      origem: raw.source as LeadSource,
      status: raw.status as LeadStatus,
      interesseDescricao: raw.interest_description || undefined,
      valorEstimado: raw.estimated_value || undefined,
      responsavelId: raw.assigned_to || undefined,
      tags: raw.tags || undefined,
      proximoContato: raw.next_contact_date ? new Date(raw.next_contact_date) : undefined,
      observacoes: raw.notes || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };

    return new Lead(props);
  }

  static toPersistence(lead: Lead): Omit<LeadInsert, 'created_at' | 'created_by'> {
    const json = lead.toJSON();
    
    return {
      id: json.id,
      clinic_id: json.clinicId,
      name: json.nome,
      email: json.email || null,
      phone: json.telefone || null,
      source: json.origem,
      status: json.status,
      interest_description: json.interesseDescricao || null,
      estimated_value: json.valorEstimado || null,
      assigned_to: json.responsavelId || null,
      tags: json.tags || null,
      next_contact_date: json.proximoContato?.toISOString() || null,
      notes: json.observacoes || null,
      updated_at: json.updatedAt.toISOString(),
    };
  }
}
