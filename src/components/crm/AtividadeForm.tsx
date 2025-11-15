import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AtividadeTipo } from '@/modules/crm/domain/entities/Atividade';

const atividadeSchema = z.object({
  tipo: z.enum(['LIGACAO', 'EMAIL', 'REUNIAO', 'WHATSAPP', 'VISITA', 'OUTRO']),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  dataAgendada: z.string().optional(),
});

type AtividadeFormData = z.infer<typeof atividadeSchema>;

interface AtividadeFormProps {
  onSubmit: (data: AtividadeFormData) => void;
  onCancel: () => void;
}

const tipoLabels: Record<AtividadeTipo, string> = {
  LIGACAO: 'Ligação',
  EMAIL: 'E-mail',
  REUNIAO: 'Reunião',
  WHATSAPP: 'WhatsApp',
  VISITA: 'Visita',
  OUTRO: 'Outro',
};

export function AtividadeForm({ onSubmit, onCancel }: AtividadeFormProps) {
  const form = useForm<AtividadeFormData>({
    resolver: zodResolver(atividadeSchema),
    defaultValues: {
      tipo: 'LIGACAO',
      titulo: '',
      descricao: '',
      dataAgendada: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Atividade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ligação de follow-up" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes da atividade..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataAgendada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora Agendada (opcional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Criar Atividade</Button>
        </div>
      </form>
    </Form>
  );
}
