// @ts-nocheck
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { exchangeConfigSchema, exchangeLabels } from '@/modules/crypto/types/crypto.types';
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ExchangeConfigFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

const AVAILABLE_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC'];

export function ExchangeConfigForm({ onSubmit, onCancel, initialData }: ExchangeConfigFormProps) {
  const form = useForm({
    resolver: zodResolver(exchangeConfigSchema),
    defaultValues: initialData || {
      exchange_name: 'BINANCE',
      is_active: true,
      supported_coins: ['BTC'],
      auto_convert_to_brl: false,
      conversion_threshold: 0,
    },
  });

  const [selectedCoins, setSelectedCoins] = React.useState<string[]>(
    initialData?.supported_coins || ['BTC']
  );

  const handleAddCoin = (coin: string) => {
    if (!selectedCoins.includes(coin)) {
      const newCoins = [...selectedCoins, coin];
      setSelectedCoins(newCoins);
      form.setValue('supported_coins', newCoins);
    }
  };

  const handleRemoveCoin = (coin: string) => {
    const newCoins = selectedCoins.filter(c => c !== coin);
    setSelectedCoins(newCoins);
    form.setValue('supported_coins', newCoins);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="exchange_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exchange</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma exchange" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(exchangeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Escolha a exchange que será integrada
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
              <FormLabel>Endereço da Carteira Principal (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Endereço da carteira para recebimentos diretos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="api_key_encrypted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Sua API Key da exchange" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Para sincronização automática de saldos e conversões
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Moedas Suportadas</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCoins.map((coin) => (
              <Badge key={coin} variant="default" className="gap-1">
                {coin}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveCoin(coin)}
                />
              </Badge>
            ))}
          </div>
          <Select onValueChange={handleAddCoin}>
            <SelectTrigger>
              <SelectValue placeholder="Adicionar moeda" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_COINS.filter(coin => !selectedCoins.includes(coin)).map((coin) => (
                <SelectItem key={coin} value={coin}>
                  {coin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormField
          control={form.control}
          name="auto_convert_to_brl"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Conversão Automática para BRL
                </FormLabel>
                <FormDescription>
                  Converter automaticamente quando receber pagamentos
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

        {form.watch('auto_convert_to_brl') && (
          <FormField
            control={form.control}
            name="conversion_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Mínimo para Conversão (BRL)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Converter apenas valores acima deste montante
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
                  Exchange Ativa
                </FormLabel>
                <FormDescription>
                  Ativar esta exchange para receber pagamentos
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
            Salvar Configuração
          </Button>
        </div>
      </form>
    </Form>
  );
}
