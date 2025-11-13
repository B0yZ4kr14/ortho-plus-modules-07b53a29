// @ts-nocheck
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Building2, CheckCircle2, XCircle, Send } from 'lucide-react'

export default function IntegracaoContabilConfig() {
  const { user, selectedClinic } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configs, setConfigs] = useState<any[]>([])
  const [envios, setEnvios] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('config')

  const [formData, setFormData] = useState({
    software: 'TOTVS',
    api_url: '',
    api_key: '',
    api_secret: '',
    codigo_empresa: '',
    envio_automatico: true,
    enviar_sped_fiscal: true,
    enviar_nfce_dados: true,
    periodicidade_envio: 'DIARIO',
    email_contador: '',
    ativo: true,
  })

  useEffect(() => {
    loadData()
  }, [selectedClinic])

  const loadData = async () => {
    if (!selectedClinic) return

    try {
      setLoading(true)
      
      const [configsResult, enviosResult] = await Promise.all([
        supabase
          .from('integracao_contabil_config')
          .select('*')
          .eq('clinic_id', selectedClinic)
          .order('created_at', { ascending: false }),
        supabase
          .from('integracao_contabil_envios')
          .select('*, integracao_contabil_config(software)')
          .eq('clinic_id', selectedClinic)
          .order('created_at', { ascending: false })
          .limit(50)
      ])

      if (configsResult.error) throw configsResult.error
      if (enviosResult.error) throw enviosResult.error

      setConfigs(configsResult.data || [])
      setEnvios(enviosResult.data || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClinic) return

    try {
      setSaving(true)

      const payload = {
        ...formData,
        clinic_id: selectedClinic,
      }

      const { error } = await supabase
        .from('integracao_contabil_config')
        .upsert(payload, {
          onConflict: 'clinic_id,software',
        })

      if (error) throw error

      toast({
        title: "Configuração salva",
        description: "Integração contábil configurada com sucesso",
      })

      loadData()
      setFormData({
        software: 'TOTVS',
        api_url: '',
        api_key: '',
        api_secret: '',
        codigo_empresa: '',
        envio_automatico: true,
        enviar_sped_fiscal: true,
        enviar_nfce_dados: true,
        periodicidade_envio: 'DIARIO',
        email_contador: '',
        ativo: true,
      })
    } catch (error: any) {
      console.error('Error saving config:', error)
      toast({
        title: "Erro ao salvar configuração",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEnviarManual = async (software: string) => {
    try {
      const periodo = new Date().toISOString().slice(0, 7) // YYYY-MM

      const { data, error } = await supabase.functions.invoke('enviar-dados-contabilidade', {
        body: {
          clinicId: selectedClinic,
          tipoDocumento: 'SPED_FISCAL',
          periodoReferencia: periodo,
          forcarEnvio: true,
        },
      })

      if (error) throw error

      toast({
        title: "Envio iniciado",
        description: `Enviando dados para ${software}...`,
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Integração com Softwares Contábeis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações Ativas</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Envios</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="software">Software Contábil *</Label>
                  <Select
                    value={formData.software}
                    onValueChange={(value) => setFormData({ ...formData, software: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOTVS">TOTVS Protheus</SelectItem>
                      <SelectItem value="SAP">SAP Business One</SelectItem>
                      <SelectItem value="CONTA_AZUL">Conta Azul</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_url">URL da API *</Label>
                  <Input
                    id="api_url"
                    value={formData.api_url}
                    onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                    placeholder="https://api.softwarecontabil.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="Chave de API fornecida pelo software"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_secret">API Secret</Label>
                  <Input
                    id="api_secret"
                    type="password"
                    value={formData.api_secret}
                    onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                    placeholder="Secret fornecido pelo software"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo_empresa">Código da Empresa</Label>
                  <Input
                    id="codigo_empresa"
                    value={formData.codigo_empresa}
                    onChange={(e) => setFormData({ ...formData, codigo_empresa: e.target.value })}
                    placeholder="Código no sistema contábil"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_contador">E-mail do Contador</Label>
                  <Input
                    id="email_contador"
                    type="email"
                    value={formData.email_contador}
                    onChange={(e) => setFormData({ ...formData, email_contador: e.target.value })}
                    placeholder="contador@escritorio.com.br"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodicidade">Periodicidade de Envio</Label>
                  <Select
                    value={formData.periodicidade_envio}
                    onValueChange={(value) => setFormData({ ...formData, periodicidade_envio: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEMPO_REAL">Tempo Real</SelectItem>
                      <SelectItem value="DIARIO">Diário</SelectItem>
                      <SelectItem value="SEMANAL">Semanal</SelectItem>
                      <SelectItem value="MENSAL">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="envio_automatico"
                    checked={formData.envio_automatico}
                    onCheckedChange={(checked) => setFormData({ ...formData, envio_automatico: checked })}
                  />
                  <Label htmlFor="envio_automatico" className="cursor-pointer">
                    Envio automático conforme periodicidade
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enviar_sped"
                    checked={formData.enviar_sped_fiscal}
                    onCheckedChange={(checked) => setFormData({ ...formData, enviar_sped_fiscal: checked })}
                  />
                  <Label htmlFor="enviar_sped" className="cursor-pointer">
                    Enviar SPED Fiscal
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enviar_nfce"
                    checked={formData.enviar_nfce_dados}
                    onCheckedChange={(checked) => setFormData({ ...formData, enviar_nfce_dados: checked })}
                  />
                  <Label htmlFor="enviar_nfce" className="cursor-pointer">
                    Enviar dados de NFCe
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo" className="cursor-pointer">
                    Integração ativa
                  </Label>
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configuração
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="integracoes" className="space-y-3">
            {configs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma integração configurada
              </p>
            ) : (
              configs.map((config) => (
                <Card key={config.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{config.software}</h4>
                          <Badge variant={config.ativo ? "success" : "secondary"}>
                            {config.ativo ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ativa
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inativa
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Periodicidade: {config.periodicidade_envio}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEnviarManual(config.software)}
                        disabled={!config.ativo}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-2">
            {envios.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum envio realizado
              </p>
            ) : (
              envios.map((envio) => (
                <Card key={envio.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{envio.integracao_contabil_config?.software}</span>
                          <Badge variant={
                            envio.status === 'SUCESSO' ? 'success' :
                            envio.status === 'ERRO' ? 'destructive' :
                            'secondary'
                          }>
                            {envio.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {envio.tipo_documento} - {envio.periodo_referencia}
                        </p>
                        {envio.enviado_em && (
                          <p className="text-xs text-muted-foreground">
                            Enviado em: {new Date(envio.enviado_em).toLocaleString('pt-BR')}
                          </p>
                        )}
                        {envio.erro_mensagem && (
                          <p className="text-xs text-destructive mt-1">
                            {envio.erro_mensagem}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
