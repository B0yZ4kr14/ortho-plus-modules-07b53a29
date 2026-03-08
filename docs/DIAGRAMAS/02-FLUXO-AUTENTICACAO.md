# 🔐 Fluxo de Autenticação - Ortho+

> Sequence diagram detalhado do processo de login, JWT e Row Level Security

---

## 🎯 Fluxo Completo de Autenticação

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Frontend as React App
    participant Auth as Express Auth
    participant JWT as JWT Token
    participant Postgres as PostgreSQL
    participant RLS as Row Level Security

    User->>Frontend: 1. Digita email/senha
    Frontend->>PostgreSQL: 2. POST /auth/v1/token<br/>{email, password}
    
    PostgreSQL->>Postgres: 3. SELECT * FROM auth.users<br/>WHERE email = ?
    Postgres-->>PostgreSQL: User encontrado
    
    PostgreSQL->>PostgreSQL: 4. Valida senha (bcrypt)
    
    alt Senha incorreta
        Backend-->Frontend: ❌ 401 Unauthorized
        Frontend-->>User: "Email ou senha incorretos"
    else Senha correta
        PostgreSQL->>Postgres: 5. SELECT clinic_id, app_role<br/>FROM profiles WHERE id = user.id
        Postgres-->>PostgreSQL: {clinic_id, app_role}
        
        PostgreSQL->>JWT: 6. Gera JWT com custom claims<br/>{user_id, clinic_id, app_role}
        JWT-->>PostgreSQL: access_token + refresh_token
        
        Backend-->Frontend: ✅ 200 OK<br/>{access_token, refresh_token, user}
        Frontend->>Frontend: 7. Armazena tokens em localStorage
        
        Frontend->>PostgreSQL: 8. GET /rest/v1/patients<br/>Authorization: Bearer token
        PostgreSQL->>JWT: 9. Valida token
        JWT-->>PostgreSQL: Token válido
        
        PostgreSQL->>Postgres: 10. SELECT * FROM patients<br/>(Com RLS ativo)
        Postgres->>RLS: 11. Extrai clinic_id do JWT
        RLS->>RLS: 12. Aplica policy:<br/>WHERE clinic_id = jwt.clinic_id
        RLS-->>Postgres: Apenas pacientes da clínica
        Postgres-->>PostgreSQL: Dados filtrados
        Backend-->Frontend: ✅ Dados seguros
        Frontend-->>User: Exibe dashboard
    end
```

---

## 📝 Detalhamento das Etapas

### **1-2. Submissão de Credenciais**

**Frontend** (`src/contexts/AuthContext.tsx`):
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}
```

**Request HTTP**:
```http
POST https://yxpoqjyfgotkytwtifau.backend.orthoplus.local/auth/v1/token
Content-Type: application/json

{
  "email": "dentista@clinica.com",
  "password": "SenhaSegura123!"
}
```

---

### **3-4. Validação de Senha**

PostgreSQL usa **bcrypt** com **cost factor 10**:

```sql
-- auth.users (tabela interna do banco)
SELECT 
  id,
  email,
  encrypted_password, -- $2a$10$... (bcrypt hash)
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'dentista@clinica.com'
  AND deleted_at IS NULL;
```

**Validação**:
```typescript
const isValid = await bcrypt.compare(
  'SenhaSegura123!',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye...'
)
```

---

### **5. Busca de Metadados (Custom Claims)**

**Trigger automático** que adiciona `clinic_id` e `app_role` ao JWT:

```sql
-- Função executada após login
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  profile_data RECORD;
BEGIN
  -- Busca clinic_id e role do usuário
  SELECT clinic_id, app_role INTO profile_data
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;
  
  -- Adiciona ao JWT
  event := jsonb_set(
    event, 
    '{claims,clinic_id}', 
    to_jsonb(profile_data.clinic_id)
  );
  
  event := jsonb_set(
    event, 
    '{claims,app_role}', 
    to_jsonb(profile_data.app_role)
  );
  
  RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### **6. Geração do JWT**

**JWT Structure**:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "uuid-do-usuario",
    "email": "dentista@clinica.com",
    "aud": "authenticated",
    "role": "authenticated",
    "clinic_id": "uuid-da-clinica",
    "app_role": "ADMIN",
    "iat": 1705320000,
    "exp": 1705323600
  },
  "signature": "..."
}
```

**Decode JWT** (para debug):
```bash
# Instalar jwt-cli
npm install -g jwt-cli

# Decode token
jwt decode eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lifetimes**:
- `access_token`: 1 hora (3600s)
- `refresh_token`: 30 dias (2592000s)

---

### **7. Armazenamento Seguro**

**LocalStorage** (`apiClient-auth-token`):
```typescript
// PostgreSQL gerencia automaticamente
localStorage.setItem('auth.token', JSON.stringify({
  access_token: 'eyJhbGciOiJIUzI1NiIs...',
  refresh_token: 'v1.MRz...',
  expires_at: 1705323600,
  token_type: 'bearer',
  user: {
    id: 'uuid',
    email: 'dentista@clinica.com'
  }
}))
```

**Segurança**:
- ✅ HttpOnly Cookies (mais seguro, mas PostgreSQL usa localStorage por padrão)
- ⚠️ LocalStorage vulnerável a XSS (Cross-Site Scripting)
- 🔒 Solução: Sanitize inputs, CSP headers

---

### **8-10. Request Autenticado**

**Frontend**:
```typescript
const { data: patients } = await apiClient
  .from('patients')
  .select('*')
// PostgreSQL adiciona automaticamente header Authorization
```

**Request HTTP Real**:
```http
GET https://yxpoqjyfgotkytwtifau.backend.orthoplus.local/rest/v1/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
```

---

### **11-12. Row Level Security (RLS)**

**Policy na tabela `patients`**:
```sql
CREATE POLICY "Isolamento por clínica"
  ON patients FOR ALL
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

**Como funciona**:
1. PostgreSQL extrai `auth.uid()` do JWT (função mágica do banco)
2. Busca `clinic_id` do usuário na tabela `profiles`
3. Filtra query automaticamente: `WHERE clinic_id = 'uuid-da-clinica'`

**Query Real Executada**:
```sql
-- O que o dev escreve:
SELECT * FROM patients;

-- O que PostgreSQL executa (com RLS):
SELECT * FROM patients
WHERE clinic_id = (
  SELECT clinic_id FROM profiles WHERE id = 'uuid-do-usuario'
);
```

**Vantagem**: Segurança no banco, não no código! 🎯

---

## 🔄 Fluxo de Refresh Token

```mermaid
sequenceDiagram
    participant Frontend as React App
    participant Auth as Express Auth
    participant JWT as JWT

    Frontend->>Frontend: 1. Detecta access_token expirado<br/>(após 1 hora)
    Frontend->>PostgreSQL: 2. POST /auth/v1/token<br/>{refresh_token}
    PostgreSQL->>JWT: 3. Valida refresh_token
    
    alt Refresh token válido
        JWT-->>PostgreSQL: ✅ Token válido
        PostgreSQL->>PostgreSQL: 4. Gera novo access_token
        Backend-->Frontend: ✅ {new_access_token}
        Frontend->>Frontend: 5. Atualiza localStorage
        Frontend->>PostgreSQL: 6. Retry request original
    else Refresh token expirado/inválido
        JWT-->>PostgreSQL: ❌ Token inválido
        Backend-->Frontend: ❌ 401 Unauthorized
        Frontend->>Frontend: 7. Redireciona para /login
    end
```

**Implementação Automática**:
```typescript
// PostgreSQL gerencia refresh automaticamente
auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token renovado automaticamente')
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('Sessão expirada, redirecionando...')
    navigate('/login')
  }
})
```

---

## 🛡️ Fluxo de Proteção de Rotas

```mermaid
graph TD
    A[Usuário acessa /pacientes] --> B{Authenticated?}
    B -->|Não| C[Redirect /login]
    B -->|Sim| D{Token válido?}
    D -->|Não| E[Refresh token]
    E --> F{Refresh OK?}
    F -->|Não| C
    F -->|Sim| G{Tem permissão?}
    D -->|Sim| G
    G -->|Não hasModuleAccess| H[403 Forbidden]
    G -->|Sim| I[Renderiza /pacientes]
    
    style C fill:#ff6b6b,color:#fff
    style H fill:#ff6b6b,color:#fff
    style I fill:#4caf50,color:#fff
```

**Implementação** (`src/App.tsx`):
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

<Route
  path="/pacientes"
  element={
    <ProtectedRoute requiredModule="PACIENTES">
      <PatientsPage />
    </ProtectedRoute>
  }
/>

// ProtectedRoute.tsx
const ProtectedRoute = ({ children, requiredModule }) => {
  const { user, hasModuleAccess } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (!hasModuleAccess(requiredModule)) {
    return <Navigate to="/403" /> // Forbidden
  }
  
  return children
}
```

---

## 🔍 Debug de Autenticação

### Ver JWT decodificado:
```typescript
const session = await auth.getSession()
console.log('JWT Payload:', JSON.parse(atob(session.data.session.access_token.split('.')[1])))
```

### Ver clinic_id do usuário:
```typescript
const { data: profile } = await apiClient
  .from('profiles')
  .select('clinic_id, app_role')
  .eq('id', user.id)
  .single()

console.log('Clinic ID:', profile.clinic_id)
console.log('Role:', profile.app_role)
```

### Testar RLS manualmente:
```sql
-- Logar como usuário específico
SET request.jwt.claims.user_id = 'uuid-do-usuario';

-- Testar query com RLS
SELECT * FROM patients;
-- Deve retornar apenas dados da clínica do usuário
```

---

## 📚 Recursos

- [Express Auth Docs](https://apiClient.com/docs/guides/auth)
- [JWT.io](https://jwt.io/) - Decoder de tokens
- [PostgreSQL RLS](https://www.postgresql.org/docs/15/ddl-rowsecurity.html)

---

**Próximos Diagramas:**  
→ [03-SISTEMA-MODULAR](./03-SISTEMA-MODULAR.md) - Grafo de módulos e dependências  
→ [04-BANCO-DE-DADOS](./04-BANCO-DE-DADOS.md) - ERD completo do PostgreSQL
