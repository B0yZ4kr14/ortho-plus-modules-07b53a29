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
  private readonly baseUrl = "/financeiro/categories";

  async findById(id: string): Promise<Category | null> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/${id}`);
      if (!data) return null;
      return this.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByClinic(
    clinicId: string,
    filters?: CategoryFilters,
  ): Promise<Category[]> {
    try {
      const params: Record<string, string> = {};
      if (filters?.type) params.type = filters.type;
      if (filters?.isActive !== undefined) params.is_active = String(filters.isActive);

      const data = await apiClient.get<any[]>(this.baseUrl, { params });
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
    await apiClient.patch(`${this.baseUrl}/${category.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async findByName(
    clinicId: string,
    name: string,
    type: CategoryType,
  ): Promise<Category | null> {
    try {
      const data = await apiClient.get<any[]>(this.baseUrl, {
        params: { name, type },
      });
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
