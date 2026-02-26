import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cryptoWalletSchema, coinLabels } from '@/modules/crypto/types/crypto.types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface WalletFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  exchanges?: any[];
}

export function WalletForm({ onSubmit, onCancel, initialData, exchanges = [] }: WalletFormProps) {
  const form = useForm({
    resolver: zodResolver(cryptoWalletSchema),
    defaultValues: initialData || {
      wallet_name: '',
      coin_type: 'BTC',
      wallet_address: '',
      is_active: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="wallet_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Carteira</FormLabel>
              <FormControl>
                <Input placeholder="Carteira Principal BTC" {...field} />
              </FormControl>
              <FormDescription>
                Nome descritivo para identificar esta carteira
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coin_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Moeda</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(coinLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label} ({key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Tipo de criptomoeda desta carteira
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wallet_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço da Carteira</FormLabel>
              <FormControl>
                <Input 
                  placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" 
                  {...field} 
                  className="font-mono text-sm"
                />
              </FormControl>
              <FormDescription>
                Endereço público da carteira para receber pagamentos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {exchanges.length > 0 && (
          <FormField
            control={form.control}
            name="exchange_config_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Vinculada (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma exchange" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {exchanges.map((exchange) => (
                      <SelectItem key={exchange.id} value={exchange.id}>
                        {exchange.exchange_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Vincular a uma exchange para sincronização automática
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Carteira Ativa
                </FormLabel>
                <FormDescription>
                  Ativar esta carteira para receber pagamentos
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Carteira
          </Button>
        </div>
      </form>
    </Form>
  );
}
