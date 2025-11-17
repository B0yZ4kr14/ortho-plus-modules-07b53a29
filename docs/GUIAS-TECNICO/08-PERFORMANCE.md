# Guia Técnico: Otimização de Performance

**Audiência:** Desenvolvedores  
**Nível:** Avançado  
**Versão:** 4.0.0

---

## Visão Geral

Este guia detalha técnicas de otimização de performance aplicadas no Ortho+, incluindo React optimization, bundle size, database queries e network requests.

---

## React Performance

### 1. React.memo

**Prevenir re-renders desnecessários em componentes puros:**

```typescript
// ❌ BAD: Re-renderiza sempre que parent re-renderizar
export function PatientCard({ patient, onEdit }) {
  return (
    <Card>
      <h3>{patient.name}</h3>
      <Button onClick={() => onEdit(patient.id)}>Editar</Button>
    </Card>
  );
}

// ✅ GOOD: Só re-renderiza se props mudarem
export const PatientCard = React.memo(({ patient, onEdit }) => {
  return (
    <Card>
      <h3>{patient.name}</h3>
      <Button onClick={() => onEdit(patient.id)}>Editar</Button>
    </Card>
  );
});

// ✅ BETTER: Com comparação customizada
export const PatientCard = React.memo(
  ({ patient, onEdit }) => {
    return (
      <Card>
        <h3>{patient.name}</h3>
        <Button onClick={() => onEdit(patient.id)}>Editar</Button>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Retornar true = não re-renderizar
    return prevProps.patient.id === nextProps.patient.id &&
           prevProps.patient.name === nextProps.patient.name;
  }
);
```

### 2. useCallback

**Memoizar callbacks para evitar recriação:**

```typescript
// ❌ BAD: Função recriada a cada render
function PatientsList({ patients }) {
  const handleEdit = (id) => {
    // ... edit logic
  };

  return patients.map(patient => (
    <PatientCard patient={patient} onEdit={handleEdit} />
  ));
}

// ✅ GOOD: Callback memoizado
function PatientsList({ patients }) {
  const handleEdit = useCallback((id) => {
    // ... edit logic
  }, []); // Sem dependências, nunca recria

  return patients.map(patient => (
    <PatientCard patient={patient} onEdit={handleEdit} />
  ));
}

// ✅ BETTER: Com dependências corretas
function PatientsList({ patients, onSave }) {
  const handleEdit = useCallback((id) => {
    const patient = patients.find(p => p.id === id);
    onSave(patient);
  }, [patients, onSave]); // Recria apenas se mudarem

  return patients.map(patient => (
    <PatientCard patient={patient} onEdit={handleEdit} />
  ));
}
```

### 3. useMemo

**Memoizar valores computados caros:**

```typescript
// ❌ BAD: Recalcula toda vez
function TransactionsList({ transactions }) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const average = total / transactions.length;
  const max = Math.max(...transactions.map(t => t.amount));

  return <div>Total: {total}, Média: {average}, Máximo: {max}</div>;
}

// ✅ GOOD: Memoizado
function TransactionsList({ transactions }) {
  const stats = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const average = total / transactions.length;
    const max = Math.max(...transactions.map(t => t.amount));
    return { total, average, max };
  }, [transactions]);

  return (
    <div>
      Total: {stats.total}, Média: {stats.average}, Máximo: {stats.max}
    </div>
  );
}
```

### 4. Virtualização de Listas

**Para listas com milhares de itens:**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function PatientsList({ patients }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Altura estimada de cada item
    overscan: 5 // Renderizar 5 itens extras fora da tela
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const patient = patients[virtualRow.index];
          return (
            <div
              key={patient.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <PatientCard patient={patient} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 5. Code Splitting

**Lazy loading de rotas:**

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ❌ BAD: Carrega tudo no bundle inicial
import Pacientes from './pages/Pacientes';
import Agenda from './pages/Agenda';
import Financeiro from './pages/Financeiro';

// ✅ GOOD: Lazy loading
const Pacientes = lazy(() => import('./pages/Pacientes'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Financeiro = lazy(() => import('./pages/Financeiro'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/financeiro" element={<Financeiro />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Database Performance

### 1. Indexes

**Criar índices para queries frequentes:**

```sql
-- ❌ BAD: Query lenta em tabela grande
SELECT * FROM pacientes WHERE cpf = '123.456.789-00';
-- Sem índice: Full table scan (milhares de registros)

-- ✅ GOOD: Criar índice
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
-- Com índice: Busca direta (milissegundos)

-- Índices compostos para queries com múltiplos filtros
CREATE INDEX idx_appointments_clinic_date 
ON appointments(clinic_id, start_time);

-- Índices parciais para economizar espaço
CREATE INDEX idx_active_patients 
ON pacientes(clinic_id, name) 
WHERE is_active = true;
```

### 2. Query Optimization

**Evitar N+1 queries:**

```typescript
// ❌ BAD: N+1 queries
const patients = await supabase.from('pacientes').select('*');

for (const patient of patients) {
  // 1 query por paciente!
  const appointments = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id);
  
  patient.appointments = appointments.data;
}

// ✅ GOOD: Usar joins
const patients = await supabase
  .from('pacientes')
  .select(`
    *,
    appointments(*)
  `);
// 1 única query com JOIN
```

### 3. Pagination

**Nunca carregar todos os registros de uma vez:**

```typescript
// ❌ BAD: Carregar tudo
const { data } = await supabase
  .from('pacientes')
  .select('*');
// Retorna 10.000+ pacientes

// ✅ GOOD: Paginação
const PAGE_SIZE = 20;

const { data, count } = await supabase
  .from('pacientes')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

// Retorna apenas 20 pacientes por vez
```

### 4. Caching com React Query

**Cache automático de queries:**

```typescript
import { useQuery } from '@tanstack/react-query';

function usePatients(clinicId: string) {
  return useQuery({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .eq('clinic_id', clinicId);
      return data;
    },
    staleTime: 5 * 60 * 1000, // Considerar fresh por 5 minutos
    cacheTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    refetchOnWindowFocus: false // Não refetch ao focar janela
  });
}

// React Query cacheia automaticamente
// Segunda chamada com mesmo clinicId = instant (cache)
```

---

## Network Performance

### 1. Debouncing de Inputs

**Reduzir requisições em busca:**

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function SearchPatients() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500); // 500ms delay

  const { data } = useQuery({
    queryKey: ['patients', debouncedSearch],
    queryFn: () => searchPatients(debouncedSearch),
    enabled: debouncedSearch.length > 2 // Só buscar com 3+ caracteres
  });

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar paciente..."
    />
  );
}
```

### 2. Request Deduplication

**React Query faz automaticamente:**

```typescript
// Múltiplos componentes chamando mesma query
function PatientProfile() {
  const { data } = usePatient(patientId); // Query 1
  return <Profile patient={data} />;
}

function PatientAppointments() {
  const { data } = usePatient(patientId); // Query 2
  return <Appointments patient={data} />;
}

// React Query detecta queries idênticas
// Faz apenas 1 requisição HTTP
// Ambos componentes recebem mesmo resultado (cache)
```

### 3. Prefetching

**Carregar dados antecipadamente:**

```typescript
import { useQueryClient } from '@tanstack/react-query';

function PatientsListItem({ patient }) {
  const queryClient = useQueryClient();

  return (
    <Card
      onMouseEnter={() => {
        // Prefetch ao passar mouse
        queryClient.prefetchQuery({
          queryKey: ['patient', patient.id],
          queryFn: () => fetchPatientDetails(patient.id)
        });
      }}
    >
      <Link to={`/pacientes/${patient.id}`}>
        {patient.name}
      </Link>
    </Card>
  );
}

// Quando usuário clicar, dados já estão em cache
```

---

## Bundle Size Optimization

### 1. Analisar Bundle

```bash
npm run build

# Analisar tamanho
npx vite-bundle-visualizer
```

**Identificar bibliotecas pesadas:**
```
chunk-ABCD1234.js (2.3 MB)
├── react-dom (150 KB)
├── @radix-ui/... (800 KB) ⚠️ Pesado!
├── recharts (1.2 MB) ⚠️ Muito pesado!
└── outros (150 KB)
```

### 2. Tree Shaking

**Importar apenas o necessário:**

```typescript
// ❌ BAD: Importa biblioteca inteira
import _ from 'lodash';
const result = _.groupBy(data, 'category');

// ✅ GOOD: Importa apenas função necessária
import groupBy from 'lodash/groupBy';
const result = groupBy(data, 'category');

// ✅ BETTER: Usar função nativa quando possível
const result = Object.groupBy(data, item => item.category);
```

### 3. Dynamic Imports

**Carregar apenas quando necessário:**

```typescript
// ❌ BAD: Carregar jsPDF no bundle inicial
import jsPDF from 'jspdf';

function exportPDF() {
  const doc = new jsPDF();
  // ...
}

// ✅ GOOD: Dynamic import
async function exportPDF() {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // ...
}
```

---

## Image Optimization

### 1. Format Correto

```typescript
// ✅ Use WebP para fotos (menor tamanho)
<img src="patient-photo.webp" alt="..." />

// ✅ Use SVG para ícones (escalável)
<img src="icon.svg" alt="..." />

// ✅ Use PNG apenas quando necessário (transparência)
<img src="logo.png" alt="..." />
```

### 2. Responsive Images

```typescript
<img
  src="patient-400w.webp"
  srcSet="
    patient-400w.webp 400w,
    patient-800w.webp 800w,
    patient-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Paciente"
  loading="lazy"
/>
```

### 3. Lazy Loading

```typescript
// Nativo
<img src="large-image.jpg" loading="lazy" alt="..." />

// Com Intersection Observer
import { useInView } from 'react-intersection-observer';

function LazyImage({ src, alt }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div ref={ref}>
      {inView ? (
        <img src={src} alt={alt} />
      ) : (
        <div style={{ height: 200, background: '#eee' }} />
      )}
    </div>
  );
}
```

---

## CSS Performance

### 1. Tailwind Purge

**Remover CSS não usado:**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  // Tailwind automaticamente remove classes não usadas
};
```

### 2. CSS-in-JS Performance

```typescript
// ❌ BAD: Styles recriados a cada render
function Component() {
  return (
    <div style={{ color: 'red', fontSize: '16px' }}>
      {/* Objeto recriado toda vez */}
    </div>
  );
}

// ✅ GOOD: Usar Tailwind (classes estáticas)
function Component() {
  return (
    <div className="text-red-500 text-base">
      {/* Sem overhead de runtime */}
    </div>
  );
}
```

---

## Monitoring Performance

### 1. Web Vitals

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Enviar para analytics
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. React DevTools Profiler

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id, // ID do Profiler
  phase, // "mount" ou "update"
  actualDuration, // Tempo gasto renderizando
  baseDuration, // Tempo estimado sem memoization
  startTime, // Quando começou
  commitTime // Quando commitou
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="PatientsList" onRender={onRenderCallback}>
      <PatientsList />
    </Profiler>
  );
}
```

---

## Performance Checklist

### React

- [ ] Usar React.memo em listas grandes
- [ ] useCallback para callbacks passados como props
- [ ] useMemo para cálculos caros
- [ ] Virtualização para listas > 100 itens
- [ ] Code splitting de rotas
- [ ] Lazy loading de componentes pesados

### Database

- [ ] Índices em colunas filtradas
- [ ] Paginação implementada
- [ ] Cache com React Query
- [ ] Evitar N+1 queries
- [ ] RLS policies otimizadas

### Network

- [ ] Debouncing em inputs de busca
- [ ] Prefetching de dados
- [ ] Compressão gzip/brotli habilitada
- [ ] CDN para assets estáticos

### Bundle

- [ ] Bundle < 500 KB inicial
- [ ] Tree shaking configurado
- [ ] Dynamic imports para código pesado
- [ ] Source maps apenas em dev

### Images

- [ ] Usar WebP quando possível
- [ ] Lazy loading habilitado
- [ ] Responsive images (srcset)
- [ ] Otimizar tamanho (< 200 KB)

---

## Referências

- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analysis](https://vitejs.dev/guide/build.html#load-performance)

---

**Próximos Passos:**
- [Guia: Testing](07-TESTING.md)
- [Guia: Deployment](06-DEPLOYMENT.md)
