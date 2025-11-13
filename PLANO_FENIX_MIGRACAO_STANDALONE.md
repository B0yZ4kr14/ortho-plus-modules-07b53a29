# 🔥 Plano Fênix - Migração Standalone Ubuntu LTS

## 📋 Visão Geral

Este documento detalha o plano completo de migração do Ortho+ de uma arquitetura baseada em Supabase (Lovable Cloud) para uma instalação **totalmente independente e auto-hospedada** em Ubuntu Server 24.04 LTS.

**Objetivo:** Eliminar completamente a dependência do Supabase, tornando o sistema 100% standalone e instalável em infraestrutura própria do cliente.

---

## 🎯 Motivação da Migração

### Vantagens do Sistema Standalone

| Aspecto | Com Supabase (Atual) | Standalone (Alvo) |
|---------|---------------------|-------------------|
| **Custo Operacional** | $25-100/mês por clínica | Apenas custo do servidor ($10-50/mês) |
| **Controle Total** | Limitado (vendor lock-in) | 100% sob controle do cliente |
| **Escalabilidade** | Automática mas cara | Manual mas customizável |
| **Complexidade** | Baixa (gerenciado) | Média (requer manutenção) |
| **Performance** | Depende da região do Supabase | Total controle local |
| **Segurança** | Gerenciada externamente | Responsabilidade própria |
| **Customização** | Limitada por APIs do Supabase | Ilimitada (código aberto) |
| **LGPD/Compliance** | Dados em cloud externa | Dados no próprio servidor |
| **Disponibilidade** | Depende do uptime do Supabase | Controle total (SLA próprio) |

---

## 🏗️ Arquitetura Atual vs. Arquitetura Alvo

### Arquitetura Atual (Supabase)
```
┌─────────────────────────────────────────────────────────┐
│                    Lovable Cloud                         │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │ Supabase   │  │ Supabase   │  │ Deno Edge       │   │
│  │ Auth       │  │ PostgreSQL │  │ Functions (26)  │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │ Supabase   │  │ Supabase   │  │ Supabase        │   │
│  │ Storage    │  │ Realtime   │  │ RLS Policies    │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │
                         ▼
              ┌─────────────────┐
              │  React Frontend │
              │  (Vite + TS)    │
              └─────────────────┘
```

### Arquitetura Alvo (Standalone)
```
┌────────────────────────────────────────────────────────────┐
│              Ubuntu Server 24.04 LTS                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                    Nginx (80/443)                    │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   Frontend   │  │  API Proxy   │                │  │
│  │  │   (Static)   │  │   /api/*     │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  └─────────────────────────────────────────────────────┘  │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          Node.js + Express API (3001)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │   Auth   │  │ Business │  │  REST Endpoints  │  │  │
│  │  │   JWT    │  │  Logic   │  │      (26)        │  │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │        Socket.io (Realtime)                  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              PostgreSQL 16 (5432)                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │   26 Módulos│  │   RLS via   │  │  Triggers  │  │  │
│  │  │   Tabelas   │  │  Middleware │  │  pg_notify │  │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   MinIO     │  │    Redis    │  │  Prometheus +   │   │
│  │  (Storage)  │  │   (Cache)   │  │    Grafana      │   │
│  │   (9000)    │  │   (6379)    │  │  (Monitoring)   │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 📅 Plano de Execução - 9 Fases

### **FASE 1: Substituição da Camada de Autenticação** ⚠️ CRÍTICA

**Objetivo:** Substituir `@supabase/supabase-js` auth por sistema JWT próprio.

#### 1.1. Backend de Autenticação (Node.js + Express)

**Stack:**
- Node.js 20.x + Express 4.x
- **bcrypt** para hash de senhas (salt rounds: 10)
- **jsonwebtoken** para geração de JWT
- **express-rate-limit** para proteção contra brute force

**Endpoints a Criar:**
```typescript
// routes/auth.ts

// Cadastro de novo usuário
POST   /api/auth/signup
Body:  { email: string, password: string, full_name: string }
Response: { user: User, token: string }

// Login (retorna JWT com claims customizados)
POST   /api/auth/signin
Body:  { email: string, password: string }
Response: { user: User, token: string, refresh_token: string }

// Logout (invalidar token)
POST   /api/auth/signout
Headers: Authorization: Bearer <token>
Response: { success: boolean }

// Obter dados do usuário autenticado
GET    /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: User, clinic: Clinic, permissions: Permission[] }

// Renovar token expirado
POST   /api/auth/refresh
Body:  { refresh_token: string }
Response: { token: string, refresh_token: string }

// Recuperação de senha
POST   /api/auth/forgot-password
Body:  { email: string }
Response: { message: string }

// Reset de senha com token
POST   /api/auth/reset-password
Body:  { token: string, new_password: string }
Response: { success: boolean }
```

**Implementação JWT com Custom Claims:**
```typescript
// lib/jwt.ts
import jwt from 'jsonwebtoken';

interface JWTPayload {
  user_id: string;
  email: string;
  clinic_id: string;
  app_role: 'ADMIN' | 'MEMBER';
  permissions: string[]; // module keys
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '8h', // Token expira em 8 horas
    issuer: 'orthoplus',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ user_id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '30d', // Refresh token válido por 30 dias
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
}
```

**Middleware de Autenticação:**
```typescript
// middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export interface AuthRequest extends Request {
  user: JWTPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Middleware para verificar role ADMIN
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { user } = req as AuthRequest;
  
  if (user.app_role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Requer role ADMIN.' });
  }
  
  next();
}
```

#### 1.2. Migração do AuthContext (Frontend)

**Substituir implementação Supabase:**
```typescript
// src/contexts/AuthContext.tsx (REFATORADO)

import { createContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  clinic_id: string;
  app_role: 'ADMIN' | 'MEMBER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasModuleAccess: (moduleKey: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Auto-login se houver JWT válido no localStorage
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchCurrentUser() {
    try {
      const { data } = await apiClient.get('/api/auth/me');
      setUser(data.user);
      setPermissions(data.permissions);
    } catch (error) {
      localStorage.removeItem('jwt');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { data } = await apiClient.post('/api/auth/signin', { email, password });
    
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('refresh_token', data.refresh_token);
    
    setUser(data.user);
    setPermissions(data.permissions);
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data } = await apiClient.post('/api/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    
    localStorage.setItem('jwt', data.token);
    setUser(data.user);
  }

  async function signOut() {
    await apiClient.post('/api/auth/signout');
    localStorage.removeItem('jwt');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setPermissions([]);
  }

  function hasModuleAccess(moduleKey: string): boolean {
    if (user?.app_role === 'ADMIN') return true;
    return permissions.includes(moduleKey);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, hasModuleAccess }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 1.3. Tabela de Autenticação (PostgreSQL)

```sql
-- Substituir auth.users do Supabase
CREATE TABLE auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  reset_password_token VARCHAR(255),
  reset_password_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para performance
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Manter tabela profiles existente (já tem foreign key para user_id)
-- Atualizar foreign key para referenciar auth_users ao invés de auth.users
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE;
```

**Status:** ⏳ Pendente de implementação

---

### **FASE 2: Migração do Banco de Dados** ⚠️ CRÍTICA

**Objetivo:** Adaptar queries e RLS policies para PostgreSQL nativo.

#### 2.1. Conversão de RLS Policies para Middleware

**Problema:** PostgreSQL nativo não injeta JWT automaticamente como Supabase.

**Solução:** Implementar RLS via middleware Node.js que extrai `clinic_id` do JWT e injeta em queries.

```typescript
// middleware/clinic-filter.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';

export function injectClinicFilter(req: Request, res: Response, next: NextFunction) {
  const { user } = req as AuthRequest;
  
  // Disponibilizar clinic_id para uso em queries
  req.clinicId = user.clinic_id;
  req.userId = user.user_id;
  req.userRole = user.app_role;
  
  next();
}

// Uso em rotas:
// router.get('/patients', authenticate, injectClinicFilter, getPatients);
```

**Query Helpers com Filtro Automático:**
```typescript
// lib/db-helpers.ts
import { Pool } from 'pg';

export class DatabaseHelper {
  constructor(private pool: Pool) {}

  // SELECT automático com filtro de clínica
  async findAll(table: string, clinicId: string, conditions: Record<string, any> = {}) {
    const whereConditions = Object.keys(conditions).map((key, i) => `${key} = $${i + 2}`);
    const values = [clinicId, ...Object.values(conditions)];
    
    const query = `
      SELECT * FROM ${table} 
      WHERE clinic_id = $1 
      ${whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : ''}
      ORDER BY created_at DESC
    `;
    
    const { rows } = await this.pool.query(query, values);
    return rows;
  }

  // INSERT automático com clinic_id
  async create(table: string, data: Record<string, any>, clinicId: string) {
    const columns = [...Object.keys(data), 'clinic_id'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const values = [...Object.values(data), clinicId];
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  // UPDATE automático com verificação de clinic_id
  async update(table: string, id: string, data: Record<string, any>, clinicId: string) {
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(data), clinicId, id];
    
    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length} AND clinic_id = $${values.length - 1}
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, values);
    if (rows.length === 0) {
      throw new Error('Registro não encontrado ou acesso negado');
    }
    return rows[0];
  }

  // DELETE automático com verificação de clinic_id
  async delete(table: string, id: string, clinicId: string) {
    const query = `
      DELETE FROM ${table}
      WHERE id = $1 AND clinic_id = $2
      RETURNING id
    `;
    
    const { rows } = await this.pool.query(query, [id, clinicId]);
    if (rows.length === 0) {
      throw new Error('Registro não encontrado ou acesso negado');
    }
    return true;
  }
}
```

#### 2.2. Migrations Existentes

**Boa notícia:** Todas as 22 migrations em `supabase/migrations/` são SQL PostgreSQL nativo e **100% compatíveis**.

**Mudanças necessárias:**
1. Remover RLS policies (serão substituídas por middleware)
2. Manter triggers, functions e constraints
3. Atualizar foreign keys para `auth_users` ao invés de `auth.users`

**Executar migrations com node-pg-migrate:**
```bash
npm install node-pg-migrate
npx node-pg-migrate up --database-url-var DATABASE_URL
```

#### 2.3. Conversão de Queries Supabase

**Criar camada de abstração (Repository Pattern):**

```typescript
// repositories/PatientRepository.ts
import { DatabaseHelper } from '../lib/db-helpers';
import { Pool } from 'pg';

export class PatientRepository {
  private db: DatabaseHelper;

  constructor(pool: Pool) {
    this.db = new DatabaseHelper(pool);
  }

  async findAll(clinicId: string, filters?: { search?: string }) {
    let query = 'SELECT * FROM patients WHERE clinic_id = $1';
    const values: any[] = [clinicId];

    if (filters?.search) {
      query += ' AND (full_name ILIKE $2 OR cpf ILIKE $2 OR email ILIKE $2)';
      values.push(`%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await this.db.pool.query(query, values);
    return rows;
  }

  async findById(id: string, clinicId: string) {
    const { rows } = await this.db.pool.query(
      'SELECT * FROM patients WHERE id = $1 AND clinic_id = $2',
      [id, clinicId]
    );
    return rows[0];
  }

  async create(data: any, clinicId: string) {
    return this.db.create('patients', data, clinicId);
  }

  async update(id: string, data: any, clinicId: string) {
    return this.db.update('patients', id, data, clinicId);
  }

  async delete(id: string, clinicId: string) {
    return this.db.delete('patients', id, clinicId);
  }
}
```

**Uso em rotas:**
```typescript
// routes/patients.ts
import { Router } from 'express';
import { PatientRepository } from '../repositories/PatientRepository';

const router = Router();

router.get('/patients', authenticate, injectClinicFilter, async (req, res) => {
  const repo = new PatientRepository(pool);
  const patients = await repo.findAll(req.clinicId, { search: req.query.search });
  res.json({ patients });
});

router.post('/patients', authenticate, injectClinicFilter, async (req, res) => {
  const repo = new PatientRepository(pool);
  const patient = await repo.create(req.body, req.clinicId);
  res.status(201).json({ patient });
});

export default router;
```

**Status:** ⏳ Pendente de implementação

---

### **FASE 3: Substituição do Storage** 📁

**Objetivo:** Trocar Supabase Storage por sistema local ou MinIO.

#### 3.1. Opção A: Sistema de Arquivos Local (Simples)

**Vantagens:** Zero configuração adicional, perfeito para single-server.

**Implementação:**
```typescript
// routes/storage.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const bucket = req.body.bucket || 'default';
    const uploadDir = path.join(__dirname, '../../storage', bucket);
    
    // Criar diretório se não existir
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Upload de arquivo
router.post('/storage/upload', authenticate, upload.single('file'), async (req, res) => {
  const bucket = req.body.bucket;
  const fileName = req.file.filename;
  
  res.json({
    path: `${bucket}/${fileName}`,
    publicUrl: `${process.env.BASE_URL}/storage/${bucket}/${fileName}`,
  });
});

// Download de arquivo
router.get('/storage/:bucket/:filename', async (req, res) => {
  const filePath = path.join(
    __dirname, 
    '../../storage', 
    req.params.bucket, 
    req.params.filename
  );
  
  try {
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// Deletar arquivo
router.delete('/storage/:bucket/:filename', authenticate, async (req, res) => {
  const filePath = path.join(
    __dirname,
    '../../storage',
    req.params.bucket,
    req.params.filename
  );
  
  try {
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

export default router;
```

**Servir arquivos via Nginx:**
```nginx
# nginx.conf
location /storage {
    alias /var/www/orthoplus/storage;
    autoindex off;
    
    # Cache de arquivos estáticos
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3.2. Opção B: MinIO (S3-Compatible, Profissional)

**Vantagens:** 
- Compatível com API S3 (fácil migração futura para AWS)
- Interface web para administração
- Suporte a replicação e versioning
- Escalável para múltiplos servidores

**Instalação MinIO:**
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Criar usuário e diretório
sudo useradd -r minio-user -s /sbin/nologin
sudo mkdir -p /mnt/minio-data
sudo chown minio-user:minio-user /mnt/minio-data

# Systemd service
sudo nano /etc/systemd/system/minio.service
```

**Configuração MinIO (systemd):**
```ini
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=notify
User=minio-user
Environment="MINIO_ROOT_USER=orthoplus"
Environment="MINIO_ROOT_PASSWORD=OrthoPlus2024!"
ExecStart=/usr/local/bin/minio server /mnt/minio-data --console-address ":9001"
Restart=always

[Install]
WantedBy=multi-user.target
```

**Iniciar MinIO:**
```bash
sudo systemctl enable minio
sudo systemctl start minio
```

**Cliente MinIO (Node.js):**
```typescript
// lib/minio-client.ts
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function uploadFile(bucket: string, filename: string, buffer: Buffer) {
  await minioClient.putObject(bucket, filename, buffer);
  
  // Retornar URL pública
  return `${process.env.BASE_URL}/storage/${bucket}/${filename}`;
}

export async function downloadFile(bucket: string, filename: string) {
  return minioClient.getObject(bucket, filename);
}

export async function deleteFile(bucket: string, filename: string) {
  return minioClient.removeObject(bucket, filename);
}

export default minioClient;
```

**Proxy Nginx para MinIO:**
```nginx
location /storage {
    proxy_pass http://localhost:9000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

#### 3.3. Migração de Buckets

**Buckets atuais do Supabase:**
- `avatars` (público) → Fotos de perfil
- `pep-anexos` (privado) → Anexos de prontuários

**Criar buckets no MinIO:**
```typescript
// scripts/setup-minio-buckets.ts
import minioClient from '../lib/minio-client';

async function setupBuckets() {
  const buckets = ['avatars', 'pep-anexos', 'radiografias', 'documentos'];
  
  for (const bucket of buckets) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket);
      console.log(`✅ Bucket ${bucket} criado`);
    }
  }
  
  // Configurar policy pública para avatars
  await minioClient.setBucketPolicy('avatars', JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: ['arn:aws:s3:::avatars/*'],
    }],
  }));
}

setupBuckets();
```

**Status:** ⏳ Pendente de implementação

---

### **FASE 4: Conversão de Edge Functions para API REST** 🔄

**Objetivo:** Migrar todas as 26 Edge Functions Deno para Node.js/Express.

#### 4.1. Estrutura da API REST

```
/api
├── /auth              # Autenticação (signup, signin, signout, me, refresh)
├── /modules           # Gestão de módulos (get-my-modules, toggle-module-state, request-new-module)
├── /backup            # Backup e restore (manual-backup, restore-backup, download-backup, configure-auto-backup)
├── /crypto            # Criptomoedas (sync-crypto-wallet, convert-crypto-to-brl, webhook-crypto-transaction)
├── /crypto/alerts     # Alertas cripto (send-crypto-price-alerts, check-volatility-alerts)
├── /crypto/realtime   # Notificações realtime (crypto-realtime-notifications)
├── /notifications     # Notificações gerais (create-notification, auto-notifications)
├── /agenda            # Agendamentos (schedule-appointments)
├── /estoque           # Estoque (send-stock-alerts, send-replenishment-alerts)
├── /estoque/pedidos   # Pedidos automáticos (gerar-pedidos-automaticos, enviar-pedido-automatico-api, processar-retry-pedidos)
├── /estoque/reposicao # Previsão de reposição (prever-reposicao)
├── /estoque/webhooks  # Webhooks fornecedores (webhook-confirmacao-pedido)
├── /radiografia       # IA Radiografia (analisar-radiografia)
├── /odontograma       # IA Odontograma (analyze-odontogram)
├── /payments          # Pagamentos (processar-pagamento, processar-split-pagamento)
├── /fidelidade        # Programa fidelidade (processar-fidelidade-pontos)
├── /cobranca          # Cobranças (enviar-cobranca)
├── /teleodontologia   # Teleconsultas (generate-video-token, agora-recording)
├── /bi                # Business Intelligence (schedule-bi-export)
├── /data              # Importação/Exportação (export-clinic-data, import-clinic-data)
└── /scheduled         # Jobs agendados (scheduled-cleanup, cleanup-old-backups)
```

#### 4.2. Conversões de Edge Functions (Exemplos Detalhados)

##### **Exemplo 1: get-my-modules**
```typescript
// supabase/functions/get-my-modules/index.ts → routes/modules.ts

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { ModuleRepository } from '../repositories/ModuleRepository';

const router = Router();

/**
 * GET /api/modules/my-modules
 * Retorna módulos da clínica com status de ativação e dependências
 * Requer autenticação
 */
router.get('/my-modules', authenticate, async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;
    const repo = new ModuleRepository(pool);
    
    // 1. Buscar catálogo completo de módulos
    const catalog = await repo.getAllModules();
    
    // 2. Buscar módulos contratados pela clínica
    const clinicModules = await repo.getClinicModules(clinicId);
    
    // 3. Buscar dependências entre módulos
    const dependencies = await repo.getModuleDependencies();
    
    // 4. Buscar módulos ativos (is_active = true)
    const activeModuleKeys = clinicModules
      .filter(cm => cm.is_active)
      .map(cm => cm.module_key);
    
    // 5. Processar cada módulo do catálogo
    const modules = catalog.map(module => {
      const clinicModule = clinicModules.find(cm => cm.module_key === module.module_key);
      const subscribed = !!clinicModule;
      const isActive = clinicModule?.is_active || false;
      
      // Verificar dependências (módulos que ESTE módulo requer)
      const moduleDeps = dependencies.filter(d => d.module_id === module.id);
      const requiredModuleKeys = moduleDeps.map(d => d.depends_on_module_key);
      
      // Pode ativar? Todas as dependências devem estar ativas
      const canActivate = requiredModuleKeys.every(key => activeModuleKeys.includes(key));
      const unmetDependencies = requiredModuleKeys.filter(key => !activeModuleKeys.includes(key));
      
      // Pode desativar? Nenhum módulo ativo pode depender dele
      const dependentModules = dependencies
        .filter(d => d.depends_on_module_key === module.module_key)
        .map(d => d.module_key);
      const activeDependent = dependentModules.filter(key => activeModuleKeys.includes(key));
      const canDeactivate = activeDependent.length === 0;
      
      return {
        ...module,
        subscribed,
        is_active: isActive,
        can_activate: !isActive && canActivate,
        can_deactivate: isActive && canDeactivate,
        unmet_dependencies: !canActivate ? unmetDependencies : [],
        blocking_modules: !canDeactivate ? activeDependent : [],
      };
    });
    
    res.json({ modules });
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

export default router;
```

##### **Exemplo 2: toggle-module-state**
```typescript
// supabase/functions/toggle-module-state/index.ts → routes/modules.ts

/**
 * POST /api/modules/toggle-state
 * Ativa ou desativa um módulo (com verificação de dependências)
 * Requer role ADMIN
 */
router.post('/toggle-state', authenticate, requireAdmin, async (req, res) => {
  const { module_key } = req.body;
  const clinicId = req.user.clinic_id;
  const userId = req.user.user_id;
  
  const client = await pool.connect(); // Transação
  
  try {
    await client.query('BEGIN');
    
    // 1. Buscar módulo da clínica
    const { rows: [clinicModule] } = await client.query(
      `SELECT cm.*, mc.name as module_name 
       FROM clinic_modules cm
       JOIN module_catalog mc ON cm.module_catalog_id = mc.id
       WHERE cm.clinic_id = $1 AND mc.module_key = $2`,
      [clinicId, module_key]
    );
    
    if (!clinicModule) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }
    
    const newState = !clinicModule.is_active;
    
    // 2. Se tentando ATIVAR, verificar dependências
    if (newState === true) {
      const { rows: dependencies } = await client.query(
        `SELECT mc.module_key, mc.name
         FROM module_dependencies md
         JOIN module_catalog mc ON md.depends_on_module_id = mc.id
         WHERE md.module_id = (SELECT id FROM module_catalog WHERE module_key = $1)`,
        [module_key]
      );
      
      if (dependencies.length > 0) {
        // Verificar se todas as dependências estão ativas
        const { rows: activeModules } = await client.query(
          `SELECT mc.module_key
           FROM clinic_modules cm
           JOIN module_catalog mc ON cm.module_catalog_id = mc.id
           WHERE cm.clinic_id = $1 AND cm.is_active = true`,
          [clinicId]
        );
        
        const activeKeys = activeModules.map(m => m.module_key);
        const unmetDeps = dependencies.filter(d => !activeKeys.includes(d.module_key));
        
        if (unmetDeps.length > 0) {
          await client.query('ROLLBACK');
          return res.status(412).json({
            error: 'Falha ao ativar. Dependências não atendidas.',
            unmet_dependencies: unmetDeps.map(d => d.name),
          });
        }
      }
    }
    
    // 3. Se tentando DESATIVAR, verificar dependentes
    if (newState === false) {
      const { rows: dependents } = await client.query(
        `SELECT mc.module_key, mc.name
         FROM module_dependencies md
         JOIN module_catalog mc ON md.module_id = mc.id
         WHERE md.depends_on_module_id = (SELECT id FROM module_catalog WHERE module_key = $1)`,
        [module_key]
      );
      
      if (dependents.length > 0) {
        // Verificar se algum dependente está ativo
        const { rows: activeModules } = await client.query(
          `SELECT mc.module_key
           FROM clinic_modules cm
           JOIN module_catalog mc ON cm.module_catalog_id = mc.id
           WHERE cm.clinic_id = $1 AND cm.is_active = true`,
          [clinicId]
        );
        
        const activeKeys = activeModules.map(m => m.module_key);
        const blockingModules = dependents.filter(d => activeKeys.includes(d.module_key));
        
        if (blockingModules.length > 0) {
          await client.query('ROLLBACK');
          return res.status(412).json({
            error: 'Falha ao desativar. Módulos dependentes ativos.',
            blocking_modules: blockingModules.map(m => m.name),
          });
        }
      }
    }
    
    // 4. Atualizar estado do módulo
    await client.query(
      `UPDATE clinic_modules 
       SET is_active = $1, updated_at = NOW()
       WHERE clinic_id = $2 AND module_catalog_id = (SELECT id FROM module_catalog WHERE module_key = $3)`,
      [newState, clinicId, module_key]
    );
    
    // 5. Registrar em audit logs
    await client.query(
      `INSERT INTO audit_logs (user_id, clinic_id, action, target_module_id, details)
       VALUES ($1, $2, $3, (SELECT id FROM module_catalog WHERE module_key = $4), $5)`,
      [
        userId,
        clinicId,
        newState ? 'MODULE_ACTIVATED' : 'MODULE_DEACTIVATED',
        module_key,
        JSON.stringify({ module_name: clinicModule.module_name, new_state: newState }),
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      module_key,
      is_active: newState,
      message: `Módulo ${newState ? 'ativado' : 'desativado'} com sucesso`,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao alternar estado do módulo:', error);
    res.status(500).json({ error: 'Erro ao alternar estado do módulo' });
  } finally {
    client.release();
  }
});
```

##### **Exemplo 3: sync-crypto-wallet**
```typescript
// supabase/functions/sync-crypto-wallet/index.ts → routes/crypto.ts

import axios from 'axios';

/**
 * POST /api/crypto/sync-wallet/:walletId
 * Sincroniza saldo de carteira com exchange (Binance, Coinbase, etc)
 * Requer autenticação
 */
router.post('/sync-wallet/:walletId', authenticate, async (req, res) => {
  try {
    const { walletId } = req.params;
    const clinicId = req.user.clinic_id;
    
    // 1. Buscar carteira
    const { rows: [wallet] } = await pool.query(
      `SELECT w.*, ec.exchange_name, ec.api_key, ec.api_secret
       FROM crypto_wallets w
       JOIN crypto_exchange_config ec ON w.exchange_config_id = ec.id
       WHERE w.id = $1 AND w.clinic_id = $2`,
      [walletId, clinicId]
    );
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // 2. Buscar saldo via API da exchange
    let balance: number;
    let currentRate: number;
    
    switch (wallet.exchange_name) {
      case 'BINANCE':
        balance = await fetchBinanceBalance(wallet.api_key, wallet.api_secret, wallet.coin_type);
        currentRate = await fetchBinanceRate(wallet.coin_type);
        break;
      
      case 'COINBASE':
        balance = await fetchCoinbaseBalance(wallet.api_key, wallet.api_secret, wallet.coin_type);
        currentRate = await fetchCoinbaseRate(wallet.coin_type);
        break;
      
      default:
        return res.status(400).json({ error: 'Exchange não suportada' });
    }
    
    // 3. Atualizar carteira
    const { rows: [updated] } = await pool.query(
      `UPDATE crypto_wallets
       SET balance = $1, last_sync_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [balance, walletId]
    );
    
    // 4. Salvar cotação atual
    await pool.query(
      `INSERT INTO crypto_exchange_rates (coin_type, exchange, rate_brl, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      [wallet.coin_type, wallet.exchange_name, currentRate]
    );
    
    res.json({
      success: true,
      wallet: updated,
      current_rate: currentRate,
      balance_brl: balance * currentRate,
    });
  } catch (error) {
    console.error('Erro ao sincronizar carteira:', error);
    res.status(500).json({ error: 'Erro ao sincronizar carteira' });
  }
});

// Helpers para buscar saldo em exchanges
async function fetchBinanceBalance(apiKey: string, apiSecret: string, coin: string) {
  const response = await axios.get('https://api.binance.com/api/v3/account', {
    headers: { 'X-MBX-APIKEY': apiKey },
    // Adicionar assinatura HMAC conforme documentação Binance
  });
  
  const balance = response.data.balances.find((b: any) => b.asset === coin);
  return parseFloat(balance?.free || '0');
}

async function fetchBinanceRate(coin: string) {
  const response = await axios.get(`https://api.binance.com/api/v3/ticker/price`, {
    params: { symbol: `${coin}BRL` },
  });
  return parseFloat(response.data.price);
}
```

##### **Exemplo 4: analisar-radiografia (IA)**
```typescript
// supabase/functions/analisar-radiografia/index.ts → routes/radiografia.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/radiografia/analyze
 * Analisa radiografia usando IA (GPT-4 Vision)
 * Requer autenticação e módulo IA ativo
 */
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { patient_id, image_url, radiography_type } = req.body;
    const clinicId = req.user.clinic_id;
    
    // 1. Verificar se módulo IA está ativo
    const { rows: [module] } = await pool.query(
      `SELECT cm.is_active
       FROM clinic_modules cm
       JOIN module_catalog mc ON cm.module_catalog_id = mc.id
       WHERE cm.clinic_id = $1 AND mc.module_key = 'IA'`,
      [clinicId]
    );
    
    if (!module?.is_active) {
      return res.status(403).json({ error: 'Módulo IA não ativo' });
    }
    
    // 2. Enviar imagem para OpenAI GPT-4 Vision
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise de radiografias odontológicas. 
                    Analise a imagem e forneça um relatório detalhado incluindo:
                    1. Problemas detectados (cáries, fraturas, problemas de raiz)
                    2. Gravidade de cada problema (leve, moderada, grave)
                    3. Sugestões de tratamento para cada problema detectado`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analise esta radiografia ${radiography_type}:`,
            },
            {
              type: 'image_url',
              image_url: { url: image_url },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });
    
    const analysis = completion.choices[0].message.content;
    
    // 3. Parsear resposta da IA (JSON estruturado)
    const parsedAnalysis = parseAIAnalysis(analysis);
    
    // 4. Salvar análise no banco
    const { rows: [saved] } = await pool.query(
      `INSERT INTO radiografia_analises 
       (clinic_id, patient_id, image_url, radiography_type, ai_analysis, detected_problems, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED')
       RETURNING *`,
      [
        clinicId,
        patient_id,
        image_url,
        radiography_type,
        analysis,
        JSON.stringify(parsedAnalysis.problems),
      ]
    );
    
    res.json({
      success: true,
      analysis: saved,
      problems: parsedAnalysis.problems,
      suggestions: parsedAnalysis.suggestions,
    });
  } catch (error) {
    console.error('Erro ao analisar radiografia:', error);
    res.status(500).json({ error: 'Erro ao analisar radiografia' });
  }
});

function parseAIAnalysis(text: string) {
  // Parsear resposta da IA para estrutura JSON
  // Implementação específica baseada no formato de resposta
  return {
    problems: [],
    suggestions: [],
  };
}
```

#### 4.3. Lista Completa de Conversões

| # | Edge Function | Endpoint REST | Status |
|---|---------------|---------------|--------|
| 1 | `get-my-modules` | `GET /api/modules/my-modules` | ⏳ Pendente |
| 2 | `toggle-module-state` | `POST /api/modules/toggle-state` | ⏳ Pendente |
| 3 | `request-new-module` | `POST /api/modules/request-new` | ⏳ Pendente |
| 4 | `manual-backup` | `POST /api/backup/manual` | ⏳ Pendente |
| 5 | `configure-auto-backup` | `POST /api/backup/configure-auto` | ⏳ Pendente |
| 6 | `restore-backup` | `POST /api/backup/restore` | ⏳ Pendente |
| 7 | `download-backup` | `GET /api/backup/download/:id` | ⏳ Pendente |
| 8 | `cleanup-old-backups` | `POST /api/scheduled/cleanup-backups` | ⏳ Pendente |
| 9 | `sync-crypto-wallet` | `POST /api/crypto/sync-wallet/:id` | ⏳ Pendente |
| 10 | `convert-crypto-to-brl` | `POST /api/crypto/convert-to-brl` | ⏳ Pendente |
| 11 | `webhook-crypto-transaction` | `POST /api/crypto/webhook/transaction` | ⏳ Pendente |
| 12 | `send-crypto-price-alerts` | `POST /api/crypto/alerts/send` | ⏳ Pendente |
| 13 | `check-volatility-alerts` | `POST /api/crypto/alerts/check-volatility` | ⏳ Pendente |
| 14 | `crypto-realtime-notifications` | `WebSocket /api/crypto/realtime` | ⏳ Pendente |
| 15 | `create-notification` | `POST /api/notifications/create` | ⏳ Pendente |
| 16 | `auto-notifications` | `POST /api/notifications/auto` | ⏳ Pendente |
| 17 | `schedule-appointments` | `POST /api/agenda/schedule` | ⏳ Pendente |
| 18 | `send-stock-alerts` | `POST /api/estoque/alerts/send` | ⏳ Pendente |
| 19 | `send-replenishment-alerts` | `POST /api/estoque/alerts/replenishment` | ⏳ Pendente |
| 20 | `prever-reposicao` | `POST /api/estoque/reposicao/prever` | ⏳ Pendente |
| 21 | `gerar-pedidos-automaticos` | `POST /api/estoque/pedidos/gerar-auto` | ⏳ Pendente |
| 22 | `enviar-pedido-automatico-api` | `POST /api/estoque/pedidos/enviar-api` | ⏳ Pendente |
| 23 | `processar-retry-pedidos` | `POST /api/estoque/pedidos/retry` | ⏳ Pendente |
| 24 | `webhook-confirmacao-pedido` | `POST /api/estoque/webhooks/confirmacao` | ⏳ Pendente |
| 25 | `analisar-radiografia` | `POST /api/radiografia/analyze` | ⏳ Pendente |
| 26 | `analyze-odontogram` | `POST /api/odontograma/analyze` | ⏳ Pendente |
| 27 | `processar-pagamento` | `POST /api/payments/process` | ⏳ Pendente |
| 28 | `processar-split-pagamento` | `POST /api/payments/process-split` | ⏳ Pendente |
| 29 | `processar-fidelidade-pontos` | `POST /api/fidelidade/process-points` | ⏳ Pendente |
| 30 | `enviar-cobranca` | `POST /api/cobranca/send` | ⏳ Pendente |
| 31 | `generate-video-token` | `POST /api/teleodontologia/generate-token` | ⏳ Pendente |
| 32 | `agora-recording` | `POST /api/teleodontologia/recording` | ⏳ Pendente |
| 33 | `schedule-bi-export` | `POST /api/bi/schedule-export` | ⏳ Pendente |
| 34 | `export-clinic-data` | `POST /api/data/export` | ⏳ Pendente |
| 35 | `import-clinic-data` | `POST /api/data/import` | ⏳ Pendente |
| 36 | `scheduled-cleanup` | `POST /api/scheduled/cleanup` | ⏳ Pendente |

**Status:** ⏳ Todas pendentes de implementação

---

### **FASE 5: Substituição do Realtime (WebSockets)** 🔴

**Objetivo:** Substituir `supabase.channel()` por WebSockets nativos via Socket.io.

#### 5.1. Backend WebSocket (Socket.io)

**Instalação:**
```bash
npm install socket.io
npm install @types/socket.io --save-dev
```

**Servidor WebSocket:**
```typescript
// server.ts (integrar com Express)
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from './lib/jwt';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware de autenticação Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Token não fornecido'));
  }
  
  try {
    const user = verifyToken(token);
    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error('Token inválido'));
  }
});

// Conexão de cliente
io.on('connection', (socket) => {
  const user = socket.data.user;
  const clinicId = user.clinic_id;
  
  // Usuário entra na "sala" da sua clínica
  socket.join(`clinic_${clinicId}`);
  
  console.log(`✅ User ${user.email} conectado (clinic: ${clinicId})`);
  
  socket.on('disconnect', () => {
    console.log(`❌ User ${user.email} desconectado`);
  });
});

// Exportar io para uso em outras partes da aplicação
export { io };

httpServer.listen(3001, () => {
  console.log('🚀 API + WebSocket rodando na porta 3001');
});
```

#### 5.2. Emitir Eventos via PostgreSQL Triggers

**Trigger para notificar mudanças:**
```sql
-- Função genérica para notificar mudanças
CREATE OR REPLACE FUNCTION notify_table_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'table_changes',
    json_build_object(
      'table', TG_TABLE_NAME,
      'clinic_id', COALESCE(NEW.clinic_id, OLD.clinic_id),
      'action', TG_OP,
      'id', COALESCE(NEW.id, OLD.id)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas críticas
CREATE TRIGGER contas_receber_notify
AFTER INSERT OR UPDATE OR DELETE ON contas_receber
FOR EACH ROW EXECUTE FUNCTION notify_table_change();

CREATE TRIGGER patients_notify
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION notify_table_change();

CREATE TRIGGER agenda_notify
AFTER INSERT OR UPDATE OR DELETE ON agenda
FOR EACH ROW EXECUTE FUNCTION notify_table_change();

-- Adicionar triggers em todas as tabelas relevantes
```

**Listener Node.js para pg_notify:**
```typescript
// lib/pg-listener.ts
import { Pool } from 'pg';
import { io } from '../server';

const listenerPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function setupPostgresListener() {
  const client = await listenerPool.connect();
  
  await client.query('LISTEN table_changes');
  
  client.on('notification', (msg) => {
    if (msg.channel === 'table_changes' && msg.payload) {
      const data = JSON.parse(msg.payload);
      
      // Emitir evento via Socket.io para a clínica específica
      io.to(`clinic_${data.clinic_id}`).emit(`${data.table}_changed`, {
        action: data.action, // INSERT, UPDATE, DELETE
        id: data.id,
        table: data.table,
      });
      
      console.log(`📡 Evento emitido: ${data.table}_changed para clinic ${data.clinic_id}`);
    }
  });
  
  console.log('✅ PostgreSQL Listener ativo');
}
```

#### 5.3. Frontend (Socket.io Client)

**Instalação:**
```bash
npm install socket.io-client
```

**Context de WebSocket:**
```typescript
// src/contexts/WebSocketContext.tsx
import { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
});

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    
    if (!token) return;

    // Conectar ao WebSocket
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
```

**Hook para escutar mudanças em tabelas:**
```typescript
// src/hooks/useRealtimeTable.ts
import { useContext, useEffect } from 'react';
import { WebSocketContext } from '@/contexts/WebSocketContext';

export function useRealtimeTable(tableName: string, onUpdate: () => void) {
  const { socket } = useContext(WebSocketContext);

  useEffect(() => {
    if (!socket) return;

    const eventName = `${tableName}_changed`;

    socket.on(eventName, (data) => {
      console.log(`📡 Recebido: ${eventName}`, data);
      onUpdate(); // Callback para recarregar dados
    });

    return () => {
      socket.off(eventName);
    };
  }, [socket, tableName, onUpdate]);
}
```

**Uso em componentes:**
```typescript
// src/modules/financeiro/hooks/useFinanceiroSupabase.ts (REFATORADO)

import { useRealtimeTable } from '@/hooks/useRealtimeTable';

export function useFinanceiroSupabase() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  async function loadData() {
    const { data } = await apiClient.get('/api/financeiro/transacoes');
    setTransactions(data.transactions);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Escutar mudanças em tempo real via WebSocket
  useRealtimeTable('contas_receber', () => {
    console.log('🔄 Transações atualizadas, recarregando...');
    loadData(); // Reload automático
  });

  return { transactions, loading };
}
```

**Status:** ⏳ Pendente de implementação

---

### **FASE 6: Infraestrutura e Deployment** 🏗️

**Objetivo:** Configurar servidor Ubuntu com toda a stack.

#### 6.1. Arquitetura Final do Servidor

```
Ubuntu Server 24.04 LTS (4GB RAM, 2 CPU, 80GB SSD)
├── PostgreSQL 16                (porta 5432)
├── Node.js API + WebSocket      (porta 3001)
├── React Frontend (build)       (servido por Nginx porta 80/443)
├── Nginx (Reverse Proxy)        (porta 80/443)
│   ├── / → Frontend estático
│   ├── /api → Express API
│   ├── /socket.io → WebSocket
│   ├── /storage → Arquivos (MinIO ou local)
│   ├── /grafana → Grafana (porta 3000)
│   └── /prometheus → Prometheus (porta 9090)
├── MinIO (Object Storage)       (porta 9000, 9001)
├── Redis (Cache)                (porta 6379)
├── Prometheus (Métricas)        (porta 9090)
├── Grafana (Dashboards)         (porta 3000)
└── PM2 (Process Manager Node)
```

#### 6.2. Script de Instalação Standalone Completo

```bash
#!/bin/bash
# install-standalone.sh - Instalação completa do Ortho+ Standalone

set -e # Parar em caso de erro

echo "🚀 Iniciando instalação do Ortho+ Standalone..."

# Variáveis de configuração
DB_NAME="orthoplus"
DB_USER="orthoplus_user"
DB_PASSWORD=$(openssl rand -base64 16)
INSTALL_DIR="/var/www/orthoplus"
DOMAIN="orthoplus.local" # Alterar para domínio real

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências básicas
echo "📦 Instalando dependências..."
apt install -y curl wget git build-essential ufw nginx redis-server

# 3. Instalar PostgreSQL 16
echo "🐘 Instalando PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-16 postgresql-contrib-16

# 4. Configurar PostgreSQL
echo "🔧 Configurando PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

# 5. Instalar Node.js 20.x
echo "🟩 Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 6. Instalar PM2 (Process Manager)
echo "📦 Instalando PM2..."
npm install -g pm2

# 7. Clonar/Copiar código do Ortho+
echo "📂 Preparando diretório de instalação..."
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Assumindo que código já está no servidor (ou git clone)
# git clone https://github.com/tsitelecom/orthoplus.git .

# 8. Instalar dependências Node.js
echo "📦 Instalando dependências do backend..."
cd api
npm install
npm run build # Compilar TypeScript

# 9. Configurar variáveis de ambiente
echo "🔐 Configurando variáveis de ambiente..."
cat > $INSTALL_DIR/api/.env <<EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
REDIS_URL=redis://localhost:6379
BASE_URL=https://$DOMAIN
FRONTEND_URL=https://$DOMAIN

# APIs externas (configurar conforme necessário)
OPENAI_API_KEY=
RESEND_API_KEY=
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
MERCADOPAGO_ACCESS_TOKEN=
EOF

# 10. Executar migrations do banco
echo "🗃️ Executando migrations..."
npm install node-pg-migrate -g
node-pg-migrate up --database-url-var DATABASE_URL

# 11. Iniciar API com PM2
echo "🚀 Iniciando API com PM2..."
pm2 start dist/server.js --name orthoplus-api
pm2 save
pm2 startup # Configurar auto-start no boot

# 12. Build do frontend
echo "🎨 Compilando frontend..."
cd $INSTALL_DIR
npm install
npm run build

# 13. Instalar MinIO (opcional)
echo "📦 Instalando MinIO..."
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
mv minio /usr/local/bin/

# Criar usuário e diretório MinIO
useradd -r minio-user -s /sbin/nologin
mkdir -p /mnt/minio-data
chown minio-user:minio-user /mnt/minio-data

# Systemd service para MinIO
cat > /etc/systemd/system/minio.service <<EOF
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=notify
User=minio-user
Environment="MINIO_ROOT_USER=orthoplus"
Environment="MINIO_ROOT_PASSWORD=$(openssl rand -base64 16)"
ExecStart=/usr/local/bin/minio server /mnt/minio-data --console-address ":9001"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable minio
systemctl start minio

# 14. Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/orthoplus <<'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    # Redirecionar HTTP para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    # SSL (certificado Let's Encrypt ou self-signed)
    ssl_certificate /etc/ssl/certs/orthoplus.crt;
    ssl_certificate_key /etc/ssl/private/orthoplus.key;

    # Frontend (Build React)
    root /var/www/orthoplus/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API REST
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (Socket.io)
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Storage (MinIO)
    location /storage {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
    }

    # Grafana
    location /grafana/ {
        proxy_pass http://localhost:3000/;
    }

    # Prometheus
    location /prometheus/ {
        proxy_pass http://localhost:9090/;
    }
}
EOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/orthoplus
ln -s /etc/nginx/sites-available/orthoplus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Gerar certificado SSL self-signed (trocar por Let's Encrypt em produção)
mkdir -p /etc/ssl/private
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/orthoplus.key \
  -out /etc/ssl/certs/orthoplus.crt \
  -subj "/CN=$DOMAIN"

nginx -t
systemctl restart nginx

# 15. Configurar Firewall (UFW)
echo "🔥 Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 16. Instalar Prometheus
echo "📊 Instalando Prometheus..."
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
mv prometheus-2.45.0.linux-amd64 /opt/prometheus

# Configuração básica Prometheus
cat > /opt/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'orthoplus-api'
    static_configs:
      - targets: ['localhost:3001']
  
  - job_name: 'postgresql'
    static_configs:
      - targets: ['localhost:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
EOF

# Systemd service para Prometheus
cat > /etc/systemd/system/prometheus.service <<EOF
[Unit]
Description=Prometheus
After=network.target

[Service]
User=root
ExecStart=/opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml --storage.tsdb.path=/opt/prometheus/data
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable prometheus
systemctl start prometheus

# 17. Instalar Grafana
echo "📈 Instalando Grafana..."
apt install -y software-properties-common
add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
apt update
apt install -y grafana

systemctl enable grafana-server
systemctl start grafana-server

# 18. Configurar backup automático
echo "💾 Configurando backup automático..."
cat > /usr/local/bin/orthoplus-backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/orthoplus"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U orthoplus_user orthoplus | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup arquivos (storage)
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/www/orthoplus/storage

# Backup configs
tar -czf $BACKUP_DIR/configs_$DATE.tar.gz /var/www/orthoplus/api/.env /etc/nginx/sites-available/orthoplus

# Remover backups antigos (>30 dias)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "✅ Backup concluído: $DATE"
EOF

chmod +x /usr/local/bin/orthoplus-backup.sh

# Cron job para backup diário às 2h
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/orthoplus-backup.sh") | crontab -

# 19. Salvar credenciais
echo "📝 Salvando credenciais..."
cat > $INSTALL_DIR/CREDENTIALS.txt <<EOF
===========================================
   ORTHO+ STANDALONE - CREDENCIAIS
===========================================

🗃️ PostgreSQL:
   Database: $DB_NAME
   User: $DB_USER
   Password: $DB_PASSWORD
   Connection: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

📦 MinIO:
   Console: http://$DOMAIN:9001
   User: orthoplus
   Password: (ver /etc/systemd/system/minio.service)

📊 Grafana:
   URL: http://$DOMAIN:3000
   User padrão: admin
   Password padrão: admin (trocar no primeiro login)

📡 Prometheus:
   URL: http://$DOMAIN:9090

🔑 JWT Secrets:
   (ver $INSTALL_DIR/api/.env)

===========================================
EOF

chmod 600 $INSTALL_DIR/CREDENTIALS.txt

echo ""
echo "✅ =========================================="
echo "✅  INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "✅ =========================================="
echo ""
echo "📁 Diretório de instalação: $INSTALL_DIR"
echo "🌐 Acessar sistema: https://$DOMAIN"
echo "🔐 Credenciais salvas em: $INSTALL_DIR/CREDENTIALS.txt"
echo ""
echo "🔧 Comandos úteis:"
echo "   pm2 status              # Status da API"
echo "   pm2 logs orthoplus-api  # Logs da API"
echo "   pm2 restart orthoplus-api # Reiniciar API"
echo "   systemctl status postgresql # Status PostgreSQL"
echo "   systemctl status nginx  # Status Nginx"
echo ""
echo "📚 Documentação completa: $INSTALL_DIR/README.md"
echo ""
```

#### 6.3. Uso do Script

```bash
# Fazer download do script
wget https://github.com/tsitelecom/orthoplus/raw/main/install-standalone.sh

# Dar permissão de execução
chmod +x install-standalone.sh

# Executar como root
sudo ./install-standalone.sh
```

**Status:** ⏳ Pendente de implementação

---

### **FASE 7: Refatoração do Frontend** 🎨

**Objetivo:** Remover todas as referências ao `@supabase/supabase-js`.

#### 7.1. Criar Cliente API Axios

```typescript
// src/lib/api-client.ts
import axios, { AxiosInstance } from 'axios';
import { toast } from '@/hooks/use-toast';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout
});

// Interceptor para adicionar JWT em todas as requisições
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expirado? Tentar renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem('jwt', data.token);
          localStorage.setItem('refresh_token', data.refresh_token);

          // Retentar requisição original com novo token
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Falha ao renovar token, redirecionar para login
          localStorage.removeItem('jwt');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      }
    }

    // Exibir toast de erro
    const message = error.response?.data?.error || 'Erro ao conectar com servidor';
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive',
    });

    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 7.2. Refatorar Hooks Supabase

**Exemplo: useFinanceiroSupabase.ts**

```typescript
// ANTES (Supabase)
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('contas_receber')
  .select('*')
  .eq('clinic_id', clinicId)
  .order('created_at', { ascending: false });

// DEPOIS (API REST)
import apiClient from '@/lib/api-client';

const { data } = await apiClient.get('/api/financeiro/contas-receber');
// clinic_id já é injetado automaticamente no backend via JWT
```

**Conversão completa do hook:**

```typescript
// src/modules/financeiro/hooks/useFinanceiroSupabase.ts (REFATORADO)

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

export function useFinanceiroSupabase() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const { data } = await apiClient.get('/api/financeiro/transacoes');
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Realtime via WebSocket (substituindo supabase.channel)
  useRealtimeTable('contas_receber', loadData);

  async function createTransaction(data: any) {
    const response = await apiClient.post('/api/financeiro/transacoes', data);
    return response.data.transaction;
  }

  async function updateTransaction(id: string, data: any) {
    await apiClient.put(`/api/financeiro/transacoes/${id}`, data);
  }

  async function deleteTransaction(id: string) {
    await apiClient.delete(`/api/financeiro/transacoes/${id}`);
  }

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadData,
  };
}
```

#### 7.3. Atualizar Variáveis de Ambiente

```bash
# .env (frontend)

# URL da API Node.js standalone
VITE_API_URL=https://orthoplus.local/api

# Remover variáveis Supabase (não mais necessárias)
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
```

#### 7.4. Remover Dependência Supabase

```bash
# Remover pacote @supabase/supabase-js
npm uninstall @supabase/supabase-js

# Remover arquivos relacionados
rm -rf src/integrations/supabase
```

**Status:** ⏳ Pendente de implementação

---

### **FASE 8: Testes e Validação** ✅

**Objetivo:** Garantir que sistema standalone funciona 100%.

#### 8.1. Testes End-to-End (Playwright)

**Executar suite completa existente:**
```bash
npm run test:e2e
```

**Testes críticos a validar:**
- ✅ Autenticação (signup, login, logout)
- ✅ CRUD de pacientes
- ✅ Agendamentos
- ✅ PEP (prontuário, odontograma)
- ✅ Transações financeiras
- ✅ Gestão de módulos (toggle, dependências)
- ✅ Permissões granulares (ADMIN vs MEMBER)
- ✅ Realtime (WebSocket updates)

#### 8.2. Testes de Performance

**Load testing com k6:**
```bash
npm install -g k6

# Criar script de teste
cat > load-test.js <<'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp-up para 100 usuários
    { duration: '1m', target: 1000 },  // Manter 1000 usuários
    { duration: '30s', target: 0 },    // Ramp-down
  ],
};

export default function () {
  const token = 'seu_jwt_aqui';
  
  let res = http.get('https://orthoplus.local/api/patients', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
EOF

k6 run load-test.js
```

**Métricas alvo:**
- Latência de API: < 200ms (P95)
- Realtime delay: < 500ms
- Throughput: > 1000 req/s
- Error rate: < 0.1%

#### 8.3. Testes de Segurança

**Vulnerabilidades a testar:**
- SQL Injection (usar prepared statements)
- XSS (sanitização de inputs)
- CSRF (tokens em formulários)
- JWT expiration e refresh
- RLS bypass (verificar middleware de clínica)

**Ferramentas:**
```bash
# OWASP ZAP (scanner de vulnerabilidades)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://orthoplus.local

# SQLMap (SQL Injection)
sqlmap -u "https://orthoplus.local/api/patients?id=1" --cookie="jwt=..."
```

#### 8.4. Validação de Dados

**Migração de dados do Supabase:**
```bash
# Exportar dados do Supabase via API
curl -X GET https://yxpoqjyfgotkytwtifau.supabase.co/rest/v1/patients \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_TOKEN" \
  > patients.json

# Importar no PostgreSQL standalone
psql -d orthoplus -c "\COPY patients FROM 'patients.json' WITH (FORMAT json)"
```

**Validar integridade:**
- Contagem de registros (Supabase vs Standalone)
- Foreign keys intactas
- Dados de arquivos (storage) migrados

**Status:** ⏳ Pendente de implementação

---

### **FASE 9: Documentação e Migração de Dados** 📚

**Objetivo:** Facilitar migração de clientes existentes.

#### 9.1. Documentação Completa

**Arquivos a criar:**

1. **`MIGRATION_GUIDE.md`** - Passo a passo da migração
2. **`API_DOCUMENTATION.md`** - Referência completa da API REST
3. **`DEPLOYMENT_GUIDE.md`** - Deploy em Ubuntu
4. **`BACKUP_RESTORE.md`** - Procedimentos de backup
5. **`TROUBLESHOOTING.md`** - Problemas comuns e soluções

#### 9.2. Script de Migração de Dados

```bash
#!/bin/bash
# migrate-from-supabase.sh

SUPABASE_URL="https://yxpoqjyfgotkytwtifau.supabase.co"
SUPABASE_KEY="seu_anon_key"
LOCAL_DB="postgresql://orthoplus_user:senha@localhost:5432/orthoplus"

# Lista de tabelas a migrar
TABLES=("patients" "dentistas" "funcionarios" "agenda" "procedimentos" "contas_receber" "crypto_wallets")

for table in "${TABLES[@]}"; do
  echo "📥 Migrando tabela: $table"
  
  # Exportar do Supabase
  curl -X GET "$SUPABASE_URL/rest/v1/$table?select=*" \
    -H "apikey: $SUPABASE_KEY" \
    > "/tmp/${table}.json"
  
  # Importar no PostgreSQL local
  psql $LOCAL_DB -c "\COPY $table FROM '/tmp/${table}.json' WITH (FORMAT json)"
  
  echo "✅ $table migrado"
done

# Migrar storage (avatars, anexos)
echo "📦 Migrando storage..."
aws s3 sync s3://supabase-bucket-yxpoqjyfgotkytwtifau /var/www/orthoplus/storage

echo "✅ Migração concluída!"
```

#### 9.3. Checklist de Migração

**Para o cliente:**
```markdown
## Checklist de Migração - Ortho+ Standalone

### Pré-Migração
- [ ] Backup completo do Supabase (dados + storage)
- [ ] Documentar secrets e API keys configurados
- [ ] Exportar lista de usuários e permissões
- [ ] Notificar usuários sobre janela de manutenção

### Durante a Migração
- [ ] Executar script de instalação standalone (`install-standalone.sh`)
- [ ] Migrar dados do PostgreSQL (via `migrate-from-supabase.sh`)
- [ ] Migrar arquivos de storage (S3 → MinIO/local)
- [ ] Configurar secrets (.env) no servidor standalone
- [ ] Validar integridade de dados (contagens, foreign keys)
- [ ] Executar suite de testes E2E

### Pós-Migração
- [ ] Atualizar DNS para apontar para servidor standalone
- [ ] Testar login de usuários existentes
- [ ] Validar funcionalidades críticas (agenda, PEP, financeiro)
- [ ] Configurar backup automático (cron job)
- [ ] Monitorar logs por 48h (Grafana + Prometheus)
- [ ] Desativar projeto Supabase após 30 dias de validação

### Rollback (se necessário)
- [ ] Manter Supabase ativo por 30 dias como fallback
- [ ] Backup do servidor standalone antes de desativar Supabase
- [ ] Procedimento de rollback documentado
```

**Status:** ⏳ Pendente de implementação

---

## 📊 Resumo Executivo

### Tempo Estimado de Desenvolvimento

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Autenticação JWT | 1-2 semanas |
| 2 | Migração Database | 1 semana |
| 3 | Storage (MinIO) | 3-5 dias |
| 4 | Edge Functions → API REST | 3-4 semanas |
| 5 | Realtime WebSocket | 1 semana |
| 6 | Infraestrutura | 1 semana |
| 7 | Refatoração Frontend | 2 semanas |
| 8 | Testes e Validação | 1-2 semanas |
| 9 | Documentação | 1 semana |
| **TOTAL** | **Desenvolvimento Completo** | **12-16 semanas** |

### Recursos Necessários

**Equipe mínima:**
- 1 Backend Developer (Node.js + PostgreSQL)
- 1 Frontend Developer (React + TypeScript)
- 1 DevOps Engineer (Ubuntu + Nginx + Docker)
- 1 QA Engineer (Testes E2E + Performance)

**Infraestrutura:**
- Servidor Ubuntu 24.04 LTS (4GB RAM, 2 CPU, 80GB SSD)
- Domínio próprio + SSL
- Backup externo (S3, Backblaze, etc)

### Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| **Perda de dados na migração** | Backup completo antes da migração + validação passo a passo |
| **Downtime prolongado** | Manter Supabase ativo como fallback por 30 dias |
| **Complexidade de manutenção** | Documentação completa + treinamento da equipe |
| **Performance inferior** | Load testing antes do go-live + otimizações de cache |
| **Bugs em produção** | Suite E2E completa + monitoramento 24/7 (Grafana) |

### ROI (Retorno sobre Investimento)

**Economia mensal por clínica:**
- Supabase Pro: ~$100/mês
- Standalone: ~$20/mês (servidor + backup)
- **Economia: $80/mês por clínica**

**Para 100 clínicas:**
- Economia anual: $96,000
- Custo de desenvolvimento: ~$80,000 (16 semanas × $5,000/semana)
- **ROI em 10 meses**

---

## 🎯 Próximos Passos

### Fase de Validação (Atual)

Antes de iniciar a migração, completar:

1. ✅ Validação funcional de todos os 26 módulos
2. ✅ Execução completa dos 126 testes E2E Playwright
3. ✅ Documentação do estado atual (schemas, Edge Functions, APIs)
4. ✅ Backup completo de dados do Supabase
5. ✅ Inventário de secrets e credenciais

### Execução do Plano Fênix

Após validação completa:
```bash
# Usuário confirma:
"Iniciar execução do Plano Fênix - Migração Standalone Ubuntu LTS"

# Começar pela FASE 1 (Autenticação)
```

---

## 📞 Suporte

**Desenvolvedor:** TSI Telecom  
**Repositório:** https://github.com/tsitelecom/orthoplus  
**Documentação:** https://github.com/tsitelecom/orthoplus/wiki

---

**Última atualização:** 2025-01-15  
**Versão do plano:** 1.0  
**Status:** 📋 Documentado, aguardando validação pré-migração
