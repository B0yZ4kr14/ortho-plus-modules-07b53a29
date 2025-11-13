# Sistema de Profundidade 3D - Ortho+

## Visão Geral
O sistema de profundidade 3D do Ortho+ utiliza três níveis de intensidade para criar hierarquia visual através de sombras, bordas arredondadas e efeitos de hover.

## Níveis de Profundidade

### 1. Subtle (Sutil)
- **Uso:** Elementos secundários, informações de apoio, cards de background
- **Características:**
  - Sombra: `shadow-md` → `shadow-lg` (hover)
  - Elevação suave no hover
  - Ideal para elementos que não devem chamar muita atenção

```tsx
<Card depth="subtle">
  {/* Conteúdo */}
</Card>
```

### 2. Normal (Padrão)
- **Uso:** Maioria dos cards, elementos principais de conteúdo
- **Características:**
  - Sombra: `shadow-lg` → `shadow-xl` (hover)
  - Elevação moderada no hover (`-translate-y-0.5` ou `-translate-y-1`)
  - Bordas arredondadas `rounded-2xl`
  - **Este é o nível padrão do sistema**

```tsx
<Card depth="normal">
  {/* Conteúdo */}
</Card>

// Ou simplesmente (normal é o padrão):
<Card>
  {/* Conteúdo */}
</Card>
```

### 3. Intense (Intenso)
- **Uso:** Elementos de destaque, CTAs importantes, dashboards de KPI
- **Características:**
  - Sombra: `shadow-xl` → `shadow-2xl` (hover)
  - Elevação pronunciada no hover
  - Efeitos adicionais como rotação, escala
  - Máxima profundidade visual

```tsx
<Card depth="intense">
  {/* Conteúdo */}
</Card>
```

## Variantes de Card + Profundidade

O sistema combina **variants** (estilo/propósito) com **depth** (intensidade visual):

```tsx
// Card padrão com profundidade normal
<Card variant="default" depth="normal" />

// Card interativo com profundidade intensa
<Card variant="interactive" depth="intense" />

// Card de métrica com profundidade sutil
<Card variant="metric" depth="subtle" />

// Card elevado (já tem sombras fortes) com profundidade adicional
<Card variant="elevated" depth="intense" />

// Card com gradiente e profundidade intensa
<Card variant="gradient" depth="intense" />
```

## Componentes que Implementam o Sistema

### 1. **StatCard** (Cards de Estatísticas)
- Usa `depth="normal"` por padrão
- Variant: `metric`
- Ícone: `shadow-lg` com `rounded-xl`

```tsx
<StatCard
  label="Total de Pacientes"
  value={234}
  icon={Users}
  iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
  borderColor="border-l-blue-500"
/>
```

### 2. **ModuleCard** (Cards de Módulos)
- Usa `depth="normal"` por padrão
- Variant: `interactive`
- Hover: `-translate-y-1` + `scale-110` no ícone

```tsx
<ModuleCard
  title="Pacientes"
  subtitle="Gerenciar pacientes"
  icon={Users}
  color="bg-gradient-to-br from-blue-500 to-blue-600"
  onClick={() => navigate('/pacientes')}
/>
```

### 3. **ActionCard** (Cards de Ação Rápida)
- Usa `depth="normal"` por padrão
- Variant: `interactive`
- Efeitos: Ripple + Rotate + Scale no hover

```tsx
<ActionCard
  title="Novo Paciente"
  subtitle="Cadastrar paciente"
  icon={UserPlus}
  bgColor="bg-gradient-to-br from-primary to-primary/80"
  route="/pacientes"
/>
```

## Efeitos Visuais Complementares

### Bordas Arredondadas
- Padrão do sistema: `rounded-2xl` (1rem)
- Ícones e elementos internos: `rounded-xl` (0.75rem)
- Elementos pequenos: `rounded-lg` (0.5rem)

### Gradientes
Todos os ícones e backgrounds usam gradientes sutis:
```tsx
className="bg-gradient-to-br from-primary to-primary/80"
```

### Hover Effects
Combinação de múltiplos efeitos:
- **Elevação:** `-translate-y-0.5`, `-translate-y-1`
- **Sombra:** `hover:shadow-xl`, `hover:shadow-2xl`
- **Escala:** `hover:scale-105`, `hover:scale-110`
- **Rotação:** `hover:rotate-3` (sutil, apenas em alguns casos)
- **Backdrop Blur:** `backdrop-blur-sm`, `backdrop-blur-md`

### Transições
Todas as transições usam:
```tsx
className="transition-all duration-300"
```

## Guidelines de Uso

### Quando usar cada profundidade:

**Subtle:**
- Sidebars e menus secundários
- Tooltips e popovers
- Informações complementares
- Elementos de fundo

**Normal (Padrão):**
- Cards de conteúdo principal
- Listagens
- Formulários
- Dashboards gerais
- **90% dos casos devem usar este nível**

**Intense:**
- Dashboards de KPI executivos
- Cards de destaque/hero
- CTAs principais
- Modais importantes
- Elementos que exigem atenção imediata

### Hierarquia Visual

Para criar profundidade em uma página:
1. **Background:** Subtle ou sem sombra
2. **Conteúdo principal:** Normal
3. **Destaque/Ação:** Intense

Exemplo de hierarquia no Dashboard:
```tsx
// Header e breadcrumbs: Intense (ponto focal)
<header className="shadow-2xl rounded-b-3xl">

// Cards de estatísticas: Normal
<StatCard depth="normal" />

// Ações rápidas: Normal com hover intense
<ActionCard depth="normal" />

// Informações secundárias: Subtle
<Card depth="subtle">
  <p className="text-muted-foreground">Informação complementar</p>
</Card>
```

## Acessibilidade

O sistema de profundidade mantém conformidade WCAG AAA:
- Contraste mínimo 7:1 preservado
- Sombras não afetam legibilidade
- Focus states visíveis em todos os níveis
- Navegação por teclado funcional

## Exemplos Práticos

### Dashboard Principal
```tsx
{/* KPIs com profundidade normal */}
<div className="grid grid-cols-4 gap-4">
  <StatCard depth="normal" {...props} />
  <StatCard depth="normal" {...props} />
  <StatCard depth="normal" {...props} />
  <StatCard depth="normal" {...props} />
</div>

{/* Ações rápidas com profundidade normal */}
<div className="grid grid-cols-4 gap-4">
  <ActionCard depth="normal" {...props} />
  <ActionCard depth="normal" {...props} />
  <ActionCard depth="normal" {...props} />
  <ActionCard depth="normal" {...props} />
</div>
```

### Página de Módulos
```tsx
{/* Módulos disponíveis com profundidade normal */}
<div className="grid grid-cols-3 gap-6">
  <ModuleCard depth="normal" {...props} />
  <ModuleCard depth="normal" {...props} />
  <ModuleCard depth="normal" {...props} />
</div>
```

### Modal Importante
```tsx
{/* Modal com profundidade intensa para chamar atenção */}
<Dialog>
  <DialogContent>
    <Card depth="intense" className="p-6">
      <h2>Ação Crítica</h2>
      <p>Esta ação não pode ser desfeita</p>
    </Card>
  </DialogContent>
</Dialog>
```

## Atualização do Sistema

Para adicionar novos componentes ao sistema de profundidade:

1. Import o Card component
2. Use as props `variant` e `depth`
3. Adicione hover effects complementares
4. Mantenha bordas arredondadas consistentes
5. Use gradientes sutis nos backgrounds
6. Aplique `transition-all duration-300`

```tsx
import { Card } from '@/components/ui/card';

export function NovoComponente() {
  return (
    <Card 
      variant="default" 
      depth="normal"
      className="p-6 hover:-translate-y-1"
    >
      {/* Conteúdo */}
    </Card>
  );
}
```

## Manutenção

O sistema de profundidade é centralizado em:
- **Componente:** `src/components/ui/card.tsx`
- **Variants:** Definidos via `class-variance-authority`
- **CSS Base:** `src/index.css` (variáveis de sombra)

Para ajustar globalmente as sombras, edite as variáveis CSS:
```css
:root {
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 20px 30px rgba(0, 0, 0, 0.2);
  --shadow-2xl: 0 30px 40px rgba(0, 0, 0, 0.25);
}
```
