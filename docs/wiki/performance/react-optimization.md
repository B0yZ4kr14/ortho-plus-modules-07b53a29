# ⚡ Otimização React - Ortho+ V4.0

## 🎯 Estratégias de Performance

Este documento detalha as estratégias de otimização implementadas no Ortho+ V4.0 para garantir performance de nível mundial.

---

## 1. React.memo - Componentes Memoizados

### O que é?
`React.memo` é um Higher-Order Component que memoiza componentes, evitando re-renders desnecessários quando as props não mudam.

### Quando usar?
- ✅ Componentes "puros" (mesmo input = mesmo output)
- ✅ Componentes renderizados frequentemente
- ✅ Componentes com lógica de renderização pesada
- ✅ Listas com muitos itens

### Quando NÃO usar?
- ❌ Componentes que sempre mudam
- ❌ Componentes muito simples (overhead não compensa)
- ❌ Props que sempre mudam (ex: funções inline)

### Exemplos no Ortho+

#### 1. StatCardMemo - Cards de Estatísticas
```typescript
// src/components/dashboard/StatCardMemo.tsx
import React, { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  trend?: { value: number; isPositive: boolean };
}

export const StatCardMemo = memo<StatCardProps>(({ 
  title, 
  value, 
  icon: Icon, 
  trend 
}) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
        {trend && (
          <div className="mt-2 text-sm">
            <span className={trend.isPositive ? 'text-success' : 'text-destructive'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar ainda mais
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.icon === nextProps.icon &&
    JSON.stringify(prevProps.trend) === JSON.stringify(nextProps.trend)
  );
});

StatCardMemo.displayName = 'StatCardMemo';
```

#### 2. DashboardChartsMemo - Gráficos do Dashboard
```typescript
// src/components/dashboard/DashboardChartsMemo.tsx
export const DashboardChartsMemo = memo<DashboardChartsProps>(({ 
  appointmentsData, 
  revenueData 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BarChart data={appointmentsData} />
      <LineChart data={revenueData} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação profunda de arrays
  return (
    JSON.stringify(prevProps.appointmentsData) === JSON.stringify(nextProps.appointmentsData) &&
    JSON.stringify(prevProps.revenueData) === JSON.stringify(nextProps.revenueData)
  );
});
```

#### 3. LeadKanbanMemo - Kanban de Leads (CRM)
```typescript
// src/components/crm/LeadKanbanMemo.tsx
export const LeadKanbanMemo = memo<LeadKanbanProps>(({ 
  leads, 
  stages, 
  onMoveStage 
}) => {
  // useMemo para agrupar leads por estágio
  const leadsByStage = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(lead => lead.stageId === stage.id);
      return acc;
    }, {});
  }, [leads, stages]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {stages.map(stage => (
        <StageColumn key={stage.id} leads={leadsByStage[stage.id]} />
      ))}
    </div>
  );
});
```

---

## 2. useMemo - Memoização de Valores

### O que é?
`useMemo` memoiza o **resultado** de cálculos pesados, evitando recomputação em cada render.

### Quando usar?
- ✅ Cálculos complexos
- ✅ Filtragem/transformação de arrays grandes
- ✅ Criação de objetos/arrays que são passados como props
- ✅ Operações de agregação (soma, média, etc.)

### Exemplos no Ortho+

#### 1. Métricas do Dashboard
```typescript
// src/pages/Dashboard.tsx
export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  // Calcular métricas apenas quando transactions mudar
  const metrics = useMemo(() => {
    const totalReceitas = transactions
      .filter(t => t.type === 'RECEITA')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDespesas = transactions
      .filter(t => t.type === 'DESPESA')
      .reduce((sum, t) => sum + t.amount, 0);

    const saldo = totalReceitas - totalDespesas;

    return { totalReceitas, totalDespesas, saldo };
  }, [transactions]);

  return <div>{/* usar metrics */}</div>;
}
```

#### 2. Filtragem de Produtos em Estoque
```typescript
// src/pages/estoque/EstoqueDashboard.tsx
export function EstoqueDashboard() {
  const { produtos } = useProdutos();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // Filtrar produtos apenas quando dependências mudarem
  const filteredProdutos = useMemo(() => {
    return produtos
      .filter(p => {
        const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || p.categoria === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, searchTerm, category]);

  return <ProdutosList produtos={filteredProdutos} />;
}
```

#### 3. Agrupamento de Campanhas
```typescript
// src/modules/marketing-auto/presentation/hooks/useCampaigns.ts
export function useCampaigns() {
  const { campaigns } = useQuery(...);

  const metrics = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'ATIVA').length;
    const draft = campaigns.filter(c => c.status === 'RASCUNHO').length;
    const completed = campaigns.filter(c => c.status === 'CONCLUIDA').length;
    
    const totalSent = campaigns.reduce((sum, c) => sum + c.getTotalSent(), 0);
    const avgOpenRate = totalSent > 0 
      ? campaigns.reduce((sum, c) => sum + c.getOpenRate(), 0) / campaigns.length
      : 0;

    return { active, draft, completed, totalSent, avgOpenRate };
  }, [campaigns]);

  return { campaigns, metrics };
}
```

---

## 3. useCallback - Memoização de Funções

### O que é?
`useCallback` memoiza **funções**, evitando que sejam recriadas a cada render.

### Quando usar?
- ✅ Funções passadas como props para componentes memoizados
- ✅ Dependências de useEffect
- ✅ Event handlers em listas grandes

### Exemplo no Ortho+

```typescript
// src/modules/crm/presentation/hooks/useLeadsMemo.ts
export function useLeadsMemo() {
  const { createLead: createLeadMutation } = useMutation(...);

  // Memoizar callback para evitar re-renders de componentes filhos
  const createLead = useCallback(
    (data: CreateLeadInput) => createLeadMutation(data),
    [createLeadMutation]
  );

  const updateLeadStage = useCallback(
    (leadId: string, stageId: string) => {
      // lógica...
    },
    [/* dependências */]
  );

  return { createLead, updateLeadStage };
}
```

---

## 4. React Query - Cache e Invalidação

### Estratégia
O Ortho+ usa **React Query** para gerenciar estado servidor com cache inteligente:

```typescript
// Configuração global (src/main.tsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      refetchOnWindowFocus: false,
    },
  },
});
```

### Invalidação Seletiva
```typescript
// Após uma mutação, invalidar apenas queries relacionadas
const createMutation = useMutation({
  mutationFn: createLead,
  onSuccess: () => {
    // Invalidar apenas leads, não o dashboard inteiro
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  },
});
```

---

## 5. Virtualização - react-window

### Quando usar?
Para listas com **100+ itens** (ex: lista de pacientes, produtos, transações).

### Exemplo (TODO)
```typescript
import { FixedSizeList } from 'react-window';

function ProdutosVirtualList({ produtos }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProdutoCard produto={produtos[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={produtos.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

## 6. Lazy Loading - Code Splitting

### Rotas
```typescript
// src/App.tsx
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const PEP = lazy(() => import('@/pages/PEP'));
const Financeiro = lazy(() => import('@/pages/financeiro/Dashboard'));

// Lazy loading com Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/pep" element={<PEP />} />
    <Route path="/financeiro" element={<Financeiro />} />
  </Routes>
</Suspense>
```

### Componentes Pesados
```typescript
const PDFViewer = lazy(() => import('@/components/PDFViewer'));

// Só carregar quando necessário
{showPDF && (
  <Suspense fallback={<div>Carregando PDF...</div>}>
    <PDFViewer url={pdfUrl} />
  </Suspense>
)}
```

---

## 7. Debounce em Inputs

### Busca em Tempo Real
```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

function SearchPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data: patients } = useQuery({
    queryKey: ['patients', debouncedSearch],
    queryFn: () => searchPatients(debouncedSearch),
    enabled: debouncedSearch.length >= 3,
  });

  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

---

## 📊 Métricas de Performance

### Targets (Core Web Vitals)
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅
- **TTI** (Time to Interactive): < 3s ✅

### Ferramentas de Medição
- **Lighthouse**: Score > 90
- **React DevTools Profiler**: Identificar re-renders
- **Bundle Analyzer**: Tamanho dos chunks

---

## ✅ Checklist de Otimização

Ao criar novos componentes:

- [ ] Componente é "puro"? → Use `React.memo`
- [ ] Cálculos pesados? → Use `useMemo`
- [ ] Função como prop? → Use `useCallback`
- [ ] Lista com 100+ itens? → Use virtualização
- [ ] Componente grande/raro? → Use lazy loading
- [ ] Input em tempo real? → Use debounce
- [ ] Busca no servidor? → Use React Query

---

## 📚 Referências

- [React Optimization Docs](https://react.dev/learn/render-and-commit)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Web Vitals](https://web.dev/vitals/)

---

**Autor**: Ortho+ Team  
**Versão**: 4.0  
**Data**: Novembro 2025
