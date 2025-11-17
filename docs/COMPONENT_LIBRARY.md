# 📚 Biblioteca de Componentes Reutilizáveis - Ortho+

## Visão Geral

Este documento cataloga todos os componentes reutilizáveis do Ortho+, organizados por categoria. Use estes componentes ao invés de criar novos para manter consistência visual e reduzir duplicação de código.

---

## 🎯 Componentes de UI Base

### StatsCard
**Localização:** `src/components/shared/StatsCard.tsx`

Componente memoizado para exibir KPIs e estatísticas.

**Props:**
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}
```

**Exemplo:**
```tsx
<StatsCard
  title="Total de Pacientes"
  value={248}
  icon={Users}
  variant="primary"
  trend={{ value: 12, label: 'vs mês anterior', isPositive: true }}
/>
```

**Variants:**
- `default`: Borda padrão
- `primary`: Azul, destaque principal
- `success`: Verde, métricas positivas
- `warning`: Amarelo, atenção necessária
- `danger`: Vermelho, alertas críticos

---

### TableFilter
**Localização:** `src/components/shared/TableFilter.tsx`

Componente genérico para filtros de tabelas com busca e dropdowns.

**Props:**
```tsx
interface TableFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onClear?: () => void;
}
```

**Exemplo:**
```tsx
<TableFilter
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Buscar por nome ou CPF..."
  filters={[
    {
      label: 'Status',
      value: statusFilter,
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Ativos', value: 'ativo' },
        { label: 'Inativos', value: 'inativo' }
      ],
      onChange: setStatusFilter
    },
    {
      label: 'Risco',
      value: riskFilter,
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Crítico', value: 'critico' },
        { label: 'Alto', value: 'alto' }
      ],
      onChange: setRiskFilter
    }
  ]}
  onClear={() => {
    setSearch('');
    setStatusFilter('all');
    setRiskFilter('all');
  }}
/>
```

**Recursos:**
- Responsivo (mobile-first)
- Botão "Limpar" aparece automaticamente quando há filtros ativos
- Ícone de busca integrado
- Múltiplos filtros dropdown configuráveis

---

### ExportButton
**Localização:** `src/components/shared/ExportButton.tsx`

Botão dropdown para exportação de dados em CSV ou JSON.

**Props:**
```tsx
interface ExportButtonProps {
  data: any[];
  filename: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}
```

**Exemplo:**
```tsx
<ExportButton
  data={patients}
  filename="pacientes-2025"
  variant="outline"
/>
```

**Funcionalidades:**
- Exporta CSV com cabeçalhos automáticos
- Exporta JSON formatado
- Download automático com nome personalizado
- Toast notifications de sucesso/erro

---

### DateRangePicker
**Localização:** `src/components/shared/DateRangePicker.tsx`

Seletor de período com dois calendários (data inicial e final).

**Props:**
```tsx
interface DateRangePickerProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}
```

**Exemplo:**
```tsx
<DateRangePicker
  dateFrom={startDate}
  dateTo={endDate}
  onDateFromChange={setStartDate}
  onDateToChange={setEndDate}
/>
```

**Recursos:**
- Locale pt-BR automático
- Formato de data brasileiro
- Popover com calendário shadcn
- Responsivo

---

### ConfirmDialog
**Localização:** `src/components/shared/ConfirmDialog.tsx`

Dialog de confirmação padronizado para ações críticas.

**Props:**
```tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}
```

**Exemplo:**
```tsx
<ConfirmDialog
  open={isDeleteOpen}
  onOpenChange={setIsDeleteOpen}
  title="Excluir Paciente"
  description="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
  confirmText="Excluir"
  cancelText="Cancelar"
  onConfirm={handleDelete}
  variant="destructive"
/>
```

**Variants:**
- `default`: Confirmação padrão (azul)
- `destructive`: Ação perigosa (vermelho) + ícone de alerta

---

## 🎨 Componentes de Dashboard

### CategoryDashboard
**Localização:** `src/components/dashboard/CategoryDashboard.tsx`

Template para dashboards de categoria com KPIs e conteúdo customizado.

**Props:**
```tsx
interface CategoryDashboardProps {
  title: string;
  description?: string;
  kpis: KPI[];
  children?: React.ReactNode;
}

interface KPI {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}
```

**Exemplo:**
```tsx
<CategoryDashboard
  title="Dashboard Clínico"
  description="Visão geral das operações clínicas"
  kpis={[
    {
      title: 'Total de Pacientes',
      value: 248,
      icon: Users,
      variant: 'primary',
      trend: { value: 12, label: 'vs mês anterior', isPositive: true }
    },
    {
      title: 'Consultas Hoje',
      value: 15,
      icon: Calendar,
      variant: 'success'
    }
  ]}
>
  {/* Gráficos, tabelas, conteúdo customizado */}
  <Card>
    <CardHeader>
      <CardTitle>Gráfico de Consultas</CardTitle>
    </CardHeader>
    <CardContent>
      {/* ... */}
    </CardContent>
  </Card>
</CategoryDashboard>
```

**Estrutura:**
- Grid de 4 KPIs responsivo (md:grid-cols-2, lg:grid-cols-4)
- Conteúdo customizado via children
- Título e descrição configuráveis

---

## 🔧 Custom Hooks

### useTableData
**Localização:** `src/hooks/useTableData.ts`

Hook para gerenciar busca, filtro e paginação de tabelas.

**Interface:**
```tsx
interface UseTableDataProps<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialPageSize?: number;
}

// Retorna:
{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  paginatedData: T[];
  filteredData: T[];
  totalPages: number;
  totalItems: number;
}
```

**Exemplo:**
```tsx
const {
  searchTerm,
  setSearchTerm,
  paginatedData,
  filteredData,
  totalPages,
  totalItems
} = useTableData({ 
  data: patients, 
  searchFields: ['full_name', 'cpf', 'phone_primary'],
  initialPageSize: 10
});
```

**Recursos:**
- Busca em múltiplos campos simultaneamente
- Paginação automática
- Memoização para performance
- Case-insensitive

---

## 🎯 Quando Usar Cada Componente

### StatsCard
✅ **Use quando:** Precisa exibir KPIs, métricas ou estatísticas  
❌ **Não use quando:** Precisa de layout customizado complexo

### TableFilter
✅ **Use quando:** Tem listagem com busca e filtros  
❌ **Não use quando:** Filtros são muito complexos (crie componente específico)

### ExportButton
✅ **Use quando:** Precisa exportar dados tabulares  
❌ **Não use quando:** Precisa exportação PDF complexa (use jsPDF diretamente)

### DateRangePicker
✅ **Use quando:** Precisa selecionar período de datas  
❌ **Não use quando:** Precisa apenas uma data (use Calendar diretamente)

### ConfirmDialog
✅ **Use quando:** Precisa confirmação antes de ação crítica  
❌ **Não use quando:** Ação é reversível (use toast apenas)

### CategoryDashboard
✅ **Use quando:** Criando dashboard de categoria novo  
❌ **Não use quando:** Precisa layout totalmente customizado

---

## 📋 Checklist de Uso

Antes de criar um novo componente, verifique:

- [ ] Já existe componente similar na biblioteca?
- [ ] Pode ser adaptado de um existente?
- [ ] Se criar novo, será reutilizável?
- [ ] Segue padrões de design do sistema?
- [ ] Está memoizado se necessário?
- [ ] Tem tipos TypeScript completos?

---

## 🚀 Adicionando Novos Componentes

### Template
```tsx
import { memo } from 'react';

interface NewComponentProps {
  // Props aqui
}

export const NewComponent = memo(function NewComponent({
  // Destructure props
}: NewComponentProps) {
  return (
    // JSX aqui
  );
});
```

### Documentação
Ao criar novo componente reutilizável, adicione aqui:
1. Localização do arquivo
2. Props interface
3. Exemplo de uso
4. Recursos principais
5. Quando usar/não usar

---

## 📝 Convenções

### Nomenclatura
- Componentes: PascalCase (`StatsCard`)
- Hooks: camelCase com prefixo `use` (`useTableData`)
- Props interfaces: PascalCase + sufixo `Props` (`StatsCardProps`)

### Estrutura de Arquivo
```
src/components/
├── shared/          # Componentes genéricos reutilizáveis
├── dashboard/       # Componentes específicos de dashboards
└── [module]/        # Componentes específicos de módulos

src/hooks/           # Custom hooks reutilizáveis
```

### Exportação
```tsx
// ✅ Named export + memo
export const StatsCard = memo(function StatsCard() { ... });

// ❌ Default export
export default StatsCard;
```

---

## 🎨 Design System

Todos os componentes seguem o design system do Ortho+:

- **Cores:** Tokens semânticos do index.css
- **Tipografia:** Fonte Inter (variável)
- **Espaçamento:** Escala 4px
- **Bordas:** `rounded-lg` padrão
- **Sombras:** `shadow-sm` a `shadow-2xl`
- **Animações:** `transition-all duration-300`

---

## 📚 Recursos Adicionais

- [Shadcn UI Docs](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Memo](https://react.dev/reference/react/memo)
