/**
 * XPub Configuration Form
 * Formulário para configuração de Hardware Wallets (non-custodial)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, TestTube, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";

const xpubConfigSchema = z.object({
  wallet_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  hardware_type: z.string().min(1, "Selecione o tipo de hardware wallet"),
  xpub: z
    .string()
    .min(100, "xPub inválido - muito curto")
    .regex(
      /^(xpub|ypub|zpub|tpub|upub|vpub)[a-zA-Z0-9]+$/,
      "Formato de xPub inválido",
    ),
  derivation_path: z.string().default("m/84'/0'/0'/0"),
  address_type: z.string().default("p2wpkh"),
  notes: z.string().optional(),
});

interface XPubConfigFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function XPubConfigForm({ onSuccess, onCancel }: XPubConfigFormProps) {
  const [testingXPub, setTestingXPub] = useState(false);
  const [testAddress, setTestAddress] = useState<string>("");
  const [isValid, setIsValid] = useState(false);

  const form = useForm({
    resolver: zodResolver(xpubConfigSchema),
    defaultValues: {
      wallet_name: "",
      hardware_type: "trezor",
      xpub: "",
      derivation_path: "m/84'/0'/0'/0",
      address_type: "p2wpkh",
      notes: "",
    },
  });

  const handleTestXPub = async () => {
    const xpub = form.getValues("xpub");
    const derivationPath = form.getValues("derivation_path");

    if (!xpub) {
      toast.error("Insira a xPub antes de testar");
      return;
    }

    setTestingXPub(true);
    try {
      const data = await apiClient.post<any>("/functions/v1/validate-xpub", {
        xpub,
        derivationPath,
        index: 0, // Testar endereço índice 0
      });

      setTestAddress(data.address);
      setIsValid(true);
      toast.success("xPub validado com sucesso!");
    } catch (error: any) {
      console.error("Error validating xPub:", error);
      toast.error("xPub inválido ou erro ao validar");
      setIsValid(false);
    } finally {
      setTestingXPub(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof xpubConfigSchema>) => {
    if (!isValid) {
      toast.error("Por favor, teste a xPub antes de salvar");
      return;
    }

    try {
      await apiClient.post("/functions/v1/manage-offline-wallet", {
        action: "create",
        ...values,
      });

      toast.success("Wallet offline configurada com sucesso!");
      form.reset();
      setTestAddress("");
      setIsValid(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving offline wallet:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Hardware Wallet (Não-Custodial)</CardTitle>
        <CardDescription>
          O Ortho+ <strong>NUNCA</strong> terá acesso às suas chaves privadas.
          Configure sua Hardware Wallet (Trezor, Coldcard, KRUX) para gerar
          endereços de recebimento.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome da Wallet */}
            <FormField
              control={form.control}
              name="wallet_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Wallet</FormLabel>
                  <FormControl>
                    <Input placeholder="Trezor Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Hardware */}
            <FormField
              control={form.control}
              name="hardware_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Hardware Wallet</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trezor">Trezor</SelectItem>
                      <SelectItem value="coldcard">Coldcard</SelectItem>
                      <SelectItem value="krux">KRUX (DIY)</SelectItem>
                      <SelectItem value="ledger">Ledger</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* xPub */}
            <FormField
              control={form.control}
              name="xpub"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extended Public Key (xPub/yPub/zPub)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKp5KUMRmD9YgoWDbEVpLFgje71pRAVBPX6DCmV9HNTLr8GHqKZANvNcFpSZe3kiKsH5Ej7ApG1NVDK"
                      rows={3}
                      className="font-mono text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    ⚠️ Exporte APENAS a xPub da sua wallet. NUNCA a chave
                    privada (seed).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Derivation Path */}
            <FormField
              control={form.control}
              name="derivation_path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Derivation Path</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="m/84'/0'/0'/0">
                        BIP84 (bc1...) - SegWit Native
                      </SelectItem>
                      <SelectItem value="m/49'/0'/0'/0">
                        BIP49 (3...) - SegWit Wrapped
                      </SelectItem>
                      <SelectItem value="m/44'/0'/0'/0">
                        BIP44 (1...) - Legacy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Recomendado: BIP84 (endereços bc1... - menores taxas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Wallet para recebimentos de implantes"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teste de Validação */}
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                <strong>Verificação:</strong> Gere um endereço de teste para
                confirmar que a xPub está correta.
              </AlertDescription>
            </Alert>

            <Button
              type="button"
              onClick={handleTestXPub}
              variant="outline"
              disabled={testingXPub || !form.watch("xpub")}
              className="w-full gap-2"
            >
              {testingXPub ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  Testar xPub (Gerar Endereço #0)
                </>
              )}
            </Button>

            {testAddress && (
              <Card className="p-4 bg-muted">
                <p className="font-mono text-sm break-all">{testAddress}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Confirme que este endereço bate com o da sua wallet (índice
                  0)
                </p>
              </Card>
            )}

            {/* Ações */}
            <div className="flex gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isValid}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Configuração
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
