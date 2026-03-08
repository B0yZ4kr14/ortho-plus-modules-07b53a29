# Guia de Instalação - Ortho+

**Desenvolvido por TSI Telecom © 2025**

Este guia fornece instruções detalhadas para instalar e configurar o sistema Ortho+ em Ubuntu 24.04.3 LTS.

---

## 📋 Pré-requisitos

- Ubuntu 24.04.3 LTS (servidor ou desktop)
- Acesso root (sudo)
- Mínimo 4GB RAM
- Mínimo 20GB de espaço em disco
- Conexão com a internet

---

## 🚀 Instalação Automática

### Opção 1: Script de Instalação Completo (Recomendado)

O script `install.sh` instala e configura automaticamente:
- Node.js 20.x
- PostgreSQL 16
- Nginx
- Prometheus + Node Exporter
- Grafana
- UFW (Firewall)
- Ortho+ Application
- Backup automático diário

```bash
# Baixar o script
wget https://raw.githubusercontent.com/tsitelecom/ortho-plus/main/install.sh

# Tornar executável
chmod +x install.sh

# Executar como root
sudo ./install.sh
```

O script irá:
1. Atualizar o sistema
2. Instalar todas as dependências
3. Configurar banco de dados PostgreSQL
4. Configurar Nginx como proxy reverso
5. Instalar Prometheus para monitoramento
6. Instalar Grafana para visualização de métricas
7. Configurar firewall (UFW)
8. Clonar e configurar a aplicação Ortho+
9. Criar serviços systemd
10. Configurar backups automáticos

**Tempo estimado:** 15-20 minutos

---

## 📦 Instalação Manual

Se preferir instalar manualmente cada componente:

### 1. Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Instalar Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar instalação
```

### 3. Instalar PostgreSQL 16

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16
```

#### Criar Banco de Dados

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE orthoplus;
CREATE USER orthoplus WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE orthoplus TO orthoplus;
ALTER DATABASE orthoplus OWNER TO orthoplus;
\q
```

### 4. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### Configurar Nginx

Criar arquivo `/etc/nginx/sites-available/orthoplus`:

```nginx
server {
    listen 80;
    server_name seu_dominio.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/orthoplus /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Instalar Prometheus

```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvfz prometheus-2.48.0.linux-amd64.tar.gz
sudo mv prometheus-2.48.0.linux-amd64 /opt/prometheus
```

Criar serviço systemd em `/etc/systemd/system/prometheus.service`:

```ini
[Unit]
Description=Prometheus
After=network.target

[Service]
User=prometheus
ExecStart=/opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd --no-create-home --shell /bin/false prometheus
sudo chown -R prometheus:prometheus /opt/prometheus
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
```

### 6. Instalar Grafana

```bash
sudo apt install -y software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt update
sudo apt install -y grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### 7. Configurar Firewall (UFW)

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 8. Clonar e Configurar Ortho+

```bash
cd /var/www
sudo git clone https://github.com/tsitelecom/ortho-plus.git orthoplus
cd orthoplus
sudo npm install
```

#### Configurar Variáveis de Ambiente

Criar arquivo `.env`:

```env
# PostgreSQL
VITE_API_BASE_URL=sua_url_api
VITE_API_KEY=sua_chave_anon
VITE_PROJECT_ID=seu_project_id

# Database Local
DATABASE_URL=postgresql://orthoplus:sua_senha@localhost:5432/orthoplus

# App
NODE_ENV=production
PORT=5173
```

#### Criar Serviço Systemd

Criar arquivo `/etc/systemd/system/orthoplus.service`:

```ini
[Unit]
Description=Ortho+ Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/orthoplus
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable orthoplus
sudo systemctl start orthoplus
```

---

## 🔐 Configuração de SSL/TLS (Produção)

Para ambiente de produção, configure certificado SSL usando Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu_dominio.com
```

O Certbot irá:
- Obter certificado SSL gratuito
- Configurar Nginx automaticamente
- Configurar renovação automática

---

## 📊 Acesso aos Serviços

Após instalação bem-sucedida:

- **Ortho+ Application:** `http://seu_servidor`
- **Grafana:** `http://seu_servidor:3000` (admin/admin - altere no primeiro acesso)
- **Prometheus:** `http://seu_servidor:9090`

---

## 🔄 Backup Automático

O script de instalação configura backup automático diário às 2h da manhã.

### Backup Manual

```bash
sudo /usr/local/bin/orthoplus-backup.sh
```

### Localização dos Backups

```bash
/var/backups/orthoplus/
```

### Restaurar Backup

```bash
# Restaurar banco de dados
sudo -u postgres psql orthoplus < backup.sql

# Restaurar arquivos
sudo tar xzf backup.tar.gz -C /var/www/orthoplus
```

---

## 🛠️ Comandos Úteis

### Gerenciar Serviços

```bash
# Status
sudo systemctl status orthoplus
sudo systemctl status nginx
sudo systemctl status postgresql

# Reiniciar
sudo systemctl restart orthoplus
sudo systemctl restart nginx

# Logs em tempo real
sudo journalctl -u orthoplus -f
sudo tail -f /var/log/nginx/orthoplus_access.log
```

### Atualizar Aplicação

```bash
cd /var/www/orthoplus
sudo git pull origin main
sudo npm install
sudo systemctl restart orthoplus
```

---

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
sudo journalctl -u orthoplus -n 50

# Verificar porta em uso
sudo netstat -tulpn | grep 5173

# Verificar permissões
sudo chown -R www-data:www-data /var/www/orthoplus
```

### Erro de conexão com banco de dados

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U orthoplus -d orthoplus -h localhost

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Nginx erro 502

```bash
# Verificar se aplicação está rodando
sudo systemctl status orthoplus

# Verificar configuração Nginx
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 📚 Próximos Passos

1. Configure o banco (veja [PostgreSQL Setup](./docs/README.md))
2. Configure secrets do banco para integrações
3. Importe dados iniciais (módulos, categorias)
4. Configure domínio e SSL
5. Configure monitoramento no Grafana
6. Teste funcionalidades principais

---

## 🔒 Segurança

### Recomendações de Produção

1. **Firewall:** Mantenha UFW ativo, abra apenas portas necessárias
2. **SSL:** Use certificado válido (Let's Encrypt)
3. **Senhas:** Use senhas fortes e únicas
4. **Backup:** Configure backup automático offsite
5. **Updates:** Mantenha sistema e dependências atualizados
6. **Logs:** Monitore logs regularmente
7. **Rate Limiting:** Configure no Nginx
8. **Database:** PostgreSQL apenas em localhost

### Hardening Adicional

```bash
# Desabilitar login root via SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Configurar fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban

# Atualização automática de segurança
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📞 Suporte

**TSI Telecom**  
🌐 https://tsitelecom.com  
📧 suporte@tsitelecom.com  
📖 Documentação: https://github.com/tsitelecom/ortho-plus

---

## 📜 Licença

Copyright © 2025 TSI Telecom - Todos os direitos reservados

Este software é propriedade exclusiva da TSI Telecom.
