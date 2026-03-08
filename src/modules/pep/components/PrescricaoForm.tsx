import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const medicamentoSchema = z.object({
  nome: z.string().min(1, 'Nome do medicamento obrigatório'),
  dosagem: z.string().min(1, 'Dosagem obrigatória'),
  via: z.enum(['oral', 'sublingual', 'topica', 'injetavel']),
  frequencia: z.string().min(1, 'Frequência obrigatória'),
  duracao: z.string().min(1, 'Duração obrigatória'),
  observacoes: z.string().optional(),
});

const prescricaoSchema = z.object({
  pacienteNome: z.string().min(1, 'Nome do paciente obrigatório'),
  cid: z.string().optional(),
  diagnostico: z.string().min(1, 'Diagnóstico obrigatório'),
  medicamentos: z.array(medicamentoSchema).min(1, 'Adicione pelo menos um medicamento'),
  observacoesGerais: z.string().optional(),
});

type PrescricaoFormData = z.infer<typeof prescricaoSchema>;
type MedicamentoFormData = z.infer<typeof medicamentoSchema>;

interface PrescricaoFormProps {
  prontuarioId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrescricaoForm({ prontuarioId, onSuccess, onCancel }: PrescricaoFormProps) {
  const [medicamentos, setMedicamentos] = useState<MedicamentoFormData[]>([]);
  const [currentMed, setCurrentMed] = useState<Partial<MedicamentoFormData>>({
    via: 'oral',
  });

  const { register, handleSubmit, formState: { errors } } = useForm<PrescricaoFormData>({
    resolver: zodResolver(prescricaoSchema),
  });

  const addMedicamento = () => {
    if (!currentMed.nome || !currentMed.dosagem || !currentMed.frequencia || !currentMed.duracao) {
      toast.error('Preencha todos os campos obrigatórios do medicamento');
      return;
    }

    setMedicamentos([...medicamentos, currentMed as MedicamentoFormData]);
    setCurrentMed({ via: 'oral' });
    toast.success('Medicamento adicionado');
  };

  const removeMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PrescricaoFormData) => {
    if (medicamentos.length === 0) {
      toast.error('Adicione pelo menos um medicamento');
      return;
    }

    const prescricao = {
      ...data,
      medicamentos,
      prontuarioId,
      dataPrescricao: new Date().toISOString(),
    };

    toast.success('Prescrição criada com sucesso!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pacienteNome">Nome do Paciente</Label>
          <Input id="pacienteNome" {...register('pacienteNome')} />
          {errors.pacienteNome && (
            <p className="text-sm text-destructive">{errors.pacienteNome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cid">CID (Opcional)</Label>
          <Input id="cid" {...register('cid')} placeholder="Ex: K02.1" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnostico">Diagnóstico</Label>
        <Textarea id="diagnostico" {...register('diagnostico')} rows={3} />
        {errors.diagnostico && (
          <p className="text-sm text-destructive">{errors.diagnostico.message}</p>
        )}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Medicamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome do Medicamento</Label>
            <Input
              value={currentMed.nome || ''}
              onChange={(e) => setCurrentMed({ ...currentMed, nome: e.target.value })}
              placeholder="Ex: Amoxicilina"
            />
          </div>

          <div className="space-y-2">
            <Label>Dosagem</Label>
            <Input
              value={currentMed.dosagem || ''}
              onChange={(e) => setCurrentMed({ ...currentMed, dosagem: e.target.value })}
              placeholder="Ex: 500mg"
            />
          </div>

          <div className="space-y-2">
            <Label>Via de Administração</Label>
            <Select
              value={currentMed.via || 'oral'}
              onValueChange={(value) => setCurrentMed({ ...currentMed, via: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="sublingual">Sublingual</SelectItem>
                <SelectItem value="topica">Tópica</SelectItem>
                <SelectItem value="injetavel">Injetável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Frequência</Label>
            <Input
              value={currentMed.frequencia || ''}
              onChange={(e) => setCurrentMed({ ...currentMed, frequencia: e.target.value })}
              placeholder="Ex: 8/8 horas"
            />
          </div>

          <div className="space-y-2">
            <Label>Duração</Label>
            <Input
              value={currentMed.duracao || ''}
              onChange={(e) => setCurrentMed({ ...currentMed, duracao: e.target.value })}
              placeholder="Ex: 7 dias"
            />
          </div>

          <div className="space-y-2">
            <Label>Observações (Opcional)</Label>
            <Input
              value={currentMed.observacoes || ''}
              onChange={(e) => setCurrentMed({ ...currentMed, observacoes: e.target.value })}
              placeholder="Ex: Tomar com alimentos"
            />
          </div>
        </div>

        <Button type="button" onClick={addMedicamento} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicamento à Lista
        </Button>
      </div>

      {medicamentos.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Medicamentos Adicionados ({medicamentos.length})</h3>
          <div className="space-y-2">
            {medicamentos.map((med, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <p className="font-medium">{med.nome} - {med.dosagem}</p>
                  <p className="text-sm text-muted-foreground">
                    Via {med.via} | {med.frequencia} | {med.duracao}
                  </p>
                  {med.observacoes && (
                    <p className="text-sm text-muted-foreground italic">{med.observacoes}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedicamento(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="observacoesGerais">Observações Gerais (Opcional)</Label>
        <Textarea id="observacoesGerais" {...register('observacoesGerais')} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Prescrição</Button>
      </div>
    </form>
  );
}
