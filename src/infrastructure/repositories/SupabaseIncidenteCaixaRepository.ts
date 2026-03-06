import {
  IncidenteCaixa,
  TipoIncidenteCaixa,
} from "@/domain/entities/IncidenteCaixa";
import { IIncidenteCaixaRepository } from "@/domain/repositories/IIncidenteCaixaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { IncidenteCaixaMapper } from "./mappers/IncidenteCaixaMapper";

export class SupabaseIncidenteCaixaRepository implements IIncidenteCaixaRepository {
  async findById(id: string): Promise<IncidenteCaixa | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_incidentes?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return IncidenteCaixaMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<IncidenteCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_incidentes?clinic_id=eq.${clinicId}&order=data_incidente.desc`,
      );
      return (data || []).map((row) => IncidenteCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByTipo(
    clinicId: string,
    tipo: TipoIncidenteCaixa,
  ): Promise<IncidenteCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_incidentes?clinic_id=eq.${clinicId}&tipo_incidente=eq.${tipo}&order=data_incidente.desc`,
      );
      return (data || []).map((row) => IncidenteCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByPeriodo(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IncidenteCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_incidentes?clinic_id=eq.${clinicId}&data_incidente=gte.${startDate.toISOString()}&data_incidente=lte.${endDate.toISOString()}&order=data_incidente.desc`,
      );
      return (data || []).map((row) => IncidenteCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findGraves(clinicId: string): Promise<IncidenteCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_incidentes?clinic_id=eq.${clinicId}&or=(tipo_incidente.eq.ROUBO,valor_perdido.gt.1000)&order=data_incidente.desc`,
      );
      return (data || []).map((row) => IncidenteCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(incidente: IncidenteCaixa): Promise<void> {
    const insert = IncidenteCaixaMapper.toSupabaseInsert(incidente);
    try {
      await apiClient.post("/rest/v1/caixa_incidentes", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar incidente de caixa: ${error.message}`);
    }
  }

  async update(incidente: IncidenteCaixa): Promise<void> {
    const insert = IncidenteCaixaMapper.toSupabaseInsert(incidente);
    try {
      await apiClient.patch(
        `/rest/v1/caixa_incidentes?id=eq.${incidente.id}`,
        insert,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar incidente de caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/caixa_incidentes?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar incidente de caixa: ${error.message}`);
    }
  }
}
