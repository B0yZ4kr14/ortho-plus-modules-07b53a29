# Guia de Deploy - Ortho+ V5.2

## Visão Geral

O Ortho+ V5.2 suporta dois ambientes de deploy:
1. **Cloud**: Usando Supabase gerenciado (production-ready)
2. **On-Premises**: Usando PostgreSQL local + Docker Swarm

## Índice

1. [Deploy Cloud (Supabase)](#deploy-cloud-supabase)
2. [Deploy On-Premises (Docker Swarm)](#deploy-on-premises-docker-swarm)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoramento e Logs](#monitoramento-e-logs)
6. [Backup e Disaster Recovery](#backup-e-disaster-recovery)

---

## Deploy Cloud (Supabase)

### Pré-requisitos

- Conta no Lovable Cloud (Supabase gerenciado)
- Node.js 18+
- Bun ou npm

### Passo a Passo

#### 1. Build do Frontend

```bash
# Instalar dependências
bun install

# Build para produção
bun run build

# Preview local do build
bun run preview
```

#### 2. Deploy Automático via Lovable

O Lovable Cloud realiza deploy automático quando você faz push para a branch principal:

```bash
git add .
git commit -m "deploy: atualiza versão V5.2"
git push origin main
```

#### 3. Verificar Deploy

- Acesse: `https://seu-projeto.lovableproject.com`
- Verifique logs no painel do Lovable
- Teste funcionalidades críticas

#### 4. Edge Functions (Opcional)

Edge Functions são deployadas automaticamente ao fazer push:

```
supabase/functions/
├── get-dashboard-data/
├── sidebar-badges/
└── webhook-crypto-transaction/
```

---

## Deploy On-Premises (Docker Swarm)

### Arquitetura On-Premises

```
┌─────────────────────────────────────────────┐
│           Load Balancer (Traefik)           │
└───────────────────┬─────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐  ┌─────────────────┐
│  Frontend (3x)  │  │  Backend (3x)   │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  ▼
   ┌─────────────────────────────┐
   │  PostgreSQL Cluster (3x)    │
   │  + Redis (2x) + MinIO (2x)  │
   └─────────────────────────────┘
```

### Pré-requisitos

- Ubuntu Server 22.04 LTS
- Docker 24+ e Docker Swarm
- PostgreSQL 15+
- Mínimo: 8GB RAM, 4 CPUs, 100GB SSD

### Setup do Ambiente

#### 1. Inicializar Docker Swarm

```bash
# No nó manager
docker swarm init --advertise-addr <MANAGER_IP>

# Nos nós workers
docker swarm join --token <TOKEN> <MANAGER_IP>:2377
```

#### 2. Criar Networks

```bash
docker network create --driver overlay ortho_frontend
docker network create --driver overlay ortho_backend
docker network create --driver overlay ortho_db
```

#### 3. Deploy do Stack

```bash
# Build das imagens
docker build -t ortho-frontend:v5.2 -f Dockerfile.frontend .
docker build -t ortho-backend:v5.2 -f Dockerfile.backend ./backend

# Deploy do stack
docker stack deploy -c docker-stack.yml ortho
```

### Exemplo: `docker-stack.yml`

```yaml
version: '3.8'

services:
  frontend:
    image: ortho-frontend:v5.2
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - ortho_frontend
    environment:
      - VITE_BACKEND_TYPE=postgresql
      - VITE_POSTGRESQL_HOST=db_primary

  backend:
    image: ortho-backend:v5.2
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
    networks:
      - ortho_backend
      - ortho_db
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db_primary:5432/ortho
    secrets:
      - db_password

  db_primary:
    image: postgres:15-alpine
    deploy:
      placement:
        constraints:
          - node.role == manager
    networks:
      - ortho_db
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 2
    networks:
      - ortho_backend

  traefik:
    image: traefik:v2.10
    command:
      - --api.insecure=true
      - --providers.docker.swarm=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - ortho_frontend
      - ortho_backend
    deploy:
      placement:
        constraints:
          - node.role == manager

networks:
  ortho_frontend:
    driver: overlay
  ortho_backend:
    driver: overlay
  ortho_db:
    driver: overlay

volumes:
  db_data:

secrets:
  db_password:
    external: true
```

### Criar Secrets

```bash
echo "seu_password_seguro" | docker secret create db_password -
```

---

## Variáveis de Ambiente

### Cloud (Supabase)

```env
# .env.production (Lovable Cloud)
VITE_BACKEND_TYPE=supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
```

### On-Premises (PostgreSQL)

```env
# .env.production (Ubuntu Server)
VITE_BACKEND_TYPE=postgresql
VITE_POSTGRESQL_HOST=192.168.1.100
VITE_POSTGRESQL_PORT=5432
VITE_POSTGRESQL_DATABASE=orthoplus
VITE_POSTGRESQL_USER=orthoplus_user
VITE_POSTGRESQL_PASSWORD=secure_password

# Backend Node.js
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/ortho
REDIS_URL=redis://redis:6379
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
      - name: Deploy to Server
        run: |
          rsync -avz --delete dist/ user@server:/var/www/ortho/
```

---

## Monitoramento e Logs

### Prometheus + Grafana

```bash
# Expor métricas do backend
curl http://localhost:3000/metrics

# Dashboard Grafana pré-configurado
docker run -d -p 3001:3000 grafana/grafana
```

### Logs Centralizados

```bash
# Visualizar logs do stack
docker service logs ortho_backend -f

# Logs do PostgreSQL
docker service logs ortho_db_primary -f
```

---

## Backup e Disaster Recovery

### Backup Automático (PostgreSQL)

```bash
# Script de backup diário
#!/bin/bash
BACKUP_DIR=/backups
DATE=$(date +%Y%m%d_%H%M%S)

docker exec ortho_db_primary pg_dump -U ortho > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Reter últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Restauração

```bash
# Restaurar backup
gunzip -c backup_20250118_120000.sql.gz | docker exec -i ortho_db_primary psql -U ortho
```

### Geo-Replicação (Multi-Region)

```yaml
# docker-stack-replicated.yml
services:
  db_replica:
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICA_MODE=slave
      - POSTGRES_MASTER_HOST=db_primary
    networks:
      - ortho_db
```

---

## Troubleshooting

### Backend não conecta ao DB

```bash
# Verificar conectividade
docker exec ortho_backend ping db_primary

# Verificar credenciais
docker exec ortho_backend env | grep DATABASE
```

### Frontend não carrega

```bash
# Verificar build
ls -lh dist/

# Verificar variáveis de ambiente
docker service inspect ortho_frontend --pretty
```

### Performance degradada

```bash
# Verificar recursos
docker stats

# Verificar queries lentas (PostgreSQL)
docker exec ortho_db_primary psql -U ortho -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

---

## Suporte

- **Documentação**: `/docs`
- **Issues**: GitHub Issues
- **Logs**: Docker service logs
- **Métricas**: Prometheus `/metrics`

---

**Deploy seguro e escalável!** 🚀
