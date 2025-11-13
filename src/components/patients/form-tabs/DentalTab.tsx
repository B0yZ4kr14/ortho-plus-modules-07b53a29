import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { UseFormReturn } from 'react-hook-form';
import { PatientFormValues } from '@/lib/patient-validation';
import { Card } from '@/components/ui/card';

interface DentalTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export function DentalTab({ form }: DentalTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="main_complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Queixa Principal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o motivo principal da consulta..."
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pain_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Dor (0-10)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value || 0]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sem dor</span>
                    <span className="font-bold">{field.value || 0}</span>
                    <span>Dor máxima</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="oral_hygiene_quality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualidade da Higiene Oral</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="boa">Boa</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gum_condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condição Gengival</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="saudavel">Saudável</SelectItem>
                  <SelectItem value="leve_inflamacao">Leve Inflamação</SelectItem>
                  <SelectItem value="gengivite">Gengivite</SelectItem>
                  <SelectItem value="periodontite">Periodontite</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clinical_observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Clínicas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações gerais sobre a condição odontológica do paciente..."
                  className="min-h-[120px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}
