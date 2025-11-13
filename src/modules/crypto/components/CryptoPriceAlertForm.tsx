import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { coinLabels } from "@/modules/crypto/types/crypto.types";

const alertSchema = z.object({
  coin_type: z.string().min(1, "Selecione uma moeda"),
  target_rate_brl: z.string().min(1, "Digite a taxa alvo"),
  alert_type: z.enum(['ABOVE', 'BELOW']),
  notification_method: z.array(z.string()).min(1, "Selecione pelo menos um método"),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface CryptoPriceAlertFormProps {
  onSubmit: (data: AlertFormData) => void;
  onCancel: () => void;
}

const AVAILABLE_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC'];

export function CryptoPriceAlertForm({ onSubmit, onCancel }: CryptoPriceAlertFormProps) {
  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      coin_type: '',
      target_rate_brl: '',
      alert_type: 'BELOW',
      notification_method: ['EMAIL'],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="coin_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Criptomoeda</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AVAILABLE_COINS.map((coin) => (
                    <SelectItem key={coin} value={coin}>
                      {coinLabels[coin]}
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
          name="target_rate_brl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa Alvo (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 350000.00"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Digite o valor em Reais que deseja ser notificado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alert_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condição do Alerta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ABOVE">Quando estiver acima da taxa alvo</SelectItem>
                  <SelectItem value="BELOW">Quando estiver abaixo da taxa alvo</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Você será notificado quando a taxa atingir esta condição
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notification_method"
          render={() => (
            <FormItem>
              <FormLabel>Métodos de Notificação</FormLabel>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="notification_method"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('EMAIL')}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, 'EMAIL']);
                            } else {
                              field.onChange(value.filter((v) => v !== 'EMAIL'));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Email</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notification_method"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('WHATSAPP')}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, 'WHATSAPP']);
                            } else {
                              field.onChange(value.filter((v) => v !== 'WHATSAPP'));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">WhatsApp</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Criar Alerta
          </Button>
        </div>
      </form>
    </Form>
  );
}
