import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SplitConfigForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Regra de Split</CardTitle>
        <CardDescription>
          Defina como os pagamentos serão divididos entre profissionais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="professional">Profissional</Label>
            <Select>
              <SelectTrigger id="professional">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Dr. João Silva</SelectItem>
                <SelectItem value="2">Dra. Maria Santos</SelectItem>
                <SelectItem value="3">Dr. Pedro Costa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage">Percentual (%)</Label>
            <Input
              id="percentage"
              type="number"
              placeholder="65"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="procedure">Procedimento</Label>
          <Select>
            <SelectTrigger id="procedure">
              <SelectValue placeholder="Selecione o procedimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os procedimentos</SelectItem>
              <SelectItem value="implante">Implante</SelectItem>
              <SelectItem value="ortodontia">Ortodontia</SelectItem>
              <SelectItem value="limpeza">Limpeza</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar Regra</Button>
        </div>
      </CardContent>
    </Card>
  );
}
