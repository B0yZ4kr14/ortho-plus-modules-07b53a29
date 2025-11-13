import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { PatientFormValues } from '@/lib/patient-validation';
import { Card } from '@/components/ui/card';

interface MedicalHistoryTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export function MedicalHistoryTab({ form }: MedicalHistoryTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="has_systemic_disease"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Possui doença sistêmica?</FormLabel>
                  <FormDescription>Hipertensão, diabetes, cardiopatias, etc.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_cardiovascular_disease"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Doença cardiovascular?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {form.watch('has_cardiovascular_disease') && (
          <FormField
            control={form.control}
            name="cardiovascular_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalhes da doença cardiovascular</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva a condição..." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="has_diabetes"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Diabetes?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('has_diabetes') && (
            <>
              <FormField
                control={form.control}
                name="diabetes_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Diabetes</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tipo1">Tipo 1</SelectItem>
                        <SelectItem value="tipo2">Tipo 2</SelectItem>
                        <SelectItem value="gestacional">Gestacional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diabetes_controlled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Controlada?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="has_hypertension"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Hipertensão?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('has_hypertension') && (
            <FormField
              control={form.control}
              name="hypertension_controlled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Controlada?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="has_allergies"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Possui alergias?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_medication_allergy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Alergia a medicamentos?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="has_bleeding_disorder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Distúrbio de coagulação?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('has_bleeding_disorder') && (
            <FormField
              control={form.control}
              name="bleeding_disorder_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Hemofilia" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="is_pregnant"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Grávida?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('is_pregnant') && (
            <FormField
              control={form.control}
              name="pregnancy_trimester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trimestre</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1º Trimestre</SelectItem>
                      <SelectItem value="2">2º Trimestre</SelectItem>
                      <SelectItem value="3">3º Trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="is_breastfeeding"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Amamentando?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="has_hepatitis"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Hepatite?</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('has_hepatitis') && (
            <FormField
              control={form.control}
              name="hepatitis_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">Hepatite A</SelectItem>
                      <SelectItem value="B">Hepatite B</SelectItem>
                      <SelectItem value="C">Hepatite C</SelectItem>
                      <SelectItem value="D">Hepatite D</SelectItem>
                      <SelectItem value="E">Hepatite E</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="has_hiv"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>HIV+?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </Card>
  );
}
