import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { useFidelidade } from "@/modules/fidelidade/hooks/useFidelidade";

const badgeSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  icone: z.string().min(1, "Selecione um ícone"),
  criterio_tipo: z.enum(["pontos_totais", "nivel"]),
  criterio_valor: z.union([z.number(), z.string()]),
  compartilhavel: z.boolean()
});

type BadgeFormData = z.infer<typeof badgeSchema>;

interface BadgeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconeOptions = [
  { value: "🎯", label: "🎯 Alvo" },
  { value: "⭐", label: "⭐ Estrela" },
  { value: "🏆", label: "🏆 Troféu" },
  { value: "🥇", label: "🥇 Ouro" },
  { value: "🥈", label: "🥈 Prata" },
  { value: "🥉", label: "🥉 Bronze" },
  { value: "💎", label: "💎 Diamante" },
  { value: "💠", label: "💠 Joia" },
  { value: "🎖️", label: "🎖️ Medalha" },
  { value: "👑", label: "👑 Coroa" }
];

export function BadgeForm({ open, onOpenChange }: BadgeFormProps) {
  const { createBadge } = useFidelidade();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BadgeFormData>>({
    nome: "",
    descricao: "",
    icone: "🎯",
    criterio_tipo: "pontos_totais",
    criterio_valor: 100,
    compartilhavel: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = badgeSchema.parse(formData);
      
      await createBadge(validated);
      
      onOpenChange(false);
      setFormData({
        nome: "",
        descricao: "",
        icone: "🎯",
        criterio_tipo: "pontos_totais",
        criterio_valor: 100,
        compartilhavel: true
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao criar badge");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Badge</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Badge *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Paciente VIP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva como conquistar esta badge..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icone">Ícone *</Label>
              <Select
                value={formData.icone}
                onValueChange={(value) => setFormData({ ...formData, icone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criterio_tipo">Tipo de Critério *</Label>
              <Select
                value={formData.criterio_tipo}
                onValueChange={(value: "pontos_totais" | "nivel") => 
                  setFormData({ ...formData, criterio_tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontos_totais">Pontos Totais</SelectItem>
                  <SelectItem value="nivel">Nível de Fidelidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="criterio_valor">
              {formData.criterio_tipo === "pontos_totais" ? "Pontos Necessários *" : "Nível Necessário *"}
            </Label>
            {formData.criterio_tipo === "pontos_totais" ? (
              <Input
                id="criterio_valor"
                type="number"
                min="1"
                value={formData.criterio_valor as number}
                onChange={(e) => setFormData({ ...formData, criterio_valor: Number(e.target.value) })}
                required
              />
            ) : (
              <Select
                value={formData.criterio_valor as string}
                onValueChange={(value) => setFormData({ ...formData, criterio_valor: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="PRATA">Prata</SelectItem>
                  <SelectItem value="OURO">Ouro</SelectItem>
                  <SelectItem value="PLATINA">Platina</SelectItem>
                  <SelectItem value="DIAMANTE">Diamante</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="compartilhavel"
              checked={formData.compartilhavel}
              onCheckedChange={(checked) => setFormData({ ...formData, compartilhavel: checked })}
            />
            <Label htmlFor="compartilhavel">
              Permitir Compartilhamento em Redes Sociais
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Badge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
