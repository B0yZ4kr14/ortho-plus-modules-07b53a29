import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, TrendingDown, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VolatilityAlert {
  id: string;
  coin_type: string;
  timeframe_minutes: number;
  threshold_percentage: number;
  direction: 'up' | 'down' | 'both';
  is_active: boolean;
  notification_method: string[];
  last_triggered_at: string | null;
  created_at: string;
}

interface CryptoPriceAlertData {
  id: string;
  coin_type: string;
  is_active: boolean;
  notification_method?: string[];
  last_triggered_at?: string;
  created_at: string;
}

export function VolatilityAlerts() {
  const { selectedClinic } = useAuth();
  const [alerts, setAlerts] = useState<VolatilityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    coin_type: 'BTC',
    timeframe_minutes: 60,
    threshold_percentage: 5,
    direction: 'both' as 'up' | 'down' | 'both',
    notification_method: ['EMAIL'],
  });

  const loadAlerts = useCallback(async () => {
    if (!selectedClinic?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('crypto_price_alerts')
        .select('*')
        .eq('clinic_id', selectedClinic.id)
        .eq('alert_type', 'VOLATILITY')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear dados para o formato esperado
      const mappedAlerts: VolatilityAlert[] = (data || []).map((item: CryptoPriceAlertData) => ({
        id: item.id,
        coin_type: item.coin_type,
        timeframe_minutes: 60, // Padrão
        threshold_percentage: 5, // Padrão
        direction: 'both' as 'up' | 'down' | 'both',
        is_active: item.is_active,
        notification_method: item.notification_method || ['EMAIL'],
        last_triggered_at: item.last_triggered_at ?? null,
        created_at: item.created_at,
      }));
      
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas de volatilidade');
    } finally {
      setLoading(false);
    }
  }, [selectedClinic?.id]);

  useEffect(() => {
    if (selectedClinic?.id) {
      loadAlerts();
    }
  }, [selectedClinic?.id, loadAlerts]);

  const handleCreateAlert = async () => {
    if (!selectedClinic?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase.from('crypto_price_alerts').insert([{
        clinic_id: selectedClinic.id,
        coin_type: formData.coin_type,
        alert_type: 'VOLATILITY',
        target_rate_brl: 0,
        notification_method: formData.notification_method,
        is_active: true,
        created_by: user.id,
      }]);

      if (error) throw error;

      toast.success('Alerta de volatilidade criado com sucesso!');
      setShowForm(false);
      loadAlerts();
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      toast.error('Erro ao criar alerta de volatilidade');
    }
  };

  const handleToggleAlert = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('crypto_price_alerts')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Alerta ${!currentState ? 'ativado' : 'desativado'} com sucesso!`);
      loadAlerts();
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      toast.error('Erro ao atualizar alerta');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crypto_price_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Alerta removido com sucesso!');
      loadAlerts();
    } catch (error) {
      console.error('Erro ao remover alerta:', error);
      toast.error('Erro ao remover alerta');
    }
  };

  if (loading) {
    return (
      <Card depth="normal">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Carregando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card depth="normal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Volatilidade
            </CardTitle>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Alerta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              Configure alertas para ser notificado quando o preço de uma criptomoeda variar mais do que o threshold definido em um período específico.
              Ideal para proteção de portfolio contra movimentos bruscos de mercado.
            </p>
          </div>

          {showForm && (
            <Card depth="subtle">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Criptomoeda</Label>
                    <Select value={formData.coin_type} onValueChange={(v) => setFormData({ ...formData, coin_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                        <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                        <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Período de Análise</Label>
                    <Select 
                      value={formData.timeframe_minutes.toString()} 
                      onValueChange={(v) => setFormData({ ...formData, timeframe_minutes: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                        <SelectItem value="1440">24 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Threshold de Variação (%)</Label>
                    <Input
                      type="number"
                      value={formData.threshold_percentage}
                      onChange={(e) => setFormData({ ...formData, threshold_percentage: Number(e.target.value) })}
                      min={1}
                      max={50}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Direção</Label>
                    <Select 
                      value={formData.direction} 
                      onValueChange={(v: 'up' | 'down' | 'both') => setFormData({ ...formData, direction: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">Apenas Alta</SelectItem>
                        <SelectItem value="down">Apenas Queda</SelectItem>
                        <SelectItem value="both">Ambas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAlert}>
                    Criar Alerta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Nenhum alerta de volatilidade configurado</p>
                <p className="text-sm mt-2">Clique em "Novo Alerta" para criar seu primeiro alerta</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} depth="subtle" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-semibold">
                            {alert.coin_type}
                          </Badge>
                          {alert.direction === 'up' && (
                            <Badge variant="default" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Alta
                            </Badge>
                          )}
                          {alert.direction === 'down' && (
                            <Badge variant="destructive" className="gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Queda
                            </Badge>
                          )}
                          {alert.direction === 'both' && (
                            <Badge variant="default">
                              Ambas Direções
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Threshold: </span>
                            <span className="font-semibold">±{alert.threshold_percentage}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Período: </span>
                            <span className="font-semibold">
                              {alert.timeframe_minutes < 60 
                                ? `${alert.timeframe_minutes} min` 
                                : `${alert.timeframe_minutes / 60}h`}
                            </span>
                          </div>
                        </div>

                        {alert.last_triggered_at && (
                          <p className="text-xs text-muted-foreground">
                            Último disparo: {format(new Date(alert.last_triggered_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.is_active}
                          onCheckedChange={() => handleToggleAlert(alert.id, alert.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
