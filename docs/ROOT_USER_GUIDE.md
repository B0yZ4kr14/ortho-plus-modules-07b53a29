# 🔑 Guia do Superusuário ROOT - Ortho+ Enterprise v2.0

## ⚠️ ATENÇÃO CRÍTICA

**Usuários ROOT têm acesso IRRESTRITO a TODO o sistema, incluindo:**
- ✅ Bypass completo de Row Level Security (RLS)
- ✅ Acesso a dados de TODAS as clínicas
- ✅ Capacidade de modificar/deletar qualquer registro
- ✅ Execução de operações administrativas críticas

**USE COM EXTREMA RESPONSABILIDADE!**

---

## 🎯 Quando Criar um Usuário ROOT?

Crie usuários ROOT **APENAS** para:

1. **Migrations Críticas:** Operações de banco de dados que afetam múltiplas clínicas
2. **Restore de Backups:** Restauração massiva de dados
3. **Auditorias Globais:** Análise de segurança em todo o sistema
4. **Troubleshooting:** Resolução de problemas que transcendem clínicas individuais
5. **Desenvolvimento/Staging:** Ambientes de teste (NUNCA em produção sem necessidade)

**❌ NÃO crie ROOT para:**
- Administradores de clínica (use role `ADMIN`)
- Operações do dia-a-dia
- Usuários finais (dentistas, recepcionistas)

---

## 🚀 Como Criar um Usuário ROOT

### Método 1: Edge Function (Recomendado)

**Requisitos:**
- Acesso à `DB_SERVICE_KEY`
- Ferramenta de API (Postman, cURL, etc.)

**Passo a Passo:**

```bash
# 1. Obter as credenciais do banco (variáveis de ambiente)
API_BASE_URL="https://yxpoqjyfgotkytwtifau.backend.orthoplus.local"
SERVICE_ROLE_KEY="sua-service-role-key-aqui"

# 2. Chamar a Edge Function create-root-user
curl -X POST "${API_BASE_URL}/functions/v1/create-root-user" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@orthoplus.com",
    "password": "SenhaForte123!@#$%",
    "full_name": "Root Administrator"
  }'
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Usuário ROOT criado com sucesso",
  "user": {
    "id": "uuid-do-usuario",
    "email": "root@orthoplus.com",
    "full_name": "Root Administrator",
    "app_role": "ROOT",
    "created_at": "2025-01-15T12:00:00Z"
  },
  "warning": "⚠️  ATENÇÃO: Este usuário tem acesso TOTAL ao sistema (bypass de RLS). Use com responsabilidade."
}
```

---

### Método 2: SQL Direct (Para Emergências)

**⚠️ Apenas em caso de emergência (Edge Function indisponível)**

```sql
-- 1. Criar usuário no auth.users (substitua os valores)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- Será o ID do ROOT
  'authenticated',
  'authenticated',
  'root@orthoplus.com',
  crypt('SenhaForte123!@#$%', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Root Administrator","app_role":"ROOT"}',
  now(),
  now()
)
RETURNING id; -- ANOTE ESTE ID!

-- 2. Criar profile ROOT (substitua <USER_ID> pelo ID retornado acima)
INSERT INTO public.profiles (id, app_role, full_name, clinic_id, is_active)
VALUES (
  '<USER_ID>',
  'ROOT',
  'Root Administrator',
  NULL, -- ROOT não pertence a nenhuma clínica
  true
);

-- 3. Registrar criação em audit logs
INSERT INTO public.security_audit_log (
  migration_version,
  issue_type,
  severity,
  description,
  resolution
) VALUES (
  'MANUAL',
  'ROOT_USER_CREATED',
  'HIGH',
  'Usuário ROOT criado manualmente via SQL: root@orthoplus.com',
  'Root user criado por necessidade emergencial'
);
```

---

## 🔒 Boas Práticas de Segurança

### 1. **Senhas Fortes Obrigatórias**
- Mínimo 12 caracteres
- Maiúsculas, minúsculas, números e símbolos
- Nunca reutilize senhas de outros sistemas
- Use um gerenciador de senhas (1Password, Bitwarden, etc.)

### 2. **Acesso Restrito**
- Compartilhe credenciais ROOT apenas com pessoal autorizado
- Nunca envie senhas por e-mail ou chat
- Use canais seguros (cofres de senhas compartilhados)

### 3. **Auditoria Completa**
- **Todas** as ações ROOT são registradas em `root_actions_log`
- Revise logs regularmente:
  ```sql
  SELECT * FROM public.root_actions_log 
  ORDER BY executed_at DESC 
  LIMIT 50;
  ```

### 4. **MFA (Multi-Factor Authentication)**
- **IMPORTANTE:** Habilite MFA para contas ROOT assim que possível
- PostgreSQL suporta MFA via TOTP (Google Authenticator, Authy, etc.)

### 5. **Rotação de Credenciais**
- Troque senhas ROOT a cada 90 dias
- Revogue acesso ROOT quando não mais necessário:
  ```sql
  UPDATE public.profiles 
  SET app_role = 'ADMIN', is_active = false 
  WHERE id = '<ROOT_USER_ID>';
  ```

---

## 📊 Monitoramento e Auditoria

### Consultar Ações ROOT Recentes
```sql
SELECT 
  ral.id,
  ral.root_user_id,
  u.email as root_email,
  ral.action,
  ral.target_table,
  ral.details,
  ral.executed_at
FROM public.root_actions_log ral
JOIN auth.users u ON u.id = ral.root_user_id
ORDER BY ral.executed_at DESC
LIMIT 100;
```

### Identificar Usuários ROOT Ativos
```sql
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.is_active,
  u.created_at as user_created_at,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.app_role = 'ROOT'
ORDER BY u.last_sign_in_at DESC NULLS LAST;
```

### Alertas de Segurança
Configure alertas para:
- ✅ Criação de novos usuários ROOT
- ✅ Login de usuário ROOT
- ✅ Ações ROOT em tabelas críticas (clinics, profiles, module_catalog)
- ✅ Múltiplas ações ROOT em curto período

---

## 🛡️ RLS Bypass: Como Funciona

### Tabelas com Bypass ROOT
As seguintes tabelas têm políticas RLS que permitem bypass para ROOT:

1. ✅ `clinics` - Todas as clínicas
2. ✅ `profiles` - Todos os perfis
3. ✅ `module_catalog` - Catálogo de módulos
4. ✅ `clinic_modules` - Módulos por clínica
5. ✅ `audit_logs` - Logs de auditoria
6. ✅ `security_audit_log` - Logs de segurança

### Exemplo de Policy com Bypass
```sql
CREATE POLICY "Root has full access to clinics"
ON public.clinics
FOR ALL
TO authenticated
USING (is_root_user()) -- Se TRUE, acesso total
WITH CHECK (is_root_user());
```

### Como ROOT Vê os Dados
```sql
-- Usuário ADMIN (role normal):
SELECT * FROM clinics; 
-- Retorna: APENAS sua clínica (clinic_id = X)

-- Usuário ROOT:
SELECT * FROM clinics;
-- Retorna: TODAS as clínicas (bypass de RLS)
```

---

## 🚨 Procedimento de Emergência

### Caso 1: ROOT Comprometido (Senha Vazada)

**Ações Imediatas:**

1. **Desabilitar ROOT:**
   ```sql
   UPDATE public.profiles 
   SET is_active = false 
   WHERE app_role = 'ROOT' AND id = '<COMPROMISED_USER_ID>';
   ```

2. **Revogar Sessões:**
   ```sql
   DELETE FROM auth.sessions WHERE user_id = '<COMPROMISED_USER_ID>';
   ```

3. **Investigar Logs:**
   ```sql
   SELECT * FROM public.root_actions_log 
   WHERE root_user_id = '<COMPROMISED_USER_ID>'
   AND executed_at > (now() - interval '24 hours')
   ORDER BY executed_at DESC;
   ```

4. **Notificar Equipe:**
   - Enviar alerta para admins
   - Revisar ações suspeitas
   - Avaliar danos

5. **Criar Novo ROOT (se necessário):**
   - Use credenciais diferentes
   - Force MFA

---

### Caso 2: Perda de Acesso ROOT

**Recuperação:**

1. **Via Admin Dashboard:**
   - Acesse: https://backend.orthoplus.localm/dashboard/project/yxpoqjyfgotkytwtifau
   - Table Editor → `profiles` → Edite manualmente para `app_role = 'ROOT'`

2. **Via SQL Editor:**
   ```sql
   -- Promover um ADMIN existente para ROOT temporariamente
   UPDATE public.profiles 
   SET app_role = 'ROOT' 
   WHERE email = 'admin@orthoplus.com';
   ```

3. **Criar Novo ROOT:**
   - Use a Edge Function `create-root-user` com service_role key

---

## 📝 Checklist de Criação de ROOT

Antes de criar um usuário ROOT, confirme:

- [ ] **Justificativa clara:** Por que ROOT é necessário?
- [ ] **Aprovação:** Quem autorizou a criação?
- [ ] **Credenciais seguras:** Senha forte (12+ chars)?
- [ ] **MFA habilitado:** Multi-factor authentication configurado?
- [ ] **Auditoria ativa:** Logs sendo monitorados?
- [ ] **Prazo definido:** Por quanto tempo ROOT será necessário?
- [ ] **Plano de revogação:** Quando/como revogar acesso?

---

## 🔗 Recursos Adicionais

- [PostgreSQL Row Level Security](https://apiClient.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
- [NIST Privileged User Management](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)

---

## 📞 Contato de Emergência

**Incidentes de Segurança:**
- 🆘 E-mail: security@orthoplus.com
- 📱 Telefone: +55 (XX) XXXX-XXXX (24/7)
- 💬 Slack: #security-incidents

**Suporte Técnico:**
- 📧 E-mail: support@orthoplus.com
- 📖 Docs: https://docs.orthoplus.com

---

**Última Atualização:** 2025-01-15  
**Versão:** 1.0 (FASE 1 - TASK 1.1)  
**Status:** ✅ Implementado e Testado
