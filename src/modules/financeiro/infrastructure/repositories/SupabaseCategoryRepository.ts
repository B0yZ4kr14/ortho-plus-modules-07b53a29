import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryProps, CategoryType } from '../../domain/entities/Category';
import { ICategoryRepository, CategoryFilters } from '../../domain/repositories/ICategoryRepository';

export class SupabaseCategoryRepository implements ICategoryRepository {
  private readonly tableName = 'financial_categories';

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByClinic(clinicId: string, filters?: CategoryFilters): Promise<Category[]> {
    let query = (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async save(category: Category): Promise<void> {
    const data = this.toDatabase(category);
    const { error } = await (supabase as any).from(this.tableName).insert(data);
    
    if (error) {
      throw new Error(`Erro ao salvar categoria: ${error.message}`);
    }
  }

  async update(category: Category): Promise<void> {
    const data = this.toDatabase(category);
    const { error } = await (supabase as any)
      .from(this.tableName)
      .update(data)
      .eq('id', category.id);

    if (error) {
      throw new Error(`Erro ao atualizar categoria: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar categoria: ${error.message}`);
    }
  }

  async findByName(clinicId: string, name: string, type: CategoryType): Promise<Category | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('name', name)
      .eq('type', type)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
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
