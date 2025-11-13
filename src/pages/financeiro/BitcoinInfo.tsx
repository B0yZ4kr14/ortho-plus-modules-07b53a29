import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Shield, Zap, Globe, TrendingUp, Lock, Clock } from 'lucide-react';

export function BitcoinInfo() {
  return (
    <div className="space-y-6">
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            O que é Bitcoin?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Bitcoin é a primeira e mais conhecida criptomoeda descentralizada do mundo. Criada em 2009 por Satoshi Nakamoto, 
            permite transações diretas entre pessoas sem intermediários financeiros.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Segurança</h4>
                <p className="text-sm text-muted-foreground">
                  Transações protegidas por criptografia de ponta e validadas por uma rede descentralizada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-green-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Global</h4>
                <p className="text-sm text-muted-foreground">
                  Funciona 24/7 em todo o mundo, sem fronteiras ou restrições geográficas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Rápido</h4>
                <p className="text-sm text-muted-foreground">
                  Transações confirmadas em minutos, muito mais rápido que transferências bancárias internacionais
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-purple-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Descentralizado</h4>
                <p className="text-sm text-muted-foreground">
                  Não controlado por governos ou bancos, resistente à censura e confisco
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Vantagens para sua Clínica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">1</Badge>
            <p className="text-sm text-muted-foreground flex-1">
              <strong>Taxas mais baixas:</strong> Taxas de transação significativamente menores comparadas a cartões de crédito (2-5%)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">2</Badge>
            <p className="text-sm text-muted-foreground flex-1">
              <strong>Sem chargebacks:</strong> Transações irreversíveis protegem contra fraudes e estornos indevidos
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">3</Badge>
            <p className="text-sm text-muted-foreground flex-1">
              <strong>Recebimento rápido:</strong> Pagamentos confirmados em 10-30 minutos, disponíveis para uso imediato
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">4</Badge>
            <p className="text-sm text-muted-foreground flex-1">
              <strong>Atrai novos clientes:</strong> Pacientes tech-savvy valorizam clínicas que aceitam criptomoedas
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">5</Badge>
            <p className="text-sm text-muted-foreground flex-1">
              <strong>Conversão automática:</strong> Converta automaticamente para BRL se não quiser manter exposição a Bitcoin
            </p>
          </div>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Como funciona o pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-sm">
              <strong>Gerar QR Code:</strong> Crie um QR code de pagamento com o valor em BRL (será convertido automaticamente para BTC)
            </li>
            <li className="text-sm">
              <strong>Paciente escaneia:</strong> O paciente usa sua carteira Bitcoin (ex: Trust Wallet, Binance) para escanear o QR code
            </li>
            <li className="text-sm">
              <strong>Confirmação blockchain:</strong> Aguarde 1-3 confirmações na rede Bitcoin (10-30 minutos)
            </li>
            <li className="text-sm">
              <strong>Conversão automática:</strong> Sistema converte automaticamente BTC → BRL e integra com Contas a Receber
            </li>
            <li className="text-sm">
              <strong>Pronto!</strong> Valor disponível em sua conta, com registro completo para auditoria
            </li>
          </ol>

          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              <strong>Dica:</strong> Configure a conversão automática para BRL se não quiser manter exposição a variações do Bitcoin. 
              Você receberá exatamente o valor em BRL do momento da confirmação, protegido contra volatilidade.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardHeader>
          <CardTitle>Exchanges Suportadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Binance', desc: 'Maior exchange do mundo' },
              { name: 'Coinbase', desc: 'Mais segura e regulada (EUA)' },
              { name: 'Kraken', desc: 'Altamente confiável' },
              { name: 'Bybit', desc: 'Popular na Ásia' },
              { name: 'Mercado Bitcoin', desc: 'Brasileira, em BRL direto' },
            ].map((exchange) => (
              <div key={exchange.name} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <h4 className="font-semibold text-sm">{exchange.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{exchange.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
