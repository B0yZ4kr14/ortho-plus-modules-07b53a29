import { Anexo } from "@/domain/entities/Anexo";
import { IAnexoRepository } from "@/domain/repositories/IAnexoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { AnexoMapper } from "../mappers/AnexoMapper";

export class SupabaseAnexoRepository implements IAnexoRepository {
  async findById(id: string): Promise<Anexo | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_anexos?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return AnexoMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar anexo", error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_anexos?prontuario_id=eq.${prontuarioId}&order=created_at.desc`,
      );
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar anexos do prontuário",
        error,
      );
    }
  }

  async findByHistoricoId(historicoId: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_anexos?historico_id=eq.${historicoId}&order=created_at.desc`,
      );
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar anexos do histórico",
        error,
      );
    }
  }

  async findByTipo(prontuarioId: string, tipo: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_anexos?prontuario_id=eq.${prontuarioId}&tipo_arquivo=eq.${tipo}&order=created_at.desc`,
      );
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar anexos por tipo", error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_anexos?select=*,prontuarios!inner(clinic_id)&prontuarios.clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar anexos da clínica", error);
    }
  }

  async save(anexo: Anexo): Promise<void> {
    try {
      const data = AnexoMapper.toInsert(anexo);
      await apiClient.post("/rest/v1/pep_anexos", data);
    } catch (error) {
      throw new InfrastructureError("Erro ao salvar anexo", error);
    }
  }

  async update(anexo: Anexo): Promise<void> {
    try {
      const data = AnexoMapper.toPersistence(anexo);
      await apiClient.patch(`/rest/v1/pep_anexos?id=eq.${anexo.id}`, data);
    } catch (error) {
      throw new InfrastructureError("Erro ao atualizar anexo", error);
    }
  }

  async delete(id: string, storagePath: string): Promise<void> {
    try {
      // Usar a nova API de backend para deletar tanto do banco quanto do storage
      await apiClient.delete(`/rest/v1/pep_anexos?id=eq.${id}`);
    } catch (error) {
      throw new InfrastructureError("Erro ao deletar anexo", error);
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      const response = await apiClient.post<any>("/storage/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response || !response.url) {
        throw new Error("Resposta de upload inválida (sem URL pública)");
      }

      return response.url;
    } catch (error) {
      throw new InfrastructureError("Erro ao fazer upload do arquivo", error);
    }
  }
}
