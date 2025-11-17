#!/bin/bash
# Ortho+ Docker Swarm Initialization Script

set -e

echo "🚀 Initializing Docker Swarm for Ortho+..."

# Initialize Swarm
if ! docker info | grep -q "Swarm: active"; then
  echo "📦 Initializing Docker Swarm..."
  docker swarm init
else
  echo "✅ Docker Swarm already initialized"
fi

# Create overlay networks
echo "🌐 Creating overlay networks..."
docker network create --driver overlay --attachable frontend_net || true
docker network create --driver overlay --attachable backend_net || true
docker network create --driver overlay --attachable db_net || true
docker network create --driver overlay --attachable proxy_net || true

# Create Docker secrets
echo "🔐 Creating Docker secrets..."

# Generate secure passwords if not exists
if [ ! -f .secrets/db_inventario_password ]; then
  mkdir -p .secrets
  openssl rand -base64 32 > .secrets/db_inventario_password
fi

if [ ! -f .secrets/db_pdv_password ]; then
  openssl rand -base64 32 > .secrets/db_pdv_password
fi

if [ ! -f .secrets/db_financeiro_password ]; then
  openssl rand -base64 32 > .secrets/db_financeiro_password
fi

if [ ! -f .secrets/db_pacientes_password ]; then
  openssl rand -base64 32 > .secrets/db_pacientes_password
fi

if [ ! -f .secrets/db_pep_password ]; then
  openssl rand -base64 32 > .secrets/db_pep_password
fi

if [ ! -f .secrets/db_faturamento_password ]; then
  openssl rand -base64 32 > .secrets/db_faturamento_password
fi

if [ ! -f .secrets/db_configuracoes_password ]; then
  openssl rand -base64 32 > .secrets/db_configuracoes_password
fi

if [ ! -f .secrets/jwt_secret ]; then
  openssl rand -base64 64 > .secrets/jwt_secret
fi

# Create secrets in Docker Swarm
cat .secrets/db_inventario_password | docker secret create db_inventario_password - || true
cat .secrets/db_pdv_password | docker secret create db_pdv_password - || true
cat .secrets/db_financeiro_password | docker secret create db_financeiro_password - || true
cat .secrets/db_pacientes_password | docker secret create db_pacientes_password - || true
cat .secrets/db_pep_password | docker secret create db_pep_password - || true
cat .secrets/db_faturamento_password | docker secret create db_faturamento_password - || true
cat .secrets/db_configuracoes_password | docker secret create db_configuracoes_password - || true
cat .secrets/jwt_secret | docker secret create jwt_secret - || true

echo "✅ Docker Swarm infrastructure ready!"
echo ""
echo "Next steps:"
echo "1. Deploy stack: docker stack deploy -c docker-stack.yml orthoplus"
echo "2. Check services: docker service ls"
echo "3. View logs: docker service logs orthoplus_backend"
echo "4. Scale service: docker service scale orthoplus_backend=5"
