import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Target, Calendar, User, Phone } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { PatientFormValues } from '@/lib/patient-validation';

interface MarketingTrackingTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export function MarketingTrackingTab({ form }: MarketingTrackingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Origem do Paciente - Inteligência Comercial
        </CardTitle>
        <CardDescription>
          Rastreamento de origem para análise de ROI de campanhas e canais de captação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campanha */}
        <FormField
          control={form.control}
          name="marketing_campaign"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Campanha
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Demanda Espontânea, Black Friday 2024" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Identificação da campanha de marketing que gerou o contato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Origem (Canal) */}
        <FormField
          control={form.control}
          name="marketing_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Origem (Canal de Captação)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: tlmkt ativo, Google Ads, Instagram, Indicação" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Canal de marketing que originou o contato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Evento */}
        <FormField
          control={form.control}
          name="marketing_event"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Evento
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Ação Migração, Feira Odontológica, Webinar" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Ação específica de captação que gerou o contato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Promotor */}
        <FormField
          control={form.control}
          name="marketing_promoter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Promotor
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do responsável pela promoção" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Profissional responsável pela ação de captação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telemarketing */}
        <FormField
          control={form.control}
          name="marketing_telemarketing_agent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Operador de Telemarketing
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do operador de telemarketing" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Operador responsável pelo contato telefônico
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
