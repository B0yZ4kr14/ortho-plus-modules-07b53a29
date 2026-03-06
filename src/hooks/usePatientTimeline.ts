import { apiClient } from "@/lib/api/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface TimelineEvent {
  id: string;
  type: "appointment" | "treatment" | "budget" | "status_change";
  title: string;
  description: string;
  date: string;
  icon: string;
}

export function usePatientTimeline(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-timeline", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("Patient ID is required");

      const data = await apiClient.get<{ timeline: TimelineEvent[] }>(
        `/pacientes/${patientId}/timeline`,
      );
      return data.timeline;
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
