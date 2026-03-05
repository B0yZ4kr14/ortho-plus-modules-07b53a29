import { Produto } from "@/domain/entities/Produto";
import { IProdutoRepository } from "@/domain/repositories/IProdutoRepository";
import { apiClient } from "@/lib/apiClient";

/**
 * Implementação do repositório de Produto usando apiClient
 */
export class ApiProdutoRepository implements IProdutoRepository {
  async findById(id: string): Promise<Produto | null> {
    try {
      const data = await apiClient.get<Produto>(`/estoque/produtos/${id}`);
      // As the API might return the domain object directly or raw data
      // we typecast it or map it if necessary via a Mapper if backend structure differs,
      // but typically apiClient unifies this. We assume the API returns the mapped Domain type.
      return data;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findByCodigoBarras(
    codigoBarras: string,
    clinicId: string,
  ): Promise<Produto | null> {
    try {
      const data = await apiClient.get<Produto>(
        `/estoque/produtos/codigo/${codigoBarras}`,
        {
          params: { clinicId },
        },
      );
      return data;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findByClinicId(clinicId: string): Promise<Produto[]> {
    const data = await apiClient.get<Produto[]>("/estoque/produtos", {
      params: { clinicId },
    });
    return data || [];
  }

  async findActiveByClinicId(clinicId: string): Promise<Produto[]> {
    const data = await apiClient.get<Produto[]>("/estoque/produtos", {
      params: { clinicId, ativo: true },
    });
    return data || [];
  }

  async findByCategoria(
    clinicId: string,
    categoria:
      | "MATERIAL"
      | "MEDICAMENTO"
      | "EQUIPAMENTO"
      | "CONSUMIVEL"
      | "OUTRO",
  ): Promise<Produto[]> {
    const data = await apiClient.get<Produto[]>("/estoque/produtos", {
      params: { clinicId, categoria },
    });
    return data || [];
  }

  async findEstoqueBaixo(clinicId: string): Promise<Produto[]> {
    const data = await apiClient.get<Produto[]>("/estoque/produtos", {
      params: { clinicId, filter: "baixo_estoque" },
    });
    return data || [];
  }

  async findEstoqueZerado(clinicId: string): Promise<Produto[]> {
    const data = await apiClient.get<Produto[]>("/estoque/produtos", {
      params: { clinicId, filter: "zerado" },
    });
    return data || [];
  }

  async save(produto: Produto): Promise<void> {
    await apiClient.post("/estoque/produtos", produto);
  }

  async update(produto: Produto): Promise<void> {
    await apiClient.patch(`/estoque/produtos/${produto.id}`, produto);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/estoque/produtos/${id}`);
  }
}
