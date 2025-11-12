import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function ShowcaseComponents() {
  return (
    <div className="space-y-8">
      {/* Buttons Showcase */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Variantes de Botões</CardTitle>
          <CardDescription>Todas as variantes disponíveis com micro-interações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Tamanhos</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">i</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Variantes Padrão</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Variantes Elevated (com Glow)</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="elevated">Elevated Primary</Button>
              <Button variant="elevated-secondary">Elevated Secondary</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Variantes Coloridas (com Gradiente)</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Showcase */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Variantes de Badges</CardTitle>
          <CardDescription>Todas as variantes disponíveis com shimmer effect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Variantes Padrão</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Variantes Coloridas (com Shimmer)</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>Variante padrão sem efeitos especiais</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card básico com background padrão e border sutil.
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>Com sombra profunda e hover effect</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card elevado com sombra e transição suave no hover.
            </p>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Gradient Card</CardTitle>
            <CardDescription>Com shimmer effect animado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card com gradiente e efeito shimmer constante.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
