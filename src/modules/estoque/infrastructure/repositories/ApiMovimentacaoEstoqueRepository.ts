import { MovimentacaoEstoque } from "@/domain/entities/MovimentacaoEstoque";
import { IMovimentacaoEstoqueRepository } from "@/domain/repositories/IMovimentacaoEstoqueRepository";
import { apiClient } from "@/lib/api/apiClient";

/**
 * Implementação do repositório de MovimentacaoEstoque usando apiClient
 */
export class ApiMovimentacaoEstoqueRepository implements IMovimentacaoEstoqueRepository {
  async findById(id: string): Promise<MovimentacaoEstoque | null> {
    try {
      const data = await apiClient.get<MovimentacaoEstoque>(
        `/estoque/movimentacoes/${id}`,
      );
      return data;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findByProdutoId(produtoId: string): Promise<MovimentacaoEstoque[]> {
    const data = await apiClient.get<MovimentacaoEstoque[]>(
      "/estoque/movimentacoes",
      {
        params: { produtoId },
      },
    );
    return data || [];
  }

  async findByProdutoAndDateRange(
    produtoId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MovimentacaoEstoque[]> {
    const data = await apiClient.get<MovimentacaoEstoque[]>(
      "/estoque/movimentacoes",
      {
        params: {
          produtoId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
    );
    return data || [];
  }

  async findByClinicId(clinicId: string): Promise<MovimentacaoEstoque[]> {
    const data = await apiClient.get<MovimentacaoEstoque[]>(
      "/estoque/movimentacoes",
      {
        params: { clinicId },
      },
    );
    return data || [];
  }

  async findByTipo(
    clinicId: string,
    tipo: "ENTRADA" | "SAIDA" | "AJUSTE",
  ): Promise<MovimentacaoEstoque[]> {
    const data = await apiClient.get<MovimentacaoEstoque[]>(
      "/estoque/movimentacoes",
      {
        params: { clinicId, tipo },
      },
    );
    return data || [];
  }

  async findByUsuarioId(usuarioId: string): Promise<MovimentacaoEstoque[]> {
    const data = await apiClient.get<MovimentacaoEstoque[]>(
      "/estoque/movimentacoes",
      {
        params: { usuarioId },
      },
    );
    return data || [];
  }

  async save(movimentacao: MovimentacaoEstoque): Promise<void> {
    await apiClient.post("/estoque/movimentacoes", movimentacao);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/estoque/movimentacoes/${id}`);
  }
}
