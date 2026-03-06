import { apiClient } from "@/lib/api/apiClient";
import {
  CashRegister,
  CashRegisterProps,
} from "../../domain/entities/CashRegister";
import {
  CashRegisterFilters,
  ICashRegisterRepository,
} from "../../domain/repositories/ICashRegisterRepository";
import { Money } from "../../domain/valueObjects/Money";

export class ApiCashRegisterRepository implements ICashRegisterRepository {
  private readonly baseUrl = "/rest/v1/cash_registers";

  async findById(id: string): Promise<CashRegister | null> {
    try {
      const data = await apiClient.get<any[]>(`${this.baseUrl}?id=eq.${id}`);
      if (!data || data.length === 0) return null;
      return this.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinic(
    clinicId: string,
    filters?: CashRegisterFilters,
  ): Promise<CashRegister[]> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);

      if (filters?.status) params.append("status", `eq.${filters.status}`);
      if (filters?.openedBy)
        params.append("opened_by", `eq.${filters.openedBy}`);

      if (filters?.period) {
        params.append(
          "opened_at",
          `gte.${filters.period.startDate.toISOString()}`,
        );
        params.append(
          "opened_at",
          `lte.${filters.period.endDate.toISOString()}`,
        );
      }

      params.append("order", "opened_at.desc");

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      return (data || []).map((row) => this.toDomain(row));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async save(cashRegister: CashRegister): Promise<void> {
    const data = this.toDatabase(cashRegister);
    await apiClient.post(this.baseUrl, data);
  }

  async update(cashRegister: CashRegister): Promise<void> {
    const data = this.toDatabase(cashRegister);
    await apiClient.patch(`${this.baseUrl}?id=eq.${cashRegister.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}?id=eq.${id}`);
  }

  async findOpenRegister(clinicId: string): Promise<CashRegister | null> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);
      params.append("status", `eq.ABERTO`);
      params.append("order", "opened_at.desc");
      params.append("limit", "1");

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      if (!data || data.length === 0) return null;
      return this.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async getLastClosedRegister(clinicId: string): Promise<CashRegister | null> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);
      params.append("status", `eq.FECHADO`);
      params.append("order", "closed_at.desc");
      params.append("limit", "1");

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      if (!data || data.length === 0) return null;
      return this.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  private toDomain(row: any): CashRegister {
    const props: CashRegisterProps = {
      id: row.id,
      clinicId: row.clinic_id,
      openedBy: row.opened_by,
      openedAt: new Date(row.opened_at),
      closedBy: row.closed_by,
      closedAt: row.closed_at ? new Date(row.closed_at) : undefined,
      initialAmount: Money.fromNumber(
        row.initial_amount,
        row.currency || "BRL",
      ),
      finalAmount: row.final_amount
        ? Money.fromNumber(row.final_amount, row.currency || "BRL")
        : undefined,
      expectedAmount: row.expected_amount
        ? Money.fromNumber(row.expected_amount, row.currency || "BRL")
        : undefined,
      difference: row.difference
        ? Money.fromNumber(row.difference, row.currency || "BRL")
        : undefined,
      status: row.status,
      notes: row.notes,
    };

    return new CashRegister(props);
  }

  private toDatabase(cashRegister: CashRegister): any {
    return {
      id: cashRegister.id,
      clinic_id: cashRegister.clinicId,
      opened_by: cashRegister.openedBy,
      opened_at: cashRegister.openedAt.toISOString(),
      closed_by: cashRegister.closedBy,
      closed_at: cashRegister.closedAt?.toISOString(),
      initial_amount: cashRegister.initialAmount.toNumber(),
      final_amount: cashRegister.finalAmount?.toNumber(),
      expected_amount: cashRegister.expectedAmount?.toNumber(),
      difference: cashRegister.difference?.toNumber(),
      currency: cashRegister.initialAmount.currency,
      status: cashRegister.status,
      notes: cashRegister.notes,
    };
  }
}
