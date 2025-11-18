/**
 * FASE 1 - SPRINT 1.3: COMPONENTE DE GESTÃO DE STATUS
 * Gerencia transições de status com validação e histórico
 */

import { useState } from 'react';
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  PatientStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  isValidStatusTransition,
  getStatusTransitionError,
} from '@/types/patient-status';

interface PatientStatusManagerProps {
  currentStatus: PatientStatus;
  patientId: string;
  patientName: string;
  onStatusChange: (newStatus: PatientStatus, reason: string) => Promise<void>;
  disabled?: boolean;
}

export function PatientStatusManager({
  currentStatus,
  patientId,
  patientName,
  onStatusChange,
  disabled = false,
}: PatientStatusManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PatientStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSelect = (status: PatientStatus) => {
    setSelectedStatus(status);
    setOpen(false);
    
    // Validar transição
    const errorMsg = getStatusTransitionError(currentStatus, status);
    setError(errorMsg);
  };

  const handleConfirm = async () => {
    if (!isValidStatusTransition(currentStatus, selectedStatus)) {
      setError(getStatusTransitionError(currentStatus, selectedStatus));
      return;
    }

    if (!reason.trim()) {
      setError('Por favor, informe o motivo da mudança de status');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onStatusChange(selectedStatus, reason);
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setReason('');
    setError(null);
  };

  const hasChanges = selectedStatus !== currentStatus;

  // Obter todas as opções de status ordenadas
  const allStatuses = Object.keys(STATUS_LABELS) as PatientStatus[];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Status do Paciente</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled || isSubmitting}
              className="w-full justify-between"
            >
              <span className={cn('px-2 py-1 rounded text-xs font-medium', STATUS_COLORS[selectedStatus])}>
                {STATUS_LABELS[selectedStatus]}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar status..." />
              <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {allStatuses.map((status) => {
                  const isValid = isValidStatusTransition(currentStatus, status);
                  return (
                    <CommandItem
                      key={status}
                      value={status}
                      onSelect={() => handleStatusSelect(status)}
                      disabled={!isValid && status !== currentStatus}
                      className={cn(!isValid && status !== currentStatus && 'opacity-50')}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedStatus === status ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', STATUS_COLORS[status])}>
                        {STATUS_LABELS[status]}
                      </span>
                      {!isValid && status !== currentStatus && (
                        <span className="ml-auto text-xs text-muted-foreground">(Transição inválida)</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {hasChanges && (
        <>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Mudança *</Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo da mudança de status..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[80px]"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Salvando...' : 'Confirmar Mudança'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </>
      )}

      <div className="text-sm text-muted-foreground">
        Paciente: <strong>{patientName}</strong>
        <br />
        Status Atual: <strong>{STATUS_LABELS[currentStatus]}</strong>
        {hasChanges && (
          <>
            <br />
            Novo Status: <strong>{STATUS_LABELS[selectedStatus]}</strong>
          </>
        )}
      </div>
    </div>
  );
}
