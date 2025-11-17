import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Usb, Wifi, WifiOff, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HardwareWallet {
  id: string;
  name: string;
  type: 'krux' | 'jade' | 'seedsigner' | 'coldcard' | 'other';
  xpub: string;
  fingerprint: string;
  multisig: boolean;
  isActive: boolean;
}

export function HardwareWalletConfig() {
  const [wallets, setWallets] = useState<HardwareWallet[]>([]);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'krux' as const,
    xpub: '',
    fingerprint: '',
    multisig: false
  });

  const handleAddWallet = () => {
    if (!newWallet.name || !newWallet.xpub) return;

    const wallet: HardwareWallet = {
      id: crypto.randomUUID(),
      ...newWallet,
      isActive: true
    };

    setWallets([...wallets, wallet]);
    setNewWallet({
      name: '',
      type: 'krux',
      xpub: '',
      fingerprint: '',
      multisig: false
    });
  };

  const handleRemoveWallet = (id: string) => {
    setWallets(wallets.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Carteiras Offline (Air-Gapped) fornecem máxima segurança mantendo suas chaves privadas completamente isoladas da internet.
          Recomendamos{' '}
          <a 
            href="https://dseclab.io/br/products/coldkitx?campaign_id=120231315734340647&ad_id=120231315973490647" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            COLDMULTI/KRUX
            <ExternalLink className="h-3 w-3" />
          </a>
          {' '}para configuração 100% offline e open-source.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Carteira Offline</CardTitle>
          <CardDescription>
            Configure carteiras hardware como KRUX, Blockstream Jade, SeedSigner ou Coldcard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Nome da Carteira</Label>
              <Input
                id="wallet-name"
                placeholder="Ex: KRUX Principal"
                value={newWallet.name}
                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-type">Tipo de Hardware</Label>
              <Select
                value={newWallet.type}
                onValueChange={(value: any) => setNewWallet({ ...newWallet, type: value })}
              >
                <SelectTrigger id="wallet-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="krux">KRUX (Recomendado)</SelectItem>
                  <SelectItem value="jade">Blockstream Jade</SelectItem>
                  <SelectItem value="seedsigner">SeedSigner</SelectItem>
                  <SelectItem value="coldcard">Coldcard</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="xpub">xPub (Chave Pública Estendida)</Label>
            <Input
              id="xpub"
              placeholder="xpub..."
              value={newWallet.xpub}
              onChange={(e) => setNewWallet({ ...newWallet, xpub: e.target.value })}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Exporte o xPub do seu dispositivo através de QR Code ou cartão SD
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fingerprint">Fingerprint (Opcional)</Label>
            <Input
              id="fingerprint"
              placeholder="00000000"
              value={newWallet.fingerprint}
              onChange={(e) => setNewWallet({ ...newWallet, fingerprint: e.target.value })}
              maxLength={8}
              className="font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="multisig"
              checked={newWallet.multisig}
              onChange={(e) => setNewWallet({ ...newWallet, multisig: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="multisig" className="cursor-pointer">
              Configurar Multi-Assinatura (2-of-3 ou superior)
            </Label>
          </div>

          <Button onClick={handleAddWallet} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Carteira Offline
          </Button>
        </CardContent>
      </Card>

      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Carteiras Configuradas</CardTitle>
            <CardDescription>
              {wallets.length} carteira{wallets.length > 1 ? 's' : ''} offline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <WifiOff className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{wallet.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {wallet.type.toUpperCase()}
                        </Badge>
                        {wallet.multisig && (
                          <Badge variant="secondary" className="text-xs">
                            Multi-Sig
                          </Badge>
                        )}
                        {wallet.fingerprint && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {wallet.fingerprint}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWallet(wallet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança Máxima:</strong> As transações devem ser assinadas offline no dispositivo hardware.
          O sistema gerará PSBTs (Partially Signed Bitcoin Transactions) que você pode assinar via QR Code ou cartão SD,
          mantendo suas chaves privadas sempre offline.
        </AlertDescription>
      </Alert>
    </div>
  );
}
