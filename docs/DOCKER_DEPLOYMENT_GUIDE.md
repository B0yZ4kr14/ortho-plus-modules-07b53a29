# 🐳 GUIA DE DEPLOYMENT - Docker Swarm

**Objetivo**: Orquestração completa do Ortho+ usando Docker Swarm para alta disponibilidade e escalabilidade.

---

## 📋 PRÉ-REQUISITOS

### Ambiente Cloud (Produção)
- Docker Engine 20.10+
- Docker Swarm inicializado
- Mínimo 3 nodes (1 manager, 2 workers)
- 16GB RAM total (8GB manager, 4GB por worker)
- 100GB storage SSD

### Ambiente On-Premises
- Docker Engine 20.10+
- Docker Swarm inicializado
- PostgreSQL 15+ (local ou gerenciado)
- Redis 7+
- Certificados SSL/TLS

---

## 🚀 DEPLOYMENT RÁPIDO

### 1. Inicializar Docker Swarm

```bash
# No node manager
docker swarm init --advertise-addr <MANAGER-IP>

# Nos nodes workers
docker swarm join --token <WORKER-TOKEN> <MANAGER-IP>:2377
```

### 2. Criar Secrets

```bash
# Database password
echo "senha_super_segura_123" | docker secret create db_password -

# JWT Secret
echo "jwt_secret_key_production" | docker secret create jwt_secret -

# PostgreSQL Key (se usar OrthoPlus Cloud)
echo "eyJhbGciOiJIUzI1NiIs..." | docker secret create PostgreSQL_key -
```

### 3. Build de Imagens

```bash
# Frontend
docker build -t orthoplus-frontend:latest .

# Backend
docker build -t orthoplus-backend:latest ./backend
```

### 4. Deploy do Stack

```bash
# Deployment completo
VERSION=latest docker stack deploy -c docker-stack.yml orthoplus

# Verificar status
docker service ls --filter label=com.docker.stack.namespace=orthoplus
```

---

## 🔧 CONFIGURAÇÃO AVANÇADA

### Escalabilidade Horizontal

```bash
# Escalar backend para 10 replicas
docker service scale orthoplus_backend=10

# Escalar frontend para 5 replicas
docker service scale orthoplus_frontend=5
```

### Rolling Update

```bash
# Atualizar backend sem downtime
docker service update \
  --image orthoplus-backend:v2.0.0 \
  --update-parallelism 2 \
  --update-delay 10s \
  orthoplus_backend
```

### Health Checks

```bash
# Ver status de saúde dos serviços
docker service ps orthoplus_backend --filter "desired-state=running"

# Logs em tempo real
docker service logs -f orthoplus_backend
```

---

## 🗄️ GERENCIAMENTO DE DATABASES

### Schema-per-Module Strategy

Cada módulo tem seu próprio banco PostgreSQL dedicado:

| Módulo | Database | Volume |
|--------|----------|--------|
| INVENTÁRIO | `db_inventario` | `db_inventario_data` |
| PDV | `db_pdv` | `db_pdv_data` |
| FINANCEIRO | `db_financeiro` | `db_financeiro_data` |
| CLÍNICA/PACIENTES | `db_clinica` | `db_clinica_data` |
| PEP | `db_pep` | `db_pep_data` |
| FATURAMENTO | `db_faturamento` | `db_faturamento_data` |
| CONFIGURAÇÕES | `db_configuracoes` | `db_configuracoes_data` |
| DATABASE_ADMIN | `db_database_admin` | `db_database_admin_data` |
| BACKUPS | `db_backups` | `db_backups_data` |
| CRYPTO_CONFIG | `db_crypto_config` | `db_crypto_config_data` |
| GITHUB_TOOLS | `db_github_tools` | `db_github_tools_data` |
| TERMINAL | `db_terminal` | `db_terminal_data` |

### Backup de Bancos

```bash
# Backup de um módulo específico
docker exec $(docker ps -q -f name=orthoplus_db_inventario) \
  pg_dump -U orthoplus inventario > backup_inventario_$(date +%Y%m%d).sql

# Backup de todos os módulos
for db in inventario pdv financeiro clinica pep faturamento configuracoes; do
  docker exec $(docker ps -q -f name=orthoplus_db_${db}) \
    pg_dump -U orthoplus ${db} > backup_${db}_$(date +%Y%m%d).sql
done
```

### Restore

```bash
# Restore de um módulo
cat backup_inventario_20250101.sql | docker exec -i \
  $(docker ps -q -f name=orthoplus_db_inventario) \
  psql -U orthoplus inventario
```

---

## 📊 OBSERVABILIDADE

### Prometheus Metrics

Acesse as métricas em: `http://<MANAGER-IP>:9090`

**Queries úteis:**

```promql
# Taxa de requisições HTTP
rate(http_requests_total[5m])

# Latência P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Uso de conexões DB
pg_stat_database_numbackends
```

### Grafana Dashboards

Acesse: `http://grafana.orthoplus.local`

**Dashboards pré-configurados:**
- HTTP Requests & Latency
- Database Connections & Query Performance
- Redis Cache Hit Rate
- System Resources (CPU, Memory, Disk)

---

## 🌐 NETWORKING

### Overlay Networks

- **`frontend`**: Comunicação entre Traefik e serviços frontend/backend
- **`backend`**: Comunicação entre backend e databases/redis

### Service Discovery

Serviços se comunicam via DNS interno do Swarm:

```typescript
// Exemplo: Backend conectando ao database
const dbConnection = {
  host: 'db_inventario',  // Nome do serviço
  port: 5432,
  database: 'inventario'
};
```

---

## 🔐 SEGURANÇA

### Secrets Management

```bash
# Listar secrets
docker secret ls

# Rotacionar secret
docker secret rm jwt_secret
echo "novo_jwt_secret" | docker secret create jwt_secret -

# Atualizar serviço para usar novo secret
docker service update --secret-rm jwt_secret --secret-add jwt_secret orthoplus_backend
```

### SSL/TLS (Traefik)

```yaml
# Adicionar em docker-stack.yml
services:
  traefik:
    command:
      - "--certificatesresolvers.le.acme.email=admin@orthoplus.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.tlschallenge=true"
    volumes:
      - letsencrypt:/letsencrypt
```

---

## 🛠️ TROUBLESHOOTING

### Serviço não inicia

```bash
# Ver logs do serviço
docker service logs orthoplus_backend --tail 100

# Ver tarefas falhadas
docker service ps orthoplus_backend --no-trunc
```

### Database connection refused

```bash
# Verificar se database está rodando
docker service ps orthoplus_db_inventario

# Testar conexão
docker exec -it $(docker ps -q -f name=orthoplus_backend) \
  pg_isready -h db_inventario -U orthoplus
```

### Alta latência

```bash
# Ver métricas de recursos
docker stats

# Ver conexões ativas no database
docker exec $(docker ps -q -f name=orthoplus_db_inventario) \
  psql -U orthoplus -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 📚 COMANDOS ÚTEIS

```bash
# Visualizar stack completo
docker stack ps orthoplus

# Remover stack
docker stack rm orthoplus

# Inspecionar serviço
docker service inspect orthoplus_backend

# Atualizar configuração
docker service update --env-add NEW_VAR=value orthoplus_backend

# Pausar serviço
docker service scale orthoplus_backend=0

# Restaurar serviço
docker service scale orthoplus_backend=5
```

---

## 🎯 CHECKLIST DE DEPLOYMENT

- [ ] Docker Swarm inicializado (1 manager + 2+ workers)
- [ ] Secrets criados (db_password, jwt_secret, PostgreSQL_key)
- [ ] Imagens buildadas (frontend e backend)
- [ ] Stack deployado (`docker stack deploy`)
- [ ] Serviços rodando (`docker service ls`)
- [ ] Databases criados e populados com seed data
- [ ] Traefik configurado com SSL/TLS
- [ ] Prometheus coletando métricas
- [ ] Grafana com dashboards configurados
- [ ] Backups agendados (cron ou CI/CD)
- [ ] Monitoramento de alertas configurado

---

**Docker Swarm Deployment** - Production Ready 🚀
