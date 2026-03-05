import { useState } from "react";
import { useEstoqueSupabase } from "../hooks/useEstoqueSupabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Brain, AlertTriangle, TrendingUp, TrendingDown, Minus, Mail, CalendarDays, Target } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";

interface Previsao {
  produto: string;
  status: "CRITICO" | "ALERTA" | "NORMAL" | "EXCESSO";
  diasAteEstoqueMinimo: number;
  diasAteEstoqueZero: number;
  dataEstimadaReposicao: string;
  quantidadeSugerida: number;
  tendencia: "CRESCENTE" | "ESTAVEL" | "DECRESCENTE";
  sazonalidade: "ALTA" | "MEDIA" | "BAIXA";
  confianca: number;
  justificativa: string;
  recomendacao: string;
  metodoTradicional?: {
    diasAteEstoqueZero: number;
    quantidadeSugerida: number;
  };
}

interface EventoFuturo {
  tipo: "PROMOCAO" | "FERIAS" | "EXPANSAO" | "OUTRO";
  dataInicio: string;
  dataFim: string;
  impactoEstimado: number;
  descricao: string;
}

export function PrevisaoReposicao() {
  const { produtos, movimentacoes } = useEstoqueSupabase();
  const [previsoes, setPrevisoes] = useState<Previsao[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resumo, setResumo] = useState<any>(null);
  const [eventosFuturos, setEventosFuturos] = useState<EventoFuturo[]>([]);
  const [novoEvento, setNovoEvento] = useState<EventoFuturo>({
    tipo: "PROMOCAO",
    dataInicio: "",
    dataFim: "",
    impactoEstimado: 0,
    descricao: ""
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const gerarPrevisoes = async () => {
    setLoading(true);
    try {
      const produtosParaAnalise = produtos
        .filter(p => p.quantidadeAtual <= p.quantidadeMinima * 1.5)
        .map(produto => {
          const movimentacoesProduto = movimentacoes.filter(m => m.produtoId === produto.id);
          
          return {
            produtoId: produto.id,
            produtoNome: produto.nome,
            quantidadeAtual: produto.quantidadeAtual,
            quantidadeMinima: produto.quantidadeMinima,
            movimentacoes: movimentacoesProduto.map(m => ({
              data: m.createdAt,
              quantidade: m.quantidade,
              tipo: m.tipo
            }))
          };
        });

      if (produtosParaAnalise.length === 0) {
        toast.info("Nenhum produto necessita análise de reposição no momento");
        setLoading(false);
        return;
      }

      const data = await apiClient.post('/estoque/previsao/gerar', {
        produtos: produtosParaAnalise,
        eventosFuturos: eventosFuturos.length > 0 ? eventosFuturos : undefined
      });

      setPrevisoes(data.previsoes || []);
      setResumo(data.resumo || {});
      toast.success("Previsões geradas com sucesso pela IA!");
    } catch (error: any) {
      console.error("Erro ao gerar previsões:", error);
      toast.error(error.message || "Erro ao gerar previsões de reposição");
    } finally {
      setLoading(false);
    }
  };

  const enviarAlertaEmail = async () => {
    if (!previsoes || previsoes.length === 0) {
      toast.error("Gere as previsões antes de enviar alertas");
      return;
    }

    setSendingEmail(true);
    try {
      await apiClient.post('/estoque/previsao/alertas/email', {
        previsoes, 
        resumo, 
        eventosFuturos: eventosFuturos.length > 0 ? eventosFuturos : undefined
      });

      toast.success("Alertas enviados por email para gestores!");
    } catch (error: any) {
      console.error("Erro ao enviar alertas:", error);
      toast.error(error.message || "Erro ao enviar alertas por email");
    } finally {
      setSendingEmail(false);
    }
  };

  const adicionarEvento = () => {
    if (!novoEvento.dataInicio || !novoEvento.dataFim || !novoEvento.descricao) {
      toast.error("Preencha todos os campos do evento");
      return;
    }
    setEventosFuturos([...eventosFuturos, novoEvento]);
    setNovoEvento({ tipo: "PROMOCAO", dataInicio: "", dataFim: "", impactoEstimado: 0, descricao: "" });
    setDialogOpen(false);
    toast.success("Evento futuro adicionado! Gere as previsões novamente.");
  };

  const removerEvento = (index: number) => {
    setEventosFuturos(eventosFuturos.filter((_, i) => i !== index));
    toast.success("Evento removido");
  };

  const getStatusIcon = (status: string) => {
    if (status === "CRITICO") return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (status === "ALERTA") return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
  };

  const getTrendIcon = (tendencia: string) => {
    if (tendencia === "CRESCENTE") return <TrendingUp className="w-5 h-5 text-destructive" />;
    if (tendencia === "DECRESCENTE") return <TrendingDown className="w-5 h-5 text-success" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Previsão Inteligente de Reposição (IA)</h3>
          <p className="text-sm text-muted-foreground">
            Análise preditiva usando machine learning baseada em padrões históricos de consumo
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarDays className="w-4 h-4 mr-2" />
                Eventos Futuros ({eventosFuturos.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajuste Fino de Previsões</DialogTitle>
                <DialogDescription>
                  Informe eventos futuros que impactarão o consumo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Evento</Label>
                    <Select value={novoEvento.tipo} onValueChange={(v: any) => setNovoEvento({...novoEvento, tipo: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROMOCAO">Promoção</SelectItem>
                        <SelectItem value="FERIAS">Férias/Recesso</SelectItem>
                        <SelectItem value="EXPANSAO">Expansão</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Impacto (%)</Label>
                    <Input type="number" placeholder="Ex: 30 ou -20" value={novoEvento.impactoEstimado || ""}
                      onChange={(e) => setNovoEvento({...novoEvento, impactoEstimado: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Data Início</Label><Input type="date" value={novoEvento.dataInicio} onChange={(e) => setNovoEvento({...novoEvento, dataInicio: e.target.value})} /></div>
                  <div><Label>Data Fim</Label><Input type="date" value={novoEvento.dataFim} onChange={(e) => setNovoEvento({...novoEvento, dataFim: e.target.value})} /></div>
                </div>
                <div><Label>Descrição</Label><Textarea placeholder="Descreva o evento..." value={novoEvento.descricao} onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})} /></div>
                <Button onClick={adicionarEvento} className="w-full">Adicionar Evento</Button>
                {eventosFuturos.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Eventos Configurados</h4>
                    {eventosFuturos.map((e, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg mb-2">
                        <div><Badge variant="outline">{e.tipo}</Badge> <span className="text-sm">{e.descricao}</span></div>
                        <Button variant="ghost" size="sm" onClick={() => removerEvento(i)}>Remover</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {previsoes && previsoes.length > 0 && (
            <Button onClick={enviarAlertaEmail} disabled={sendingEmail} variant="outline" size="sm">
              {sendingEmail ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Mail className="w-4 h-4 mr-2" />Enviar Alertas</>}
            </Button>
          )}
          <Button onClick={gerarPrevisoes} disabled={loading || produtos.length === 0}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analisando...</> : <><Brain className="w-4 h-4 mr-2" />Gerar Previsões IA</>}
          </Button>
        </div>
      </div>

      {previsoes && previsoes.length > 0 && (
        <Tabs defaultValue="previsoes" className="w-full">
          <TabsList>
            <TabsTrigger value="previsoes">Previsões IA</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo IA vs Tradicional</TabsTrigger>
          </TabsList>
          <TabsContent value="previsoes" className="space-y-4 mt-4">
            {previsoes.map((p, i) => (
              <Card key={i}>
                <CardHeader><CardTitle>{p.produto}</CardTitle><CardDescription>{p.justificativa}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div><p className="text-sm text-muted-foreground">Estoque Zero</p><p className="text-2xl font-bold">{p.diasAteEstoqueZero} dias</p></div>
                    <div><p className="text-sm text-muted-foreground">Qtd Sugerida</p><p className="text-2xl font-bold">{p.quantidadeSugerida}</p></div>
                    <div><p className="text-sm text-muted-foreground">Confiança</p><p className="text-2xl font-bold">{(p.confianca * 100).toFixed(0)}%</p></div>
                    <div><p className="text-sm text-muted-foreground">Tendência</p><p className="flex items-center gap-1 mt-1">{getTrendIcon(p.tendencia)}</p></div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg"><p className="text-sm"><strong>Recomendação:</strong> {p.recomendacao}</p></div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="comparativo" className="space-y-4 mt-4">
            <Card><CardHeader><CardTitle>Comparativo IA vs Tradicional</CardTitle></CardHeader><CardContent>
              {previsoes.map((p, i) => (
                <div key={i} className="border rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-3">{p.produto}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-3 rounded"><Brain className="w-5 h-5 mb-2" /><p className="font-bold">IA: {p.diasAteEstoqueZero} dias | {p.quantidadeSugerida} un</p><p className="text-xs text-muted-foreground mt-2">Considera sazonalidade, tendências e eventos futuros</p></div>
                    <div className="bg-muted p-3 rounded"><Target className="w-5 h-5 mb-2" /><p className="font-bold">Tradicional: {p.metodoTradicional?.diasAteEstoqueZero || "N/A"} dias | {p.metodoTradicional?.quantidadeSugerida || "N/A"} un</p><p className="text-xs text-muted-foreground mt-2">Apenas média simples dos últimos 30 dias</p></div>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
