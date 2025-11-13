#!/bin/bash

###############################################################################
# Ortho+ - Script de Instalação Automática
# Desenvolvido por TSI Telecom
# Ubuntu 24.04.3 LTS
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
   ___       _   _            
  / _ \ _ __| |_| |__   ___   
 | | | | '__| __| '_ \ / _ \  
 | |_| | |  | |_| | | | (_) | 
  \___/|_|   \__|_| |_|\___/  
                               
  Sistema de Gestão Odontológica
  TSI Telecom © 2025
EOF
echo -e "${NC}"

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    log_error "Este script deve ser executado como root (sudo)"
    exit 1
fi

# Verificar versão do Ubuntu
if ! grep -q "Ubuntu 24.04" /etc/os-release; then
    log_warning "Este script foi testado no Ubuntu 24.04.3 LTS"
    read -p "Deseja continuar mesmo assim? (s/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

log_info "Iniciando instalação do Ortho+..."

# Atualizar sistema
log_info "Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências básicas
log_info "Instalando dependências básicas..."
apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Node.js 20.x
log_info "Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
log_success "Node.js $(node --version) instalado"
log_success "NPM $(npm --version) instalado"

# Instalar PostgreSQL 16
log_info "Instalando PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-16 postgresql-contrib-16

# Configurar PostgreSQL
log_info "Configurando PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

# Criar banco de dados
DB_NAME="orthoplus"
DB_USER="orthoplus"
DB_PASSWORD=$(openssl rand -base64 32)

sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"

log_success "PostgreSQL configurado"
log_success "Database: ${DB_NAME}"
log_success "User: ${DB_USER}"
log_warning "Password salva em: /root/.orthoplus_db_password"
echo "${DB_PASSWORD}" > /root/.orthoplus_db_password
chmod 600 /root/.orthoplus_db_password

# Instalar Nginx
log_info "Instalando Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
log_success "Nginx instalado"

# Configurar Nginx para Ortho+
log_info "Configurando Nginx..."
cat > /etc/nginx/sites-available/orthoplus << 'EOF'
server {
    listen 80;
    server_name _;

    # Logs
    access_log /var/log/nginx/orthoplus_access.log;
    error_log /var/log/nginx/orthoplus_error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Grafana
    location /grafana/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
    }

    # Prometheus
    location /prometheus/ {
        proxy_pass http://localhost:9090/;
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/orthoplus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log_success "Nginx configurado"

# Instalar Prometheus
log_info "Instalando Prometheus..."
PROM_VERSION="2.48.0"
wget https://github.com/prometheus/prometheus/releases/download/v${PROM_VERSION}/prometheus-${PROM_VERSION}.linux-amd64.tar.gz
tar xvfz prometheus-${PROM_VERSION}.linux-amd64.tar.gz
mv prometheus-${PROM_VERSION}.linux-amd64 /opt/prometheus
rm prometheus-${PROM_VERSION}.linux-amd64.tar.gz

# Criar usuário Prometheus
useradd --no-create-home --shell /bin/false prometheus || true
chown -R prometheus:prometheus /opt/prometheus

# Configurar Prometheus
cat > /opt/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres_exporter'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:80']
EOF

# Criar serviço systemd para Prometheus
cat > /etc/systemd/system/prometheus.service << 'EOF'
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/opt/prometheus/prometheus \
  --config.file=/opt/prometheus/prometheus.yml \
  --storage.tsdb.path=/opt/prometheus/data \
  --web.console.templates=/opt/prometheus/consoles \
  --web.console.libraries=/opt/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
EOF

mkdir -p /opt/prometheus/data
chown -R prometheus:prometheus /opt/prometheus/data

systemctl daemon-reload
systemctl enable prometheus
systemctl start prometheus
log_success "Prometheus instalado e rodando em http://localhost:9090"

# Instalar Node Exporter
log_info "Instalando Node Exporter..."
NODE_EXPORTER_VERSION="1.7.0"
wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
tar xvfz node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
mv node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64*

cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter
log_success "Node Exporter instalado"

# Instalar Grafana
log_info "Instalando Grafana..."
apt install -y software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | tee /etc/apt/sources.list.d/grafana.list
apt update
apt install -y grafana

systemctl enable grafana-server
systemctl start grafana-server
log_success "Grafana instalado e rodando em http://localhost:3000"
log_info "Usuário padrão: admin / Senha: admin (altere no primeiro login)"

# Configurar UFW (Firewall)
log_info "Configurando UFW..."
apt install -y ufw

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Permitir PostgreSQL (apenas localhost)
ufw allow from 127.0.0.1 to any port 5432

# Habilitar UFW
echo "y" | ufw enable
log_success "UFW configurado e ativado"

# Clonar repositório Ortho+
log_info "Clonando repositório Ortho+..."
INSTALL_DIR="/var/www/orthoplus"
mkdir -p /var/www
cd /var/www

if [ -d "$INSTALL_DIR" ]; then
    log_warning "Diretório ${INSTALL_DIR} já existe. Removendo..."
    rm -rf "$INSTALL_DIR"
fi

git clone https://github.com/tsitelecom/ortho-plus.git orthoplus
cd orthoplus

# Instalar dependências do projeto
log_info "Instalando dependências do projeto..."
npm install

# Build do projeto para produção
log_info "Compilando aplicação para produção..."
npm run build

# Criar arquivo .env
log_info "Criando arquivo de configuração..."
cat > .env << EOF
# Database
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id

# PostgreSQL Local
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

# App
NODE_ENV=production
PORT=5173
EOF

log_success "Arquivo .env criado"

# Criar serviço systemd para Ortho+
log_info "Criando serviço systemd..."
cat > /etc/systemd/system/orthoplus.service << EOF
[Unit]
Description=Ortho+ Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable orthoplus
systemctl start orthoplus
log_success "Serviço Ortho+ criado e iniciado"

# Configurar log rotation
log_info "Configurando log rotation..."
cat > /etc/logrotate.d/orthoplus << 'EOF'
/var/log/nginx/orthoplus_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF

# Criar script de backup automático
log_info "Criando script de backup..."
cat > /usr/local/bin/orthoplus-backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/orthoplus"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup PostgreSQL
sudo -u postgres pg_dump ${DB_NAME} | gzip > \$BACKUP_DIR/db_\${DATE}.sql.gz

# Backup arquivos
tar czf \$BACKUP_DIR/files_\${DATE}.tar.gz -C ${INSTALL_DIR} .

# Manter apenas últimos 7 backups
find \$BACKUP_DIR -type f -mtime +7 -delete

echo "Backup concluído: \${DATE}"
EOF

chmod +x /usr/local/bin/orthoplus-backup.sh

# Agendar backup diário
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/orthoplus-backup.sh >> /var/log/orthoplus-backup.log 2>&1") | crontab -
log_success "Backup automático configurado (diariamente às 2h)"

# Configurar Grafana datasource
log_info "Aguardando Grafana iniciar..."
sleep 10

curl -X POST -H "Content-Type: application/json" -d '{
  "name":"Prometheus",
  "type":"prometheus",
  "url":"http://localhost:9090",
  "access":"proxy",
  "isDefault":true
}' http://admin:admin@localhost:3000/api/datasources 2>/dev/null || true

# Sumário da instalação
log_success "============================================"
log_success "Instalação concluída com sucesso!"
log_success "============================================"
echo ""
log_info "Ortho+ está rodando em: http://$(hostname -I | awk '{print $1}')"
log_info "Grafana: http://$(hostname -I | awk '{print $1}')/grafana"
log_info "Prometheus: http://$(hostname -I | awk '{print $1}')/prometheus"
echo ""
log_info "Credenciais PostgreSQL:"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: (salva em /root/.orthoplus_db_password)"
echo ""
log_info "Grafana (primeiro acesso):"
echo "  Usuário: admin"
echo "  Senha: admin"
echo ""
log_warning "IMPORTANTE:"
echo "1. Configure o Supabase em .env (${INSTALL_DIR}/.env)"
echo "2. Altere a senha do Grafana no primeiro acesso"
echo "3. Configure SSL/TLS para produção (certbot)"
echo "4. Revise as configurações de firewall conforme necessário"
echo ""
log_info "Logs:"
echo "  Aplicação: journalctl -u orthoplus -f"
echo "  Nginx: tail -f /var/log/nginx/orthoplus_*.log"
echo "  Backup: /var/log/orthoplus-backup.log"
echo ""
log_success "Desenvolvido por TSI Telecom © 2025"
log_success "Documentação: https://github.com/tsitelecom/ortho-plus"
