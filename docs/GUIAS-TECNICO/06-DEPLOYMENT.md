# Guia Técnico: Deployment e CI/CD

**Audiência:** DevOps, Desenvolvedores  
**Nível:** Avançado  
**Versão:** 4.0.0

---

## Visão Geral

Este guia detalha o processo de deployment do Ortho+ incluindo ambientes, pipelines CI/CD, monitoramento e rollback.

---

## Arquitetura de Deployment

```
┌──────────────────────────────────────────┐
│   Frontend (React + Vite)                │
│   Hospedado: Lovable Cloud / Vercel      │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│   Backend (Supabase)                     │
│   - PostgreSQL Database                  │
│   - Edge Functions (Deno)                │
│   - Storage (S3-compatible)              │
│   - Auth Service                         │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│   Serviços Externos                      │
│   - Resend (Email)                       │
│   - Google AI (Gemini)                   │
│   - BTCPay Server (Crypto)               │
└──────────────────────────────────────────┘
```

---

## Ambientes

### 1. Development (Local)

**Propósito:** Desenvolvimento local

**Stack:**
```bash
# Frontend
npm run dev  # Vite dev server (port 5173)

# Supabase Local
supabase start  # PostgreSQL, Edge Functions
```

**Configuração:**
```env
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key>
```

**Características:**
- Hot reload habilitado
- Source maps completos
- Sem minificação
- Logs detalhados

---

### 2. Staging

**Propósito:** Testes pré-produção

**URL:** `https://staging.orthoplus.app`

**Configuração:**
```env
# .env.staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=<staging-anon-key>
```

**Características:**
- Build otimizado (parcial)
- Source maps (apenas errors)
- Rate limiting relaxado
- Dados de teste

---

### 3. Production

**Propósito:** Ambiente de produção

**URL:** `https://app.orthoplus.com.br`

**Configuração:**
```env
# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=<prod-anon-key>
```

**Características:**
- Build totalmente otimizado
- Sem source maps
- Rate limiting estrito
- Monitoramento 24/7
- Backups automáticos

---

## Build Process

### Frontend (Vite)

**Build Command:**
```bash
npm run build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [outros assets]
└── favicon.ico
```

**Otimizações Aplicadas:**
- Tree shaking (dead code elimination)
- Code splitting (lazy loading)
- Asset optimization (images, fonts)
- Minification (Terser)
- Compression (gzip, brotli)

**Performance Targets:**
```
First Contentful Paint (FCP): < 1.5s
Largest Contentful Paint (LCP): < 2.5s
Time to Interactive (TTI): < 3.5s
Cumulative Layout Shift (CLS): < 0.1
```

---

### Edge Functions

**Deploy Command:**
```bash
supabase functions deploy <function-name>
```

**Ou deploy todas:**
```bash
supabase functions deploy --all
```

**Processo:**
1. Transpile TypeScript → JavaScript
2. Bundle dependencies
3. Upload para Supabase
4. Deploy em edge locations globais

**Regiões:**
- São Paulo (primary)
- Virginia (secondary)
- Frankfurt (tertiary)

---

## CI/CD Pipeline

### GitHub Actions Workflow

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_BROWSERS_PATH: 0

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  deploy-frontend:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./dist

  deploy-edge-functions:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy Edge Functions
        run: supabase functions deploy --all
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}

  run-migrations:
    needs: deploy-edge-functions
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Run database migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}

  smoke-tests:
    needs: [deploy-frontend, deploy-edge-functions, run-migrations]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          TEST_URL: https://app.orthoplus.com.br
          TEST_API_KEY: ${{ secrets.TEST_API_KEY }}
      
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Database Migrations

### Criar Nova Migration

```bash
supabase migration new <migration-name>
```

**Exemplo:**
```bash
supabase migration new add_patient_risk_scores
```

**Output:**
```
supabase/migrations/20250117123045_add_patient_risk_scores.sql
```

### Escrever Migration

```sql
-- Sempre usar transações
BEGIN;

-- Adicionar coluna
ALTER TABLE pacientes 
ADD COLUMN risk_score INTEGER DEFAULT 0;

-- Criar índice
CREATE INDEX idx_pacientes_risk_score 
ON pacientes(risk_score) 
WHERE risk_score > 50;

-- RLS policy
CREATE POLICY "Users can view patient risk scores"
ON pacientes
FOR SELECT
USING (clinic_id = get_user_clinic_id(auth.uid()));

COMMIT;
```

### Aplicar Migrations

**Local:**
```bash
supabase db reset  # Limpa DB e aplica todas migrations
```

**Production:**
```bash
supabase db push  # Aplica apenas novas migrations
```

### Rollback

**Criar migration de rollback:**
```sql
-- supabase/migrations/20250117130000_rollback_patient_risk_scores.sql
BEGIN;

DROP POLICY IF EXISTS "Users can view patient risk scores" ON pacientes;
DROP INDEX IF EXISTS idx_pacientes_risk_score;
ALTER TABLE pacientes DROP COLUMN IF EXISTS risk_score;

COMMIT;
```

**Aplicar rollback:**
```bash
supabase db push
```

---

## Environment Variables

### Gerenciamento de Secrets

**GitHub Secrets (CI/CD):**
```
Settings → Secrets and variables → Actions

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SLACK_WEBHOOK
```

**Supabase Secrets (Edge Functions):**
```bash
supabase secrets set RESEND_API_KEY=<value>
supabase secrets set GOOGLE_API_KEY=<value>
supabase secrets set OPENAI_API_KEY=<value>
```

**Listar secrets:**
```bash
supabase secrets list
```

---

## Rollback Strategies

### 1. Frontend Rollback (Vercel)

**Via Dashboard:**
1. Acessar Vercel Dashboard
2. Deployments → Ver histórico
3. Clicar em deployment anterior estável
4. **"Promote to Production"**

**Via CLI:**
```bash
vercel rollback <deployment-url>
```

### 2. Edge Functions Rollback

Edge Functions **não** suportam rollback automático.

**Solução:**
1. Reverter commit no Git
2. Re-deploy função antiga:
   ```bash
   git revert HEAD
   supabase functions deploy <function-name>
   ```

### 3. Database Rollback

**Via migration reversa:**
```bash
# Criar migration de rollback (manual)
supabase migration new rollback_<feature>

# Escrever SQL reverso
# Aplicar
supabase db push
```

---

## Monitoramento

### 1. Uptime Monitoring

**Ferramenta:** UptimeRobot

**Endpoints monitorados:**
```
https://app.orthoplus.com.br (HTTP 200)
https://app.orthoplus.com.br/api/health (JSON response)
```

**Alertas:**
- Email: devops@orthoplus.com.br
- Slack: #alerts channel
- SMS: +55 11 9xxxx-xxxx

### 2. Application Monitoring

**Supabase Dashboard:**
- Database CPU/Memory usage
- API requests/second
- Edge Function invocations
- Storage bandwidth

**Thresholds:**
```
CPU > 80%: Warning
CPU > 95%: Critical

Memory > 85%: Warning
Memory > 98%: Critical

API Errors > 5%: Warning
API Errors > 10%: Critical
```

### 3. Error Tracking

**Frontend:**
- Sentry.io (React error boundary)
- Console logs enviados para Supabase

**Backend:**
- Edge Function logs (Supabase Dashboard)
- Database logs (PostgreSQL logs)

### 4. Performance Monitoring

**Lighthouse CI:**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://app.orthoplus.com.br
            https://app.orthoplus.com.br/pacientes
            https://app.orthoplus.com.br/agenda
          uploadArtifacts: true
```

**Targets:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90

---

## Backup e Disaster Recovery

### Backups Automáticos

**Supabase:**
- Daily automatic backups (retenção: 7 dias)
- Point-in-Time Recovery (PITR): Últimas 7 dias

**Manual backup:**
```bash
# Dump database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20250117.sql
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 4 horas  
**RPO (Recovery Point Objective):** 1 hora

**Passos:**
1. **Identificar problema** (alertas, monitoring)
2. **Avaliar severidade** (crítico, alto, médio)
3. **Comunicar stakeholders** (Slack, email)
4. **Executar rollback** (se aplicável)
5. **Restaurar backup** (se necessário)
6. **Validar restauração** (smoke tests)
7. **Comunicar resolução**
8. **Post-mortem** (documentar causa raiz)

---

## Security Best Practices

### 1. Secrets Management

❌ **NÃO:**
```javascript
const apiKey = "sk-1234567890abcdef"; // Hardcoded
```

✅ **SIM:**
```javascript
const apiKey = Deno.env.get('OPENAI_API_KEY');
```

### 2. HTTPS Everywhere

- Redirect HTTP → HTTPS (automático em Vercel)
- HSTS header habilitado
- TLS 1.3 mínimo

### 3. Rate Limiting

```typescript
// Edge Function com rate limit
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  max: 100 // 100 requests/minuto
});
```

### 4. Input Validation

```typescript
// Validar inputs com Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12)
});

schema.parse(requestBody); // Throw se inválido
```

### 5. Dependency Scanning

```bash
# Scan vulnerabilidades
npm audit

# Atualizar dependências
npm audit fix
```

---

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load rotas
const Pacientes = lazy(() => import('./pages/Pacientes'));
const Agenda = lazy(() => import('./pages/Agenda'));

// Router
<Route path="/pacientes" element={
  <Suspense fallback={<Loading />}>
    <Pacientes />
  </Suspense>
} />
```

### 2. Asset Optimization

**Imagens:**
```bash
# Instalar sharp para otimização
npm install -D vite-plugin-imagemin

# vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9] },
    svgo: { plugins: [{ removeViewBox: false }] }
  })
]
```

### 3. Caching Strategy

**HTTP Headers:**
```
Cache-Control: public, max-age=31536000, immutable  # Assets com hash
Cache-Control: no-cache  # HTML files
```

**Service Worker (opcional):**
```typescript
// Cache API responses
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open('api-cache').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

---

## Troubleshooting

### Deploy Falhou

**1. Verificar logs:**
```bash
# GitHub Actions
# Acessar Actions tab → Ver workflow → Ver logs

# Supabase Edge Functions
supabase functions logs <function-name>
```

**2. Testar localmente:**
```bash
# Build frontend
npm run build

# Testar edge function
supabase functions serve <function-name>
```

**3. Rollback:**
```bash
# Reverter código
git revert HEAD
git push

# Pipeline CI/CD faz deploy automaticamente
```

### Database Migration Falhou

**1. Ver erro:**
```bash
supabase db push --debug
```

**2. Corrigir SQL:**
```sql
-- Adicionar IF EXISTS para segurança
DROP TABLE IF EXISTS old_table;
ALTER TABLE new_table ADD COLUMN IF NOT EXISTS col_name TEXT;
```

**3. Re-aplicar:**
```bash
supabase db push
```

---

## Checklist de Deploy

- [ ] Testes passando (unit, integration, E2E)
- [ ] Linter sem erros
- [ ] Type check OK
- [ ] Build produção sem warnings
- [ ] Migrations testadas em staging
- [ ] Secrets configurados corretamente
- [ ] Performance targets atingidos (Lighthouse)
- [ ] Security scan sem vulnerabilidades críticas
- [ ] Documentação atualizada
- [ ] Stakeholders notificados
- [ ] Rollback plan preparado
- [ ] Monitoring ativo

---

## Referências

- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)

---

**Próximos Passos:**
- [Guia: Testing Strategy](07-TESTING.md)
- [Guia: Monitoring e Alertas](08-MONITORING.md)
- [Tutorial: Como Fazer Deploy](../TUTORIAIS/08-COMO-FAZER-DEPLOY.md)
