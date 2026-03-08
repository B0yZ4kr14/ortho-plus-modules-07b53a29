# 🚀 Guia de Deploy - Ortho+ V4.0

## 📋 Pré-requisitos

Antes de fazer deploy para produção, certifique-se de ter:

- [ ] Node.js 18+ instalado
- [ ] Conta Lovable ativa
- [ ] Projeto banco configurado (se self-hosted)
- [ ] Secrets configurados
- [ ] Domínio personalizado (opcional)

---

## 🔍 Checklist Pré-Deploy

### 1. Validação de Qualidade

Execute o script de validação:

```bash
ts-node scripts/validate-quality.ts
```

**Resultado esperado**: Score > 90/100

Se houver warnings:
- **CRÍTICOS**: Devem ser corrigidos antes do deploy
- **MÉDIOS**: Revisar e documentar
- **BAIXOS**: Podem ser ignorados

### 2. Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Build de produção
npm run build
```

### 3. Segurança

```bash
# Executar Database Linter
npx prisma validate

# Revisar RLS policies
apiClient db diff
```

**Resultado esperado**: 0 warnings críticos

### 4. Performance

```bash
# Analisar bundle size
npm run build
npm run analyze

# Verificar chunks
ls -lh dist/assets/*.js
```

**Targets**:
- Chunk principal: < 500KB
- Chunks lazy: < 200KB cada

---

## 🌐 Deploy no OrthoPlus Cloud

### Passo 1: Preparar o Projeto

1. **Verificar Secrets**:
   - Abra Settings → Secrets
   - Confirme que todos os secrets necessários estão configurados:
     - `RESEND_API_KEY` (para emails)
     - `OPENAI_API_KEY` (para IA, se aplicável)
     - Outros secrets específicos dos módulos

2. **Revisar Configurações**:
   - Settings → Cloud → Configurações
   - Verificar que o backend está funcionando
   - Testar conexão com PostgreSQL

### Passo 2: Deploy do Frontend

1. Clique no botão **"Publish"** (canto superior direito)
2. Aguarde o build completar (2-5 minutos)
3. Teste a URL staging: `https://seu-projeto.lovable.app`

### Passo 3: Deploy do Backend (Automático)

✅ **Edge Functions** são deployadas automaticamente  
✅ **Migrações de DB** são aplicadas automaticamente  
✅ **Políticas RLS** são sincronizadas automaticamente

**Nada de manual!** O OrthoPlus Cloud cuida de tudo.

### Passo 4: Configurar Domínio Custom (Opcional)

1. Vá em Settings → Domains
2. Adicione seu domínio (ex: `app.suaclinica.com.br`)
3. Configure o DNS:
   ```
   CNAME app.suaclinica.com.br → seu-projeto.lovable.app
   ```
4. Aguarde propagação (até 24h)

---

## 🔐 Configuração de Segurança Pós-Deploy

### 1. Revisar RLS Policies

Acesse o banco dashboard e valide:

```sql
-- Verificar políticas ativas
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. Habilitar Rate Limiting

```sql
-- Criar tabela de rate limit (se não existir)
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  ip_address INET NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para performance
CREATE INDEX idx_rate_limit_lookup 
ON rate_limit_log(endpoint, ip_address, window_start);
```

### 3. Habilitar Logs de Auditoria

```sql
-- Verificar se triggers de auditoria estão ativos
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE '%audit%';
```

---

## 📊 Monitoramento Pós-Deploy

### 1. Verificar Métricas (Primeiras 24h)

**Performance**:
- Dashboard load time < 2s?
- API response time < 500ms?
- Error rate < 1%?

**Usuários**:
- Login funcionando?
- Prontuários carregando?
- Consultas agendando?

### 2. Alertas (Configurar)

```javascript
// Exemplo: Alert de erro rate alto
if (errorRate > 5%) {
  sendAlert('Erro rate alto: ' + errorRate + '%');
}
```

### 3. Logs (PostgreSQL)

Acessar via:
- **Lovable**: Cloud tab → Logs
- **PostgreSQL**: Dashboard → Logs → Edge Functions

---

## 🔄 Rollback (Em caso de problema)

### Se houver erro crítico em produção:

1. **Rollback do Frontend**:
   - Settings → Deployments
   - Selecione a versão anterior
   - Clique em "Restore"

2. **Rollback do Backend**:
   ```bash
   # Reverter última migration
   apiClient migration down
   ```

3. **Redeployar Edge Functions** (se necessário):
   ```bash
   npm run deploy function-name
   ```

---

## ✅ Checklist Final Pós-Deploy

48h após o deploy, verifique:

- [ ] Uptime > 99%
- [ ] Response time < 2s (P95)
- [ ] Error rate < 0.5%
- [ ] Nenhum warning de segurança no banco
- [ ] Backup automático funcionando
- [ ] Monitoramento ativo (Sentry/Datadog)
- [ ] SSL/HTTPS ativo
- [ ] Domínio custom funcionando (se aplicável)

---

## 📞 Suporte

**Em caso de problemas**:

1. **Verificar Status**:
   - Lovable Status: https://status.lovable.dev
   - PostgreSQL Status: https://status.backend.orthoplus.localm

2. **Logs**:
   - Console do navegador (F12)
   - OrthoPlus Cloud → Logs
   - PostgreSQL → Logs

3. **Contato**:
   - Discord Lovable: https://discord.gg/lovable
   - Suporte Ortho+: suporte@orthoplus.com

---

**Última Atualização**: 15 de Novembro de 2025  
**Versão**: 4.0.0  
**Status**: ✅ PRODUCTION-READY
