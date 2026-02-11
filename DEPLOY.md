# GUIA DE DEPLOY - CRM TWS DIGITAL

## 📦 DEPLOY EM PRODUÇÃO

### Opção 1: VPS (Digital Ocean, AWS, Azure)

#### 1. Preparar Servidor

```bash
# Ubuntu 22.04
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Redis
sudo apt install -y redis-server

# Instalar PM2
sudo npm install -g pm2
```

#### 2. Configurar PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE crm_tws;
CREATE USER crm_user WITH PASSWORD 'senha_forte';
GRANT ALL PRIVILEGES ON DATABASE crm_tws TO crm_user;
\q
```

#### 3. Clonar Projeto

```bash
cd /var/www
git clone [seu-repositorio] crm-tws-digital
cd crm-tws-digital
```

#### 4. Configurar Variáveis de Ambiente

```bash
nano .env
```

Adicione todas as variáveis de produção.

#### 5. Build e Deploy

```bash
npm install
cd apps/backend
npx prisma migrate deploy
npx prisma generate
cd ../..
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 6. Configurar Nginx

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/crm-tws
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/crm-tws /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

### Opção 2: Docker

#### 1. Criar Dockerfile Backend

```dockerfile
# apps/backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

RUN npm install

COPY . .

RUN cd apps/backend && npx prisma generate

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["npm", "start"]
```

#### 2. Criar Dockerfile Frontend

```dockerfile
# apps/frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm install

COPY . .

WORKDIR /app/apps/frontend

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 3. Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: senha_forte
      POSTGRES_DB: crm_tws
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://crm_user:senha_forte@postgres:5432/crm_tws
      REDIS_HOST: redis
      NODE_ENV: production
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://backend:4000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 4. Deploy com Docker

```bash
docker-compose up -d
```

---

### Opção 3: Vercel (Frontend) + Railway (Backend)

#### Frontend na Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

cd apps/frontend
vercel --prod
```

#### Backend no Railway

1. Criar conta em railway.app
2. Criar novo projeto
3. Conectar ao repositório GitHub
4. Configurar variáveis de ambiente
5. Deploy automático

---

## 🔄 ATUALIZAÇÕES

```bash
# Pull nova versão
git pull origin main

# Rebuild
npm run build

# Restart PM2
pm2 restart all
```

---

## 📊 MONITORAMENTO

### PM2 Monitoring

```bash
pm2 monit
pm2 logs
```

### Logs

```bash
# Backend logs
pm2 logs crm-backend

# Frontend logs
pm2 logs crm-frontend
```

---

## 🔐 SEGURANÇA EM PRODUÇÃO

1. Use senhas fortes
2. Configure firewall
3. Ative SSL/HTTPS
4. Use variáveis de ambiente seguras
5. Configure backup automático
6. Monitore logs regularmente

---

## 🚨 TROUBLESHOOTING

### Problema: Banco de dados não conecta

```bash
# Verificar status do PostgreSQL
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql
```

### Problema: Redis não conecta

```bash
sudo systemctl status redis
sudo systemctl restart redis
```

### Problema: Aplicação não inicia

```bash
# Ver logs do PM2
pm2 logs

# Restart
pm2 restart all
```

---

**Deploy completo e pronto para produção!**
