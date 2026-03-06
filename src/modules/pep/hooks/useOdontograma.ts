import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ALL_TEETH,
  OdontogramaHistoryEntry,
  ToothData,
  ToothStatus,
  ToothSurface,
} from "../types/odontograma.types";

const createInitialToothData = (number: number): ToothData => ({
  number,
  status: "higido",
  surfaces: {
    mesial: "higido",
    distal: "higido",
    oclusal: "higido",
    vestibular: "higido",
    lingual: "higido",
  },
  updatedAt: new Date().toISOString(),
});

export const useOdontograma = (prontuarioId: string) => {
  const [teethData, setTeethData] = useState<Record<number, ToothData>>({});
  const [history, setHistory] = useState<OdontogramaHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Carregar dados do prontuário específico do Supabase (via apiClient)
  const loadData = useCallback(async () => {
    if (!prontuarioId) {
      // Inicializar com todos os dentes hígidos se não houver prontuarioId
      const processedTeeth: Record<number, ToothData> = {};
      ALL_TEETH.forEach((num) => {
        processedTeeth[num] = createInitialToothData(num);
      });
      setTeethData(processedTeeth);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Buscar dados do odontograma
      const odontogramaData = await apiClient.get<any[]>(
        `/rest/v1/pep_odontograma_data?prontuario_id=eq.${prontuarioId}&select=*,pep_tooth_surfaces(*)`,
      );

      // Buscar histórico
      const historyData = await apiClient.get<any[]>(
        `/rest/v1/pep_odontograma_history?prontuario_id=eq.${prontuarioId}&order=created_at.desc`,
      );

      // Processar dados dos dentes
      const processedTeeth: Record<number, ToothData> = {};

      if (odontogramaData && odontogramaData.length > 0) {
        odontogramaData.forEach((tooth: any) => {
          const surfaces: any = {
            mesial: "higido",
            distal: "higido",
            oclusal: "higido",
            vestibular: "higido",
            lingual: "higido",
          };

          if (tooth.pep_tooth_surfaces) {
            tooth.pep_tooth_surfaces.forEach((surface: any) => {
              surfaces[surface.surface] = surface.status;
            });
          }

          processedTeeth[tooth.tooth_number] = {
            number: tooth.tooth_number,
            status: tooth.status,
            notes: tooth.notes,
            surfaces,
            updatedAt: tooth.updated_at,
          };
        });
      } else {
        // Inicializar com todos os dentes hígidos se não houver dados
        ALL_TEETH.forEach((num) => {
          processedTeeth[num] = createInitialToothData(num);
        });
      }

      setTeethData(processedTeeth);

      // Processar histórico
      if (historyData) {
        const processedHistory: OdontogramaHistoryEntry[] = historyData.map(
          (entry: any) => ({
            id: entry.id,
            timestamp: entry.created_at,
            teeth: entry.snapshot_data,
            changedTeeth: entry.changed_teeth || [],
            description: entry.description,
          }),
        );
        setHistory(processedHistory);
      }
    } catch (error: any) {
      console.error("Erro ao carregar odontograma:", error);
      toast.error("Erro ao carregar dados do odontograma");
    } finally {
      setIsLoading(false);
    }
  }, [prontuarioId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adicionar entrada ao histórico
  const addHistoryEntry = useCallback(
    async (changedTeeth: number[], description?: string) => {
      try {
        if (!user) throw new Error("Usuário não autenticado");

        await apiClient.post("/rest/v1/pep_odontograma_history", {
          prontuario_id: prontuarioId,
          snapshot_data: teethData as any,
          changed_teeth: changedTeeth,
          description: description || null,
          created_by: user.id,
        });

        // Recarregar histórico
        await loadData();
      } catch (error: any) {
        console.error("Erro ao adicionar ao histórico:", error);
        toast.error("Erro ao salvar histórico");
      }
    },
    [prontuarioId, teethData, loadData, user],
  );

  // Atualizar status geral de um dente
  const updateToothStatus = useCallback(
    async (toothNumber: number, status: ToothStatus, addToHistory = true) => {
      try {
        if (!user) throw new Error("Usuário não autenticado");

        // Verificar se o dente já existe
        const existingData = await apiClient.get<any[]>(
          `/rest/v1/pep_odontograma_data?prontuario_id=eq.${prontuarioId}&tooth_number=eq.${toothNumber}&select=id`,
        );

        const existing =
          existingData && existingData.length > 0 ? existingData[0] : null;

        if (existing) {
          // Atualizar
          await apiClient.patch(
            `/rest/v1/pep_odontograma_data?id=eq.${existing.id}`,
            {
              status,
              updated_by: user.id,
              updated_at: new Date().toISOString(),
            },
          );
        } else {
          // Inserir
          await apiClient.post(`/rest/v1/pep_odontograma_data`, {
            prontuario_id: prontuarioId,
            tooth_number: toothNumber,
            status,
            created_by: user.id,
          });
        }

        // Atualizar estado local
        setTeethData((prev) => ({
          ...prev,
          [toothNumber]: {
            ...prev[toothNumber],
            status,
            updatedAt: new Date().toISOString(),
          },
        }));

        if (addToHistory) {
          await addHistoryEntry(
            [toothNumber],
            `Dente ${toothNumber} marcado como ${status}`,
          );
        }

        toast.success("Dente atualizado com sucesso");
      } catch (error: any) {
        console.error("Erro ao atualizar dente:", error);
        toast.error("Erro ao atualizar dente");
      }
    },
    [prontuarioId, addHistoryEntry, user],
  );

  // Atualizar status de uma face específica
  const updateToothSurface = useCallback(
    async (
      toothNumber: number,
      surface: ToothSurface,
      status: ToothStatus,
      addToHistory = true,
    ) => {
      try {
        if (!user) throw new Error("Usuário não autenticado");

        // Buscar ou criar registro do dente
        const existingToothData = await apiClient.get<any[]>(
          `/rest/v1/pep_odontograma_data?prontuario_id=eq.${prontuarioId}&tooth_number=eq.${toothNumber}&select=id`,
        );

        let toothData =
          existingToothData && existingToothData.length > 0
            ? existingToothData[0]
            : null;

        if (!toothData) {
          const insertedData = await apiClient.post<any[]>(
            `/rest/v1/pep_odontograma_data`,
            {
              prontuario_id: prontuarioId,
              tooth_number: toothNumber,
              status: "higido",
              created_by: user.id,
            },
            { headers: { Prefer: "return=representation" } },
          );
          toothData =
            insertedData && insertedData.length > 0 ? insertedData[0] : null;
        }

        if (!toothData?.id) throw new Error("Falha ao obter ID do dente.");

        // Atualizar ou inserir superfície
        const existingSurfaceData = await apiClient.get<any[]>(
          `/rest/v1/pep_tooth_surfaces?odontograma_data_id=eq.${toothData.id}&surface=eq.${surface}&select=id`,
        );
        const existingSurface =
          existingSurfaceData && existingSurfaceData.length > 0
            ? existingSurfaceData[0]
            : null;

        if (existingSurface) {
          await apiClient.patch(
            `/rest/v1/pep_tooth_surfaces?id=eq.${existingSurface.id}`,
            { status },
          );
        } else {
          await apiClient.post(`/rest/v1/pep_tooth_surfaces`, {
            odontograma_data_id: toothData.id,
            surface,
            status,
          });
        }

        // Atualizar estado local
        setTeethData((prev) => ({
          ...prev,
          [toothNumber]: {
            ...prev[toothNumber],
            surfaces: {
              ...prev[toothNumber].surfaces,
              [surface]: status,
            },
            updatedAt: new Date().toISOString(),
          },
        }));

        if (addToHistory) {
          await addHistoryEntry(
            [toothNumber],
            `Face ${surface} do dente ${toothNumber} marcada como ${status}`,
          );
        }

        toast.success("Superfície atualizada com sucesso");
      } catch (error: any) {
        console.error("Erro ao atualizar superfície:", error);
        toast.error("Erro ao atualizar superfície");
      }
    },
    [prontuarioId, addHistoryEntry, user],
  );

  // Atualizar notas de um dente
  const updateToothNotes = useCallback(
    async (toothNumber: number, notes: string) => {
      try {
        const existingToothData = await apiClient.get<any[]>(
          `/rest/v1/pep_odontograma_data?prontuario_id=eq.${prontuarioId}&tooth_number=eq.${toothNumber}&select=id`,
        );

        const toothData =
          existingToothData && existingToothData.length > 0
            ? existingToothData[0]
            : null;

        if (!toothData) {
          toast.error(
            "Dente não encontrado para adicionar nota. Altere o status dele primeiro.",
          );
          return;
        }

        await apiClient.patch(
          `/rest/v1/pep_odontograma_data?id=eq.${toothData.id}`,
          { notes },
        );

        setTeethData((prev) => ({
          ...prev,
          [toothNumber]: {
            ...prev[toothNumber],
            notes,
            updatedAt: new Date().toISOString(),
          },
        }));

        toast.success("Notas atualizadas");
      } catch (error: any) {
        console.error("Erro ao atualizar notas:", error);
        toast.error("Erro ao atualizar notas");
      }
    },
    [prontuarioId],
  );

  // Restaurar odontograma de uma entrada do histórico
  const restoreFromHistory = useCallback(
    async (historyId: string) => {
      const entry = history.find((h) => h.id === historyId);
      if (entry) {
        setTeethData(JSON.parse(JSON.stringify(entry.teeth)));
        await addHistoryEntry([], "Odontograma restaurado do histórico");
        toast.success("Odontograma restaurado");
      }
    },
    [history, addHistoryEntry],
  );

  // Resetar odontograma
  const resetOdontograma = useCallback(async () => {
    try {
      // Deletar todos os dentes do prontuário
      await apiClient.delete(
        `/rest/v1/pep_odontograma_data?prontuario_id=eq.${prontuarioId}`,
      );

      const resetData: Record<number, ToothData> = {};
      ALL_TEETH.forEach((num) => {
        resetData[num] = createInitialToothData(num);
      });

      setTeethData(resetData);
      await addHistoryEntry(ALL_TEETH, "Odontograma resetado");
      toast.success("Odontograma resetado");
    } catch (error: any) {
      console.error("Erro ao resetar:", error);
      toast.error("Erro ao resetar odontograma");
    }
  }, [prontuarioId, addHistoryEntry]);

  // Obter estatísticas
  const getStatusCount = useCallback(
    (status: ToothStatus) => {
      return Object.values(teethData).filter((t) => t.status === status).length;
    },
    [teethData],
  );

  // Comparar dois estados do odontograma
  const compareStates = useCallback(
    (historyId1: string, historyId2: string) => {
      const state1 = history.find((h) => h.id === historyId1);
      const state2 = history.find((h) => h.id === historyId2);

      if (!state1 || !state2) return [];

      const changes: number[] = [];
      ALL_TEETH.forEach((num) => {
        const tooth1 = state1.teeth[num];
        const tooth2 = state2.teeth[num];

        if (
          tooth1?.status !== tooth2?.status ||
          JSON.stringify(tooth1?.surfaces) !== JSON.stringify(tooth2?.surfaces)
        ) {
          changes.push(num);
        }
      });

      return changes;
    },
    [history],
  );

  return {
    teethData,
    history,
    isLoading,
    updateToothStatus,
    updateToothSurface,
    updateToothNotes,
    resetOdontograma,
    restoreFromHistory,
    getStatusCount,
    compareStates,
    refreshData: loadData,
  };
};
