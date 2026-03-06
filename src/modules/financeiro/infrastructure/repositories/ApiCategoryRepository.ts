import { apiClient } from "@/lib/api/apiClient";
import {
  Category,
  CategoryProps,
  CategoryType,
} from "../../domain/entities/Category";
import {
  CategoryFilters,
  ICategoryRepository,
} from "../../domain/repositories/ICategoryRepository";

export class ApiCategoryRepository implements ICategoryRepository {
  private readonly baseUrl = "/rest/v1/financial_categories";

  async findById(id: string): Promise<Category | null> {
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
    filters?: CategoryFilters,
  ): Promise<Category[]> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);

      if (filters?.type) {
        params.append("type", `eq.${filters.type}`);
      }

      if (filters?.isActive !== undefined) {
        params.append("is_active", `eq.${filters.isActive}`);
      }

      params.append("order", "name.asc");

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      return (data || []).map((row) => this.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(category: Category): Promise<void> {
    const data = this.toDatabase(category);
    await apiClient.post(this.baseUrl, data);
  }

  async update(category: Category): Promise<void> {
    const data = this.toDatabase(category);
    await apiClient.patch(`${this.baseUrl}?id=eq.${category.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}?id=eq.${id}`);
  }

  async findByName(
    clinicId: string,
    name: string,
    type: CategoryType,
  ): Promise<Category | null> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);
      params.append("name", `eq.${name}`);
      params.append("type", `eq.${type}`);
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

  private toDomain(row: any): Category {
    const props: CategoryProps = {
      id: row.id,
      clinicId: row.clinic_id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      description: row.description,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Category(props);
  }

  private toDatabase(category: Category): any {
    return {
      id: category.id,
      clinic_id: category.clinicId,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      description: category.description,
      is_active: category.isActive,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
    };
  }
}
