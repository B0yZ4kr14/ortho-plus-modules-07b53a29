# Ortho+ Docker Swarm Operations Guide

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Swarm mode habilitado
- 3+ nós (1 manager + 2+ workers) para produção
- Nós com labels adequados para placement constraints

## 🚀 Setup Inicial

### 1. Inicializar Swarm

```bash
# Executar script de inicialização
chmod +x scripts/swarm-init.sh
./scripts/swarm-init.sh
```

Este script:
- Inicializa Docker Swarm
- Cria overlay networks (frontend_net, backend_net, db_net, proxy_net)
- Gera senhas seguras para bancos de dados
- Cria Docker secrets

### 2. Configurar Labels de Nós

```bash
# Label para nós de banco de dados
docker node update --label-add db=true <node-id>

# Label para nós de cache
docker node update --label-add cache=true <node-id>
```

### 3. Deploy da Stack

```bash
# Executar script de deploy
chmod +x scripts/swarm-deploy.sh
VERSION=1.0.0 ./scripts/swarm-deploy.sh
```

## 🔧 Operações Diárias

### Visualizar Serviços

```bash
# Listar todos os serviços
docker service ls

# Detalhes de um serviço
docker service ps orthoplus_backend

# Logs de um serviço
docker service logs orthoplus_backend -f

# Logs com timestamp
docker service logs --since 30m --timestamps orthoplus_backend
```

### Scaling

```bash
# Aumentar réplicas do backend
docker service scale orthoplus_backend=5

# Diminuir réplicas
docker service scale orthoplus_backend=2

# Escalar múltiplos serviços
docker service scale orthoplus_backend=5 orthoplus_frontend=3
```

### Rolling Updates

```bash
# Atualizar imagem do backend
docker service update \
  --image orthoplus-backend:1.1.0 \
  --update-parallelism 1 \
  --update-delay 10s \
  orthoplus_backend

# Rollback para versão anterior
docker service rollback orthoplus_backend

# Atualizar variável de ambiente
docker service update \
  --env-add LOG_LEVEL=debug \
  orthoplus_backend

# Atualizar secret
echo "new-secret" | docker secret create jwt_secret_v2 -
docker service update \
  --secret-rm jwt_secret \
  --secret-add source=jwt_secret_v2,target=jwt_secret \
  orthoplus_backend
```

### Health Checks

```bash
# Verificar saúde dos serviços
for service in $(docker service ls --format "{{.Name}}"); do
  echo "=== $service ==="
  docker service ps $service --filter "desired-state=running"
done

# Forçar restart de réplica problemática
docker service update --force orthoplus_backend
```

## 📊 Monitoramento

### Prometheus Queries

```promql
# CPU usage por serviço
rate(container_cpu_usage_seconds_total[5m])

# Memória usage
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Request rate
rate(http_requests_total[5m])
```

### Grafana Dashboards

Acesse Grafana em `http://<manager-ip>:3000` e importe dashboards:
- Docker Swarm & Container Overview
- Ortho+ Backend Metrics
- PostgreSQL Database Metrics

## 🗄️ Backup de Bancos de Dados

### Backup Manual

```bash
# Backup do banco Pacientes
docker exec $(docker ps -q -f name=orthoplus_db_pacientes) \
  pg_dump -U orthoplus pacientes | gzip > backup-pacientes-$(date +%Y%m%d).sql.gz

# Backup de todos os módulos
for module in inventario pdv financeiro pacientes pep faturamento configuracoes; do
  docker exec $(docker ps -q -f name=orthoplus_db_${module}) \
    pg_dump -U orthoplus $module | gzip > backup-${module}-$(date +%Y%m%d).sql.gz
done
```

### Restore

```bash
# Restore do banco Pacientes
gunzip -c backup-pacientes-20250117.sql.gz | \
  docker exec -i $(docker ps -q -f name=orthoplus_db_pacientes) \
  psql -U orthoplus pacientes
```

## 🚨 Troubleshooting

### Serviço não inicia

```bash
# Verificar logs detalhados
docker service ps orthoplus_backend --no-trunc

# Verificar tasks falhadas
docker service ps --filter "desired-state=shutdown" orthoplus_backend

# Inspecionar configuração
docker service inspect orthoplus_backend --pretty
```

### Problemas de conectividade

```bash
# Testar conectividade entre serviços
docker exec -it $(docker ps -q -f name=orthoplus_backend) ping db_pacientes

# Verificar DNS interno
docker exec -it $(docker ps -q -f name=orthoplus_backend) nslookup db_pacientes

# Listar redes overlay
docker network ls --filter driver=overlay
docker network inspect backend_net
```

### Problemas de secrets

```bash
# Listar secrets
docker secret ls

# Remover e recriar secret
docker secret rm jwt_secret
echo "new-secret" | docker secret create jwt_secret -

# Atualizar serviço com novo secret
docker service update --secret-rm jwt_secret orthoplus_backend
docker service update --secret-add jwt_secret orthoplus_backend
```

## 🔄 Updates Zero-Downtime

### Processo de Update

1. **Build nova versão**
```bash
docker build -t orthoplus-backend:1.2.0 ./backend
```

2. **Testar em staging** (se disponível)

3. **Deploy com rolling update**
```bash
docker service update \
  --image orthoplus-backend:1.2.0 \
  --update-parallelism 1 \
  --update-delay 30s \
  --update-failure-action rollback \
  orthoplus_backend
```

4. **Monitorar logs**
```bash
docker service logs -f orthoplus_backend
```

5. **Rollback se necessário**
```bash
docker service rollback orthoplus_backend
```

## 📈 Sizing e Performance

### Recomendações de Réplicas

- **Frontend**: 2-3 réplicas (load balancing)
- **Backend**: 3-5 réplicas (aumentar conforme carga)
- **Databases**: 1 réplica (considerar replicação para HA)
- **Redis**: 1 réplica (considerar cluster para HA)

### Resource Limits

Configure limits no `docker-stack.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## 🧹 Limpeza

```bash
# Remover stack completa
docker stack rm orthoplus

# Remover volumes órfãos (CUIDADO!)
docker volume prune

# Remover secrets não utilizados
docker secret ls -q | xargs docker secret rm

# Limpar nós do swarm (antes de remover nó)
docker node update --availability drain <node-id>
docker node rm <node-id>
```
