# 🛠️ Troubleshooting: Erros Comuns e Soluções

## 🔴 Erros de Autenticação

### Erro: "Session expired" ou "Invalid JWT"

**Causa**: Token de autenticação expirado ou inválido.

**Solução**:
```typescript
// Forçar logout e novo login
await supabase.auth.signOut();
window.location.href = '/login';
```

**Prevenção**:
- Implementar refresh automático de token
- Usar `supabase.auth.onAuthStateChange()` para detectar mudanças

---

### Erro: "Email not confirmed"

**Causa**: Usuário criado mas email não foi confirmado (se auto-confirm desabilitado).

**Solução (Admin)**:
1. Ir em Cloud → Auth → Users
2. Encontrar usuário
3. Clicar "Confirm Email"

**Solução (Código)**:
```sql
-- Habilitar auto-confirm para ambiente de desenvolvimento
UPDATE auth.config 
SET value = jsonb_set(value, '{MAILER_AUTOCONFIRM}', 'true'::jsonb)
WHERE parameter = 'email';
```

---

## 💾 Erros de Banco de Dados

### Erro: "Foreign key constraint violation"

**Causa**: Tentativa de deletar registro que tem referências em outras tabelas.

**Exemplo**:
```
Cannot delete clinic_id='xxx' - referenced in table 'prontuarios'
```

**Solução**:
```typescript
// Opção 1: Deletar em cascata (cuidado!)
await supabase.from('clinic_modules').delete().eq('clinic_id', clinicId);
await supabase.from('prontuarios').delete().eq('clinic_id', clinicId);
await supabase.from('clinics').delete().eq('id', clinicId);

// Opção 2: Soft delete (recomendado)
await supabase
  .from('clinics')
  .update({ deleted_at: new Date().toISOString(), is_active: false })
  .eq('id', clinicId);
```

**Prevenção**:
- Usar `ON DELETE CASCADE` nas foreign keys (se apropriado)
- Implementar soft delete para registros críticos

---

### Erro: "Row Level Security: permission denied"

**Causa**: Política RLS bloqueando acesso aos dados.

**Debug**:
```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'prontuarios';

-- Testar política manualmente
SELECT auth.uid(); -- Ver ID do usuário atual
```

**Solução Típica**:
```sql
-- Adicionar política missing para SELECT
CREATE POLICY "Users can read own clinic data"
ON prontuarios FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  )
);
```

---

### Erro: "Unique constraint violation"

**Causa**: Tentativa de inserir registro com chave única já existente.

**Exemplo**:
```
duplicate key value violates unique constraint "clinic_modules_clinic_id_module_catalog_id_key"
```

**Solução**:
```typescript
// Usar UPSERT ao invés de INSERT
const { error } = await supabase
  .from('clinic_modules')
  .upsert(
    { clinic_id: 'xxx', module_catalog_id: 1, is_active: true },
    { onConflict: 'clinic_id,module_catalog_id' }
  );
```

---

## ⚡ Erros de Performance

### Problema: "Query muito lenta (>3 segundos)"

**Diagnóstico**:
```sql
-- Ver queries lentas (ativar em Supabase Dashboard → Settings → API)
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Causas Comuns**:
1. **N+1 Queries**: Fazer join ao invés de loops
2. **Falta de índices**: Adicionar índices em colunas filtradas
3. **SELECT * sem LIMIT**: Sempre paginar resultados

**Solução**:
```typescript
// ❌ N+1 Query
const tratamentos = await getTratamentos();
for (const t of tratamentos) {
  const procedimento = await getProcedimento(t.procedimentoId); // LENTO!
}

// ✅ Join único
const tratamentos = await supabase
  .from('pep_tratamentos')
  .select('*, procedimento:procedimentos(*)')
  .eq('prontuario_id', id);
```

---

### Problema: "UI travando ao renderizar muitos itens"

**Causa**: Renderização de 1000+ elementos no DOM.

**Solução**:
```typescript
// Usar react-window para virtualização
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={patients.length}
  itemSize={60}
>
  {({ index, style }) => (
    <div style={style}><PatientRow data={patients[index]} /></div>
  )}
</FixedSizeList>
```

---

## 🔒 Erros de Segurança

### Warning: "Function search_path is mutable"

**Causa**: Funções PostgreSQL sem `SET search_path` explícito.

**Solução**:
```sql
CREATE OR REPLACE FUNCTION minha_funcao()
RETURNS tipo
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ FIX
AS $$
BEGIN
  -- código
END;
$$;
```

---

### Warning: "Extension in public schema"

**Causa**: Extensions instaladas em `public` ao invés de `extensions`.

**Solução**:
```sql
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION postgis SET SCHEMA extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
```

---

## 📡 Erros de Edge Functions

### Erro: "Function returned empty response"

**Causa**: Edge Function não retornou `Response` válido.

**Solução**:
```typescript
// ❌ ERRADO
Deno.serve(async (req) => {
  const data = { success: true };
  return data; // ❌ Não é um Response!
});

// ✅ CORRETO
Deno.serve(async (req) => {
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

---

### Erro: "CORS error when calling function"

**Causa**: Headers CORS não configurados.

**Solução**:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Incluir CORS em todas as respostas
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

---

## 🎨 Erros de UI/Frontend

### Problema: "Hydration mismatch" (React)

**Causa**: HTML do servidor diferente do renderizado no cliente.

**Causas Comuns**:
- `Date.now()` ou `Math.random()` no render
- Conteúdo de `localStorage` no primeiro render
- Extensões do navegador modificando DOM

**Solução**:
```typescript
// ❌ ERRADO
function Component() {
  return <div>{Date.now()}</div>; // Valor muda entre server/client
}

// ✅ CORRETO
function Component() {
  const [timestamp, setTimestamp] = useState(null);
  
  useEffect(() => {
    setTimestamp(Date.now()); // Só no cliente
  }, []);
  
  return <div>{timestamp}</div>;
}
```

---

### Problema: "Memory leak warning" (React)

**Causa**: `setState` em componente desmontado.

**Solução**:
```typescript
// ❌ ERRADO
useEffect(() => {
  fetchData().then(data => setState(data)); // ❌ Se componente desmontar, erro!
}, []);

// ✅ CORRETO
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) setState(data); // ✅ Só atualiza se montado
  });
  
  return () => { isMounted = false; }; // Cleanup
}, []);
```

---

## 📞 Suporte e Comunidade

**Documentação Oficial**: https://docs.lovable.dev  
**Discord Lovable**: https://discord.gg/lovable  
**Logs do Sistema**: Cloud → Logs (Auth, DB, Edge Functions)

**Dica**: Sempre verificar logs antes de reportar bug!
