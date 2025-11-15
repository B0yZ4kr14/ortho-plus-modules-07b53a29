/**
 * FASE 3: CRM - Hook React para gerenciar Leads
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lead } from '@/modules/crm/domain/entities/Lead';
import { SupabaseLeadRepository } from '@/modules/crm/infrastructure/repositories/SupabaseLeadRepository';
import { CreateLeadUseCase } from '@/modules/crm/application/use-cases/CreateLeadUseCase';
import { UpdateLeadStatusUseCase } from '@/modules/crm/application/use-cases/UpdateLeadStatusUseCase';
import { toast } from 'sonner';

const leadRepository = new SupabaseLeadRepository();
const createLeadUseCase = new CreateLeadUseCase(leadRepository);
const updateLeadStatusUseCase = new UpdateLeadStatusUseCase(leadRepository);

export function useLeads() {
  const { clinicId, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!clinicId) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedLeads = await leadRepository.findByClinicId(clinicId);
      setLeads(fetchedLeads);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar leads';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const createLead = useCallback(async (input: {
    nome: string;
    email?: string;
    telefone?: string;
    origem: 'SITE' | 'TELEFONE' | 'INDICACAO' | 'REDES_SOCIAIS' | 'EVENTO' | 'OUTRO';
    valorEstimado?: number;
    interesseDescricao?: string;
  }) => {
    if (!clinicId || !user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const lead = await createLeadUseCase.execute({
        ...input,
        clinicId,
        responsavelId: user.id,
      });

      toast.success('Lead criado com sucesso');
      await loadLeads();
      return lead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lead';
      toast.error(errorMessage);
      throw err;
    }
  }, [clinicId, user, loadLeads]);

  const updateLeadStatus = useCallback(async (
    leadId: string,
    newStatus: 'NOVO' | 'CONTATO_INICIAL' | 'QUALIFICADO' | 'PROPOSTA' | 'NEGOCIACAO' | 'GANHO' | 'PERDIDO'
  ) => {
    try {
      await updateLeadStatusUseCase.execute({
        leadId,
        newStatus,
      });

      toast.success('Status atualizado com sucesso');
      await loadLeads();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      toast.error(errorMessage);
      throw err;
    }
  }, [loadLeads]);

  return {
    leads,
    loading,
    error,
    createLead,
    updateLeadStatus,
    reloadLeads: loadLeads,
  };
}
