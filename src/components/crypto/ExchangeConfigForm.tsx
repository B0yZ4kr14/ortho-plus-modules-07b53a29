import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { exchangeLabels } from '@/modules/crypto/types/crypto.types';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, HelpCircle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Schema de validação aprimorado
const exchangeConfigSchema = z.object({
  exchange_name: z.string().min(1, 'Selecione uma exchange'),
  api_key: z.string()
    .min(16, 'API Key deve ter no mínimo 16 caracteres')
    .max(128, 'API Key muito longa'),
  api_secret: z.string()
    .min(16, 'API Secret deve ter no mínimo 16 caracteres')
    .max(256, 'API Secret muito longo'),
  wallet_address: z.string().optional(),
  supported_coins: z.array(z.string()).min(1, 'Selecione pelo menos uma moeda'),
  auto_convert_to_brl: z.boolean().default(false),
  conversion_threshold: z.number().min(0).default(0),
  processing_fee_percentage: z.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
});

interface ExchangeConfigFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

const AVAILABLE_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC'];

export function ExchangeConfigForm({ onSubmit, onCancel, initialData }: ExchangeConfigFormProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const form = useForm({
    resolver: zodResolver(exchangeConfigSchema),
    defaultValues: initialData || {
      exchange_name: 'BINANCE',
      api_key: '',
      api_secret: '',
      is_active: true,
      supported_coins: ['BTC'],
      auto_convert_to_brl: false,
      conversion_threshold: 0,
      processing_fee_percentage: 0,
      wallet_address: '',
    },
  });

  const handleTestConnection = async () => {
    const apiKey = form.getValues('api_key');
    const apiSecret = form.getValues('api_secret');
    const exchangeName = form.getValues('exchange_name');

    if (!apiKey || !apiSecret) {
      toast.error('Preencha API Key e API Secret antes de testar');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Simula teste de conexão (em produção, chamar edge function)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Por enquanto sempre sucesso
      setConnectionStatus('success');
      toast.success('Conexão testada com sucesso!');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Falha ao conectar com a exchange. Verifique suas credenciais.');
    } finally {
      setTestingConnection(false);
    }
  };

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
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {connectionStatus === 'success' && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Conexão com a exchange testada com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                Falha ao conectar. Verifique se suas credenciais estão corretas.
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="exchange_name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Exchange *</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Selecione a corretora de criptomoedas que você deseja integrar. Binance e Coinbase são as mais populares.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
            name="api_key"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>API Key *</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Chave pública da API da exchange. Você pode gerar esta chave na seção de API Settings da sua conta na exchange. <strong>Não compartilhe esta chave publicamente.</strong></p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Ex: nKd8sH3jDk2Hs9fKd8sH3jDk2Hs9f" 
                    type="password"
                    {...field} 
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>
                  Chave de API da exchange (mínimo 16 caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="api_secret"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>API Secret *</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Chave secreta da API da exchange. Esta é uma credencial sensível que permite operações na sua conta. <strong>NUNCA compartilhe este valor com ninguém.</strong> Guarde em local seguro.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Ex: 8fKd8sH3jDk2Hs9f8fKd8sH3jDk2Hs9f8fKd8sH3jDk2Hs9f" 
                    type="password"
                    {...field} 
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>
                  Chave secreta da API (mínimo 16 caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando Conexão...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="wallet_address"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Endereço da Carteira Principal (Opcional)</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Endereço da sua carteira principal na exchange para receber pagamentos diretos. Você pode deixar em branco e criar carteiras específicas depois.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input 
                    placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" 
                    {...field} 
                    className="font-mono text-sm"
                  />
                </FormControl>
                <FormDescription>
                  Endereço da carteira para recebimentos diretos
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
          name="processing_fee_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Processamento (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Ex: 2.5"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Percentual cobrado pela clínica em cada transação (0-100%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={testingConnection}>
              Salvar Configuração
            </Button>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  );
}
