import {
  IncidenteCaixa,
  TipoIncidenteCaixa,
} from "@/domain/entities/IncidenteCaixa";
import { IIncidenteCaixaRepository } from "@/domain/repositories/IIncidenteCaixaRepository";
import { apiClient } from "@/lib/api/apiClient";
import type { Tables } from '@/types/database';
import { IncidenteCaixaMapper } from "./mappers/IncidenteCaixaMapper";

export class DbIncidenteCaixaRepository implements IIncidenteCaixaRepository {
  async findById(id: string): Promise<IncidenteCaixa | null> {
    try {
      const data = await apiClient.get<Tables<"caixa_incidentes">>(`/financeiro/incidentes/${id}`);
      if (!data) return null;
      return IncidenteCaixaMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<IncidenteCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_incidentes">[]>("/financeiro/incidentes", {
        params: { clinic_id: clinicId },
      });
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
      const data = await apiClient.get<Tables<"caixa_incidentes">[]>("/financeiro/incidentes", {
        params: { clinic_id: clinicId, tipo_incidente: tipo },
      });
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
      const data = await apiClient.get<Tables<"caixa_incidentes">[]>("/financeiro/incidentes", {
        params: {
          clinic_id: clinicId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });
      return (data || []).map((row) => IncidenteCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findGraves(clinicId: string): Promise<IncidenteCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_incidentes">[]>("/financeiro/incidentes", {
        params: { clinic_id: clinicId, graves: "true" },
      });
      return (data || []).map((row) => IncidenteCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(incidente: IncidenteCaixa): Promise<void> {
    const insert = IncidenteCaixaMapper.toDbInsert(incidente);
    try {
      await apiClient.post("/financeiro/incidentes", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar incidente de caixa: ${error.message}`);
    }
  }

  async update(incidente: IncidenteCaixa): Promise<void> {
    const insert = IncidenteCaixaMapper.toDbInsert(incidente);
    try {
      await apiClient.patch(`/financeiro/incidentes/${incidente.id}`, insert);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar incidente de caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/financeiro/incidentes/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar incidente de caixa: ${error.message}`);
    }
  }
}
