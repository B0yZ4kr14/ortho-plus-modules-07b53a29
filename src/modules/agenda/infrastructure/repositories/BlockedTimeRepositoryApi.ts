import { apiClient } from "@/lib/api/apiClient";
import { BlockedTime } from "../../domain/entities/BlockedTime";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";
import { BlockedTimeMapper } from "../mappers/BlockedTimeMapper";

export class BlockedTimeRepositoryApi implements IBlockedTimeRepository {
  private readonly basePath = "/agenda/blocked-times";

  async save(blockedTime: BlockedTime): Promise<BlockedTime> {
    const data = BlockedTimeMapper.toPersistence(blockedTime);
    const result = await apiClient.post<any>(this.basePath, data);
    return BlockedTimeMapper.toDomain(result);
  }

  async findById(id: string): Promise<BlockedTime | null> {
    try {
      const data = await apiClient.get<any>(`${this.basePath}/${id}`);
      return data ? BlockedTimeMapper.toDomain(data) : null;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar bloqueio: ${error.message}`);
    }
  }

  async findByDentist(dentistId: string): Promise<BlockedTime[]> {
    const data = await apiClient.get<any[]>(this.basePath, {
      params: {
        dentist_id: dentistId,
        active: true,
      },
    });
    return data.map(BlockedTimeMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockedTime[]> {
    const data = await apiClient.get<any[]>(this.basePath, {
      params: {
        dentist_id: dentistId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    return data.map(BlockedTimeMapper.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<BlockedTime[]> {
    const data = await apiClient.get<any[]>(this.basePath, {
      params: {
        clinic_id: clinicId,
        active: true,
      },
    });
    return data.map(BlockedTimeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
