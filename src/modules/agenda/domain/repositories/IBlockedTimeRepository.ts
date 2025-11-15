import { BlockedTime } from '../entities/BlockedTime';

export interface IBlockedTimeRepository {
  save(blockedTime: BlockedTime): Promise<BlockedTime>;
  findById(id: string): Promise<BlockedTime | null>;
  findByDentist(dentistId: string): Promise<BlockedTime[]>;
  findByDentistAndDateRange(dentistId: string, startDate: Date, endDate: Date): Promise<BlockedTime[]>;
  findByClinicId(clinicId: string): Promise<BlockedTime[]>;
  delete(id: string): Promise<void>;
}
