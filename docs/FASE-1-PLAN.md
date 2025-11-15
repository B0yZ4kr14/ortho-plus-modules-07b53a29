# 🚀 FASE 1: FUNDAÇÃO - PLANO DE EXECUÇÃO

**Status:** 🟡 **EM ANDAMENTO**  
**Duração Estimada:** 3-5 dias  
**Início:** 2025-01-15 (logo após FASE 0)  
**Modo:** Autônomo (sem confirmações)

---

## 🎯 OBJETIVOS DA FASE 1

Consolidar a **arquitetura base** do Ortho+ Enterprise v2.0, preparando a infraestrutura sólida para os módulos avançados das próximas fases.

### **Entregas Principais:**
1. ✅ Superusuário Root (bypass de RLS para operações críticas)
2. ✅ Rate Limiting em Edge Functions (proteção contra abuse)
3. ✅ Password Strength Indicator (UI para senhas fortes)
4. ✅ Documentação de Segurança (SECURITY.md)
5. ✅ CI/CD Pipeline (GitHub Actions para testes e deploy)

---

## 📋 TAREFAS DETALHADAS

### **TASK 1.1: Implementar Superusuário Root** (4 horas)

#### **Contexto:**
Algumas operações críticas (ex: migrations massivas, restore de backups, auditorias globais) precisam de um usuário com permissões elevadas que pode **bypass RLS policies**.

#### **Implementação:**

**1.1.1. Migration SQL:**
```sql
-- Criar função para identificar se usuário é root
CREATE OR REPLACE FUNCTION public.is_root_user()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Root user tem email específico e flag especial no profile
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.app_role = 'ROOT'
  );
END;
$$ LANGUAGE plpgsql;

-- Atualizar RLS policies para permitir bypass do root
-- Exemplo em tabela clinics:
CREATE POLICY "Root has full access to clinics"
ON public.clinics
FOR ALL
TO authenticated
USING (is_root_user())
WITH CHECK (is_root_user());
```

**1.1.2. Edge Function: `create-root-user`**
```typescript
// supabase/functions/create-root-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Apenas service_role pode chamar esta função
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { email, password } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Criar usuário root no auth
  const { data: user, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { app_role: 'ROOT' }
  });

  if (signupError) throw signupError;

  // Criar profile com role ROOT
  await supabase.from('profiles').insert({
    id: user.user.id,
    app_role: 'ROOT',
    clinic_id: null // Root não pertence a nenhuma clínica específica
  });

  return new Response(JSON.stringify({ success: true, user_id: user.user.id }));
});
```

**1.1.3. Documentação:**
- Criar `docs/ROOT_USER_GUIDE.md` com instruções de uso e segurança

**Critérios de Sucesso:**
- [x] Função `is_root_user()` criada
- [ ] Edge Function `create-root-user` implementada
- [ ] RLS policies atualizadas em tabelas críticas (clinics, profiles, module_catalog)
- [ ] Documentação completa

---

### **TASK 1.2: Rate Limiting em Edge Functions** (6 horas)

#### **Contexto:**
Prevenir abuse de API, ataques DDoS e uso excessivo de recursos.

#### **Implementação:**

**1.2.1. Tabela de Rate Limit:**
```sql
CREATE TABLE public.rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  ip_address INET NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_user_endpoint ON rate_limit_log(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_log(ip_address, endpoint, window_start);
```

**1.2.2. Edge Function: `rate-limiter` (Middleware)**
```typescript
// supabase/functions/_shared/rateLimiter.ts
export async function checkRateLimit(
  supabase: any,
  userId: string | null,
  ipAddress: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMinutes: number = 15
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Verificar por userId (se autenticado)
  if (userId) {
    const { data, error } = await supabase
      .from('rate_limit_log')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (data && data.request_count >= maxRequests) {
      return false; // Rate limit exceeded
    }
  }

  // Verificar por IP (sempre)
  const { data: ipData } = await supabase
    .from('rate_limit_log')
    .select('request_count')
    .eq('ip_address', ipAddress)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .single();

  if (ipData && ipData.request_count >= maxRequests * 2) {
    return false; // IP rate limit exceeded
  }

  // Incrementar contador
  await supabase.from('rate_limit_log').upsert({
    user_id: userId,
    ip_address: ipAddress,
    endpoint,
    window_start: windowStart,
    request_count: (data?.request_count || 0) + 1
  });

  return true; // OK to proceed
}
```

**1.2.3. Aplicar Rate Limiting em Edge Functions Existentes:**
- Modificar todas as Edge Functions para usar o middleware `checkRateLimit`
- Configurar limites apropriados por função:
  - **Auth functions:** 5 req/min
  - **Data read:** 100 req/15min
  - **Data write:** 30 req/15min
  - **Heavy operations (export, IA):** 10 req/hour

**Critérios de Sucesso:**
- [ ] Tabela `rate_limit_log` criada
- [ ] Middleware `rateLimiter.ts` implementado
- [ ] 10+ Edge Functions protegidas com rate limiting
- [ ] Testes de abuse (simular 1000 requests em 1 min)

---

### **TASK 1.3: Password Strength Indicator (UI)** (4 horas)

#### **Contexto:**
Melhorar UX de cadastro/troca de senha com indicador visual de força da senha.

#### **Implementação:**

**1.3.1. Componente `PasswordStrengthIndicator`:**
```typescript
// src/components/auth/PasswordStrengthIndicator.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const [strength, setStrength] = useState<PasswordStrength>(calculateStrength(''));

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password]);

  return (
    <div className="space-y-2">
      {/* Barra de força */}
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded transition-colors ${
              i < strength.score ? strength.color : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-sm font-medium" style={{ color: strength.color }}>
        {strength.label}
      </p>

      {/* Requisitos */}
      <ul className="space-y-1 text-xs">
        <Requirement met={strength.requirements.length}>
          Mínimo 12 caracteres
        </Requirement>
        <Requirement met={strength.requirements.uppercase}>
          Pelo menos uma letra maiúscula
        </Requirement>
        <Requirement met={strength.requirements.lowercase}>
          Pelo menos uma letra minúscula
        </Requirement>
        <Requirement met={strength.requirements.number}>
          Pelo menos um número
        </Requirement>
        <Requirement met={strength.requirements.symbol}>
          Pelo menos um símbolo (@$!%*?&#)
        </Requirement>
      </ul>
    </div>
  );
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={met ? 'text-foreground' : 'text-muted-foreground'}>
        {children}
      </span>
    </li>
  );
}

function calculateStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[@$!%*?&#]/.test(password)
  };

  const metCount = Object.values(requirements).filter(Boolean).length;

  if (metCount === 5) return { score: 4, label: 'Muito Forte', color: 'hsl(142, 76%, 36%)', requirements };
  if (metCount >= 4) return { score: 3, label: 'Forte', color: 'hsl(142, 76%, 46%)', requirements };
  if (metCount >= 3) return { score: 2, label: 'Média', color: 'hsl(48, 96%, 53%)', requirements };
  if (metCount >= 1) return { score: 1, label: 'Fraca', color: 'hsl(0, 84%, 60%)', requirements };
  return { score: 0, label: 'Muito Fraca', color: 'hsl(0, 84%, 40%)', requirements };
}
```

**1.3.2. Integrar em Formulários:**
- `src/pages/Auth.tsx` (signup)
- `src/pages/Configuracoes.tsx` (trocar senha)
- Adicionar validação client-side antes de submit

**1.3.3. Integrar com Função SQL:**
```typescript
// Ao fazer signup/troca de senha, validar no backend também
const { data, error } = await supabase.rpc('validate_password_strength', { password });
if (!data) {
  throw new Error('Senha não atende aos requisitos mínimos de segurança');
}
```

**Critérios de Sucesso:**
- [ ] Componente `PasswordStrengthIndicator` criado
- [ ] Integrado em formulários de auth
- [ ] Validação client-side + server-side
- [ ] Testes manuais (tentar senhas fracas)

---

### **TASK 1.4: Documentação de Segurança** (2 horas)

#### **Implementação:**

**1.4.1. Criar `docs/SECURITY.md`:**
```markdown
# 🔒 Guia de Segurança - Ortho+ Enterprise v2.0

## Arquitetura de Segurança

### Multi-Tenancy com RLS
- Todas as tabelas públicas têm Row Level Security (RLS) habilitado
- Isolamento por `clinic_id`
- Usuários só veem dados de sua clínica

### Roles e Permissões
- **ROOT:** Super administrador (bypass de RLS)
- **ADMIN:** Administrador da clínica
- **MEMBER:** Dentista, recepcionista
- **PATIENT:** Paciente (acesso limitado)

### Proteções Implementadas
- ✅ Rate Limiting em todas as Edge Functions
- ✅ Validação de senhas fortes (mínimo 12 caracteres)
- ✅ Audit Logs (LGPD compliance)
- ✅ Extensões isoladas em schema dedicado
- ✅ Funções SECURITY DEFINER com search_path explícito

### Boas Práticas
1. Nunca exponha SUPABASE_SERVICE_ROLE_KEY no frontend
2. Use RLS policies para controle de acesso
3. Sempre valide inputs (client + server)
4. Use prepared statements para evitar SQL injection
5. Rotate secrets periodicamente
6. Monitore audit_logs regularmente

### Checklist de Deploy
- [ ] Habilitar "Leaked Password Protection" no Supabase Auth
- [ ] Configurar alertas de segurança (email para admin)
- [ ] Backup automático configurado
- [ ] SSL/TLS habilitado (Lovable faz isso automaticamente)
- [ ] Rate limits testados em produção

### Incidentes de Segurança
Em caso de brecha de segurança:
1. Desabilitar usuário comprometido imediatamente
2. Revisar `audit_logs` para identificar escopo
3. Notificar usuários afetados (LGPD)
4. Patch da vulnerabilidade
5. Documentar no `security_audit_log`

### Contato
Security Team: security@orthoplus.com
```

**Critérios de Sucesso:**
- [ ] `SECURITY.md` criado e completo
- [ ] Checklist de deploy documentado
- [ ] Processo de incident response definido

---

### **TASK 1.5: CI/CD Pipeline (GitHub Actions)** (4 horas)

#### **Contexto:**
Automatizar testes, build e deploy para garantir qualidade do código.

#### **Implementação:**

**1.5.1. Workflow de Testes:**
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

**1.5.2. Workflow de Build:**
```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: TypeScript check
        run: npm run type-check
        
      - name: Build
        run: npm run build
        
      - name: Check bundle size
        run: npm run analyze
```

**1.5.3. Workflow de Security Scan:**
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1' # Toda segunda-feira às 2h
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Critérios de Sucesso:**
- [ ] 3 workflows criados (.github/workflows/)
- [ ] Testes executam automaticamente em PRs
- [ ] Build valida TypeScript e bundle size
- [ ] Security scan semanal configurado

---

## 📊 CRONOGRAMA DETALHADO

| Task | Duração | Dependências | Prioridade |
|------|---------|--------------|------------|
| 1.1 Root User | 4h | FASE 0 | 🔴 Alta |
| 1.2 Rate Limiting | 6h | FASE 0 | 🔴 Alta |
| 1.3 Password UI | 4h | FASE 0 | 🟡 Média |
| 1.4 Security Docs | 2h | 1.1, 1.2, 1.3 | 🟢 Baixa |
| 1.5 CI/CD | 4h | - | 🟡 Média |
| **TOTAL** | **20h (2.5 dias)** | | |

---

## ✅ CRITÉRIOS DE SUCESSO DA FASE 1

### **Técnicos:**
- [ ] Superusuário Root funcional e testado
- [ ] Rate limiting ativo em 10+ Edge Functions
- [ ] Password strength indicator em todos os forms de auth
- [ ] Documentação de segurança completa
- [ ] CI/CD pipeline rodando em GitHub

### **Qualidade:**
- [ ] 0 vulnerabilidades críticas (npm audit)
- [ ] 100% das Edge Functions protegidas
- [ ] Senhas fracas rejeitadas (client + server)
- [ ] Testes automatizados passando (CI)

### **Documentação:**
- [ ] SECURITY.md completo
- [ ] ROOT_USER_GUIDE.md completo
- [ ] README.md atualizado com badges de CI

---

## 🚀 PRÓXIMA FASE

**FASE 2: COMPLETAR MÓDULOS PARCIAIS (7-10 dias)**

Módulos a serem completados:
1. SPLIT_PAGAMENTO (2 dias)
2. INADIMPLENCIA (2 dias)
3. ODONTOGRAMA (2 dias)
4. TELEODONTOLOGIA (2 dias)
5. IA_RADIOGRAFIA (1 dia)
6. CRYPTO + BTCPay (2 dias)

**Total:** 11 dias

---

**Status:** 🟡 **AGUARDANDO INÍCIO**  
**Próxima Ação:** Executar TASK 1.1 (Root User)
