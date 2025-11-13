import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowDown, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { coinLabels } from '@/modules/crypto/types/crypto.types';

interface CascadeLevel {
  id: string;
  target_rate_brl: string;
  conversion_percentage: string;
  order: number;
}

interface CascadeAlertWizardProps {
  onSubmit: (cascadeAlerts: any[]) => void;
  onCancel: () => void;
}

const AVAILABLE_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC'];

export function CascadeAlertWizard({ onSubmit, onCancel }: CascadeAlertWizardProps) {
  const [coinType, setCoinType] = useState('');
  const [alertType, setAlertType] = useState<'ABOVE' | 'BELOW'>('BELOW');
  const [autoConvert, setAutoConvert] = useState(true);
  const [notificationMethods, setNotificationMethods] = useState<string[]>(['EMAIL']);
  
  const [levels, setLevels] = useState<CascadeLevel[]>([
    { id: '1', target_rate_brl: '', conversion_percentage: '25', order: 1 },
    { id: '2', target_rate_brl: '', conversion_percentage: '25', order: 2 },
  ]);

  const addLevel = () => {
    const newOrder = levels.length + 1;
    setLevels([
      ...levels,
      { id: Date.now().toString(), target_rate_brl: '', conversion_percentage: '25', order: newOrder }
    ]);
  };

  const removeLevel = (id: string) => {
    if (levels.length <= 2) {
      toast.error('Mantenha pelo menos 2 níveis de cascata');
      return;
    }
    const updatedLevels = levels
      .filter(l => l.id !== id)
      .map((l, idx) => ({ ...l, order: idx + 1 }));
    setLevels(updatedLevels);
  };

  const updateLevel = (id: string, field: 'target_rate_brl' | 'conversion_percentage', value: string) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const validateAndSubmit = () => {
    if (!coinType) {
      toast.error('Selecione uma criptomoeda');
      return;
    }

    // Validar se todas as taxas estão preenchidas
    const invalidLevels = levels.filter(l => !l.target_rate_brl || parseFloat(l.target_rate_brl) <= 0);
    if (invalidLevels.length > 0) {
      toast.error('Preencha todas as taxas alvo');
      return;
    }

    // Validar ordem das taxas (decrescente para BELOW, crescente para ABOVE)
    const sortedLevels = [...levels].sort((a, b) => a.order - b.order);
    for (let i = 1; i < sortedLevels.length; i++) {
      const prev = parseFloat(sortedLevels[i - 1].target_rate_brl);
      const curr = parseFloat(sortedLevels[i].target_rate_brl);
      
      if (alertType === 'BELOW' && curr >= prev) {
        toast.error('Para alertas BELOW, cada nível deve ter taxa menor que o anterior');
        return;
      }
      if (alertType === 'ABOVE' && curr <= prev) {
        toast.error('Para alertas ABOVE, cada nível deve ter taxa maior que o anterior');
        return;
      }
    }

    // Validar percentuais totalizam 100%
    const totalPercentage = levels.reduce((sum, l) => sum + parseFloat(l.conversion_percentage), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(`A soma dos percentuais deve ser 100% (atual: ${totalPercentage.toFixed(1)}%)`);
      return;
    }

    // Gerar UUID único para o grupo de cascata
    const cascadeGroupId = crypto.randomUUID();

    // Criar array de alertas
    const cascadeAlerts = sortedLevels.map((level) => ({
      coin_type: coinType,
      target_rate_brl: parseFloat(level.target_rate_brl),
      alert_type: alertType,
      notification_method: notificationMethods,
      stop_loss_enabled: true,
      auto_convert_on_trigger: autoConvert,
      conversion_percentage: parseFloat(level.conversion_percentage),
      cascade_enabled: true,
      cascade_group_id: cascadeGroupId,
      cascade_order: level.order,
    }));

    onSubmit(cascadeAlerts);
  };

  const totalPercentage = levels.reduce((sum, l) => parseFloat(l.conversion_percentage || '0'), 0);
  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Criptomoeda</Label>
          <Select value={coinType} onValueChange={setCoinType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_COINS.map((coin) => (
                <SelectItem key={coin} value={coin}>
                  {coinLabels[coin]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Direção da Estratégia</Label>
          <Select value={alertType} onValueChange={(v: 'ABOVE' | 'BELOW') => setAlertType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BELOW">Venda Progressiva (Queda de Preço)</SelectItem>
              <SelectItem value="ABOVE">Compra Progressiva (Alta de Preço)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {alertType === 'BELOW' 
              ? 'Converte gradualmente conforme o preço cai (Stop-Loss em cascata)'
              : 'Converte gradualmente conforme o preço sobe (Take-Profit em cascata)'}
          </p>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div>
            <Label htmlFor="autoConvert" className="text-sm font-semibold">
              Conversão Automática
            </Label>
            <p className="text-xs text-muted-foreground">
              Executar conversões automaticamente quando cada nível for atingido
            </p>
          </div>
          <Switch
            id="autoConvert"
            checked={autoConvert}
            onCheckedChange={setAutoConvert}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Níveis de Cascata</Label>
            <p className="text-xs text-muted-foreground">
              Configure os thresholds e percentuais para DCA automatizado
            </p>
          </div>
          <Badge variant={isValidTotal ? 'success' : 'warning'}>
            Total: {totalPercentage.toFixed(1)}%
          </Badge>
        </div>

        <div className="space-y-3">
          {levels.map((level, index) => (
            <div key={level.id}>
              <Card className="p-4" depth="subtle">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    {level.order}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Taxa Alvo (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={alertType === 'BELOW' ? 'Ex: 320000' : 'Ex: 360000'}
                          value={level.target_rate_brl}
                          onChange={(e) => updateLevel(level.id, 'target_rate_brl', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Converter (%)</Label>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="100"
                          placeholder="25"
                          value={level.conversion_percentage}
                          onChange={(e) => updateLevel(level.id, 'conversion_percentage', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLevel(level.id)}
                    disabled={levels.length <= 2}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
              
              {index < levels.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addLevel}
          className="w-full"
          disabled={levels.length >= 5}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Nível {levels.length < 5 && `(${5 - levels.length} restantes)`}
        </Button>
      </div>

      {!isValidTotal && (
        <div className="p-3 border border-warning/50 bg-warning/10 rounded-lg">
          <p className="text-sm text-warning">
            ⚠️ A soma dos percentuais deve ser exatamente 100%. Ajuste os valores acima.
          </p>
        </div>
      )}

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingDown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Dollar-Cost Averaging (DCA) Automatizado</p>
            <p className="text-xs text-muted-foreground">
              Esta estratégia converte sua posição em múltiplos níveis, reduzindo risco e otimizando 
              pontos de saída ao invés de converter tudo de uma vez. Cada nível só dispara após o anterior.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={validateAndSubmit}
          disabled={!isValidTotal || !coinType}
        >
          Criar Estratégia DCA ({levels.length} níveis)
        </Button>
      </div>
    </div>
  );
}
