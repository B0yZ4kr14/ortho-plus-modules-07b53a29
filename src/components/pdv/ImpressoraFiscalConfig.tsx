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
import { Loader2, Printer, CheckCircle2, XCircle } from 'lucide-react'

export default function ImpressoraFiscalConfig() {
  const { user, selectedClinic } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [formData, setFormData] = useState({
    tipo_equipamento: 'SAT',
    numero_serie: '',
    codigo_ativacao: '',
    ip_address: '',
    porta: 7000,
    modelo: '',
    fabricante: '',
    versao_software: '',
    ativo: true,
  })

  useEffect(() => {
    loadConfig()
  }, [selectedClinic])

  const loadConfig = async () => {
    if (!selectedClinic) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sat_mfe_config')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setConfig(data)
        setFormData(data)
      }
    } catch (error: any) {
      console.error('Error loading config:', error)
      toast({
        title: "Erro ao carregar configuração",
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
        porta: Number(formData.porta),
      }

      if (config) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('sat_mfe_config')
          .update(payload)
          .eq('id', config.id)

        if (error) throw error

        toast({
          title: "Configuração atualizada",
          description: "Impressora fiscal configurada com sucesso",
        })
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('sat_mfe_config')
          .insert(payload)

        if (error) throw error

        toast({
          title: "Configuração criada",
          description: "Impressora fiscal configurada com sucesso",
        })
      }

      loadConfig()
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            <CardTitle>Configuração de Impressora Fiscal SAT/MFe</CardTitle>
          </div>
          {config && (
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_equipamento">Tipo de Equipamento</Label>
              <Select
                value={formData.tipo_equipamento}
                onValueChange={(value) => setFormData({ ...formData, tipo_equipamento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAT">SAT (Sistema Autenticador e Transmissor)</SelectItem>
                  <SelectItem value="MFE">MFe (Módulo Fiscal Eletrônico)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série *</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                placeholder="Ex: 900000001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo_ativacao">Código de Ativação *</Label>
              <Input
                id="codigo_ativacao"
                type="password"
                value={formData.codigo_ativacao}
                onChange={(e) => setFormData({ ...formData, codigo_ativacao: e.target.value })}
                placeholder="Código fornecido pela SEFAZ"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fabricante">Fabricante</Label>
              <Input
                id="fabricante"
                value={formData.fabricante}
                onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                placeholder="Ex: Dimep, Sweda, Bematech"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ex: D-SAT 2.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="versao_software">Versão do Software</Label>
              <Input
                id="versao_software"
                value={formData.versao_software}
                onChange={(e) => setFormData({ ...formData, versao_software: e.target.value })}
                placeholder="Ex: 1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip_address">Endereço IP (para MFe em rede)</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="Ex: 192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porta">Porta (para MFe em rede)</Label>
              <Input
                id="porta"
                type="number"
                value={formData.porta}
                onChange={(e) => setFormData({ ...formData, porta: Number(e.target.value) })}
                placeholder="7000"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Equipamento ativo para impressão automática
            </Label>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">ℹ️ Informações importantes:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>O equipamento SAT/MFe deve estar homologado pela SEFAZ</li>
              <li>Mantenha o código de ativação em local seguro</li>
              <li>Verifique se o driver do equipamento está instalado</li>
              <li>Para MFe em rede, certifique-se que o IP está correto</li>
            </ul>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config ? 'Atualizar Configuração' : 'Salvar Configuração'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
