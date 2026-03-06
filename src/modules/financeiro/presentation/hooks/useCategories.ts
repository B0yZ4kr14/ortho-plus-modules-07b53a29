import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { CreateCategoryUseCase } from "../../application/use-cases/CreateCategoryUseCase";
import { Category, CategoryType } from "../../domain/entities/Category";
import { ApiCategoryRepository } from "../../infrastructure/repositories/ApiCategoryRepository";

const repository = new ApiCategoryRepository();
const createUseCase = new CreateCategoryUseCase(repository);

export function useCategories(type?: CategoryType) {
  const { clinicId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await repository.findByClinic(clinicId, {
        type,
        isActive: true,
      });
      setCategories(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao carregar categorias"),
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId, type]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(
    async (data: {
      name: string;
      type: CategoryType;
      color?: string;
      icon?: string;
      description?: string;
    }) => {
      if (!clinicId) {
        throw new Error("Usuário não autenticado");
      }

      await createUseCase.execute({
        ...data,
        clinicId,
      });

      await loadCategories();
    },
    [clinicId, loadCategories],
  );

  return {
    categories,
    loading,
    error,
    createCategory,
    loadCategories,
  };
}
