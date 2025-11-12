import { PageHeader } from '@/components/shared/PageHeader';
import { ShowcaseComponents } from '@/components/ShowcaseComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Sparkles, Package } from 'lucide-react';

export default function StyleGuide() {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
      <PageHeader
        icon={Palette}
        title="Guia de Estilo Ortho+"
        description="Design system completo com paleta de cores, tipografia, componentes e animações"
      />

      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">
            <Package className="h-4 w-4 mr-2" />
            Componentes
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Tipografia
          </TabsTrigger>
          <TabsTrigger value="animations">
            <Sparkles className="h-4 w-4 mr-2" />
            Animações
          </TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <ShowcaseComponents />
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Paleta de Cores - Professional Dark</CardTitle>
              <CardDescription>Cores semânticas do design system Ortho+</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Primary Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Primary (Verde-Água Vibrante)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-primary shadow-lg" />
                    <p className="text-xs text-muted-foreground">primary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-primary/80 shadow-lg" />
                    <p className="text-xs text-muted-foreground">primary/80</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-primary/60 shadow-md" />
                    <p className="text-xs text-muted-foreground">primary/60</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-primary/20 shadow-sm" />
                    <p className="text-xs text-muted-foreground">primary/20</p>
                  </div>
                </div>
              </div>

              {/* Background Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Backgrounds (Super Dark)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-background border shadow-lg" />
                    <p className="text-xs text-muted-foreground">background</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-card border shadow-lg" />
                    <p className="text-xs text-muted-foreground">card</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-popover border shadow-lg" />
                    <p className="text-xs text-muted-foreground">popover</p>
                  </div>
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Cores Semânticas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50" />
                    <p className="text-xs text-muted-foreground">success</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50" />
                    <p className="text-xs text-muted-foreground">warning</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-500/50" />
                    <p className="text-xs text-muted-foreground">error</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50" />
                    <p className="text-xs text-muted-foreground">info</p>
                  </div>
                </div>
              </div>

              {/* Accent Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Accent & Borders</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-accent shadow-md" />
                    <p className="text-xs text-muted-foreground">accent</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-muted shadow-md" />
                    <p className="text-xs text-muted-foreground">muted</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-background border-2 border-border shadow-md" />
                    <p className="text-xs text-muted-foreground">border</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Hierarquia Tipográfica</CardTitle>
              <CardDescription>Sistema de tipografia Ortho+ com tracking otimizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h1 className="mb-2">Heading 1 - Display Large</h1>
                  <p className="text-xs text-muted-foreground">text-4xl font-bold tracking-tight</p>
                </div>
                <div>
                  <h2 className="mb-2">Heading 2 - Display Medium</h2>
                  <p className="text-xs text-muted-foreground">text-3xl font-semibold tracking-tight</p>
                </div>
                <div>
                  <h3 className="mb-2">Heading 3 - Section Title</h3>
                  <p className="text-xs text-muted-foreground">text-2xl font-semibold tracking-tight</p>
                </div>
                <div>
                  <h4 className="mb-2">Heading 4 - Subsection</h4>
                  <p className="text-xs text-muted-foreground">text-xl font-semibold</p>
                </div>
                <div>
                  <p className="text-base mb-2">Body Text - Parágrafo padrão para conteúdo principal</p>
                  <p className="text-xs text-muted-foreground">text-base</p>
                </div>
                <div>
                  <p className="text-sm mb-2">Small Text - Texto secundário e descrições</p>
                  <p className="text-xs text-muted-foreground">text-sm</p>
                </div>
                <div>
                  <p className="text-xs mb-2">Extra Small - Captions e metadados</p>
                  <p className="text-xs text-muted-foreground">text-xs</p>
                </div>
                <div>
                  <p className="label-primary mb-1">Label Primary</p>
                  <p className="text-xs text-muted-foreground">text-sm font-medium text-foreground</p>
                </div>
                <div>
                  <p className="label-secondary mb-1">Label Secondary</p>
                  <p className="text-xs text-muted-foreground">text-sm font-normal text-muted-foreground</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Micro-Interações & Animações</CardTitle>
              <CardDescription>Sistema de animações premium do Ortho+</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Fade In</h4>
                  <div className="p-4 bg-muted rounded-lg animate-fade-in">
                    <p className="text-sm">Elemento com animação fade-in (opacity + translateY)</p>
                  </div>
                  <p className="text-xs text-muted-foreground">animate-fade-in</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Scale In</h4>
                  <div className="p-4 bg-muted rounded-lg animate-scale-in">
                    <p className="text-sm">Elemento com animação scale-in (scale + opacity)</p>
                  </div>
                  <p className="text-xs text-muted-foreground">animate-scale-in</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Glow Effect (Hover me)</h4>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 shadow-lg hover:animate-glow cursor-pointer transition-all">
                    <p className="text-sm">Elemento com glow effect no hover</p>
                  </div>
                  <p className="text-xs text-muted-foreground">hover:animate-glow</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Shimmer Effect</h4>
                  <div className="p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg animate-shimmer">
                    <p className="text-sm">Elemento com shimmer effect contínuo</p>
                  </div>
                  <p className="text-xs text-muted-foreground">animate-shimmer</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Hover Scale</h4>
                  <div className="p-4 bg-muted rounded-lg hover-scale cursor-pointer">
                    <p className="text-sm">Elemento com scale no hover (hover me)</p>
                  </div>
                  <p className="text-xs text-muted-foreground">hover-scale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Referências Técnicas</CardTitle>
              <CardDescription>Classes e configurações disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs space-y-1">
                  <p>// Animations</p>
                  <p>animate-fade-in, animate-fade-out</p>
                  <p>animate-scale-in, animate-scale-out</p>
                  <p>animate-slide-in-right, animate-slide-out-right</p>
                  <p>animate-glow, animate-shimmer</p>
                  <p>animate-accordion-down, animate-accordion-up</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs space-y-1">
                  <p>// Utility Classes</p>
                  <p>hover-scale (hover:scale-105)</p>
                  <p>story-link (animated underline)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
