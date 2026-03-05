import { Database } from "@/integrations/supabase/types";
import { apiClient } from "@/lib/api/apiClient";
import { BlockedTime } from "../../domain/entities/BlockedTime";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";
import { BlockedTimeMapper } from "../mappers/BlockedTimeMapper";

type BlockedTimeRow = Database["public"]["Tables"]["blocked_times"]["Row"];

export class BlockedTimeRepositoryApi implements IBlockedTimeRepository {
  private readonly basePath = "/rest/v1/blocked_times";

  async save(blockedTime: BlockedTime): Promise<BlockedTime> {
    const data = BlockedTimeMapper.toPersistence(blockedTime);

    // In PostgREST, we can POST to create. To return the representation we usually provide a select header,
    // but apiClient handles mapping `.post` properly. Assuming the endpoint returns the saved record:
    const result = await apiClient.post<BlockedTimeRow>(this.basePath, data);

    return BlockedTimeMapper.toDomain(result);
  }

  async findById(id: string): Promise<BlockedTime | null> {
    try {
      const data = await apiClient.get<BlockedTimeRow>(
        `${this.basePath}/${id}`,
      );
      return data ? BlockedTimeMapper.toDomain(data) : null;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar bloqueio: ${error.message}`);
    }
  }

  async findByDentist(dentistId: string): Promise<BlockedTime[]> {
    const data = await apiClient.get<BlockedTimeRow[]>(
      `${this.basePath}?dentist_id=eq.${dentistId}&end_datetime=gte.${new Date().toISOString()}&order=start_datetime.asc`,
    );
    return data.map(BlockedTimeMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockedTime[]> {
    const data = await apiClient.get<BlockedTimeRow[]>(
      `${this.basePath}?dentist_id=eq.${dentistId}&start_datetime=lt.${endDate.toISOString()}&end_datetime=gt.${startDate.toISOString()}&order=start_datetime.asc`,
    );
    return data.map(BlockedTimeMapper.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<BlockedTime[]> {
    const data = await apiClient.get<BlockedTimeRow[]>(
      `${this.basePath}?clinic_id=eq.${clinicId}&end_datetime=gte.${new Date().toISOString()}&order=start_datetime.asc`,
    );
    return data.map(BlockedTimeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
