import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Shield, Zap, Globe, Lock, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function BitcoinInfoCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card depth="normal" className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Bitcoin className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Pagamentos em Bitcoin e Criptomoedas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Receba pagamentos de forma rápida, segura e com taxas reduzidas
                </p>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Saiba Mais
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Vantagens principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card/50">
                <Shield className="h-8 w-8 text-blue-500 mb-3" />
                <h4 className="font-semibold text-sm mb-2">Segurança Máxima</h4>
                <p className="text-xs text-muted-foreground">
                  Transações protegidas por blockchain com criptografia de ponta
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50">
                <Zap className="h-8 w-8 text-yellow-500 mb-3" />
                <h4 className="font-semibold text-sm mb-2">Taxas Reduzidas</h4>
                <p className="text-xs text-muted-foreground">
                  Até 90% mais barato que cartões de crédito (2-5% vs 0.1-0.5%)
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50">
                <Globe className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-semibold text-sm mb-2">Global 24/7</h4>
                <p className="text-xs text-muted-foreground">
                  Receba de qualquer lugar do mundo, sem fronteiras ou horários
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50">
                <Lock className="h-8 w-8 text-purple-500 mb-3" />
                <h4 className="font-semibold text-sm mb-2">Sem Chargebacks</h4>
                <p className="text-xs text-muted-foreground">
                  Transações irreversíveis protegem contra fraudes e estornos
                </p>
              </div>
            </div>

            {/* Como funciona */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Como Funciona o Recebimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { step: '1', title: 'Configure Exchange', desc: 'Binance, Coinbase, etc.' },
                  { step: '2', title: 'Crie Carteira', desc: 'BTC, ETH ou USDT' },
                  { step: '3', title: 'Gere QR Code', desc: 'Paciente escaneia' },
                  { step: '4', title: 'Confirmação', desc: '10-30 minutos' },
                  { step: '5', title: 'Conversão', desc: 'Auto-conversão BRL' },
                ].map((item) => (
                  <div key={item.step} className="text-center p-3 bg-background rounded-lg border">
                    <Badge className="mb-2">{item.step}</Badge>
                    <p className="text-sm font-semibold mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchanges suportadas */}
            <div>
              <h4 className="font-semibold mb-3">Exchanges Suportadas</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { name: 'Binance', color: 'bg-yellow-500/10 border-yellow-500/20' },
                  { name: 'Coinbase', color: 'bg-blue-500/10 border-blue-500/20' },
                  { name: 'Kraken', color: 'bg-purple-500/10 border-purple-500/20' },
                  { name: 'Bybit', color: 'bg-orange-500/10 border-orange-500/20' },
                  { name: 'Mercado Bitcoin', color: 'bg-cyan-500/10 border-cyan-500/20' },
                ].map((exchange) => (
                  <div key={exchange.name} className={`p-3 rounded-lg border text-center ${exchange.color}`}>
                    <p className="text-sm font-semibold">{exchange.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
