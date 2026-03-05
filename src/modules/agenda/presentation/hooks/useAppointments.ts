import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CancelAppointmentUseCase } from "../../application/useCases/CancelAppointmentUseCase";
import { ConfirmAppointmentUseCase } from "../../application/useCases/ConfirmAppointmentUseCase";
import { CreateAppointmentUseCase } from "../../application/useCases/CreateAppointmentUseCase";
import { ListAppointmentsUseCase } from "../../application/useCases/ListAppointmentsUseCase";
import { UpdateAppointmentUseCase } from "../../application/useCases/UpdateAppointmentUseCase";
import { AppointmentRepositoryApi } from "../../infrastructure/repositories/AppointmentRepositoryApi";
import { BlockedTimeRepositoryApi } from "../../infrastructure/repositories/BlockedTimeRepositoryApi";

const appointmentRepo = new AppointmentRepositoryApi();
const blockedTimeRepo = new BlockedTimeRepositoryApi();

export function useAppointments(filters?: {
  clinicId?: string;
  dentistId?: string;
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: appointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments", filters],
    queryFn: async () => {
      const useCase = new ListAppointmentsUseCase(appointmentRepo);
      return await useCase.execute(filters || {});
    },
    enabled: !!filters,
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      clinicId: string;
      patientId: string;
      dentistId: string;
      scheduledDatetime: Date;
      durationMinutes: number;
      appointmentType: string;
      notes?: string;
    }) => {
      const useCase = new CreateAppointmentUseCase(
        appointmentRepo,
        blockedTimeRepo,
      );
      return await useCase.execute({
        ...input,
        createdBy: user?.id || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: {
      appointmentId: string;
      scheduledDatetime?: Date;
      notes?: string;
    }) => {
      const useCase = new UpdateAppointmentUseCase(
        appointmentRepo,
        blockedTimeRepo,
      );
      return await useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (input: { appointmentId: string; reason?: string }) => {
      const useCase = new CancelAppointmentUseCase(appointmentRepo);
      return await useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento cancelado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const useCase = new ConfirmAppointmentUseCase(appointmentRepo);
      return await useCase.execute({ appointmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento confirmado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    appointments: appointments || [],
    isLoading,
    error,
    createAppointment: createMutation.mutate,
    updateAppointment: updateMutation.mutate,
    cancelAppointment: cancelMutation.mutate,
    confirmAppointment: confirmMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isConfirming: confirmMutation.isPending,
  };
}
