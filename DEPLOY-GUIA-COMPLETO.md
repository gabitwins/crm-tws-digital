# 🚀 Deploy do CRM no Vercel + Railway

## Pré-requisitos
- Conta no Vercel (https://vercel.com)
- Conta no Railway (https://railway.app)
- GitHub configurado

---

## 📦 PASSO 1: Deploy do Backend no Railway

### 1.1 Criar conta no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub

### 1.2 Criar novo projeto
1. Clique em "New Project"
2. Escolha "Deploy from GitHub repo"
3. Selecione o repositório do CRM
4. Configure:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### 1.3 Adicionar PostgreSQL
1. No projeto Railway, clique em "New"
2. Selecione "Database" → "PostgreSQL"
3. Copie a `DATABASE_URL` gerada

### 1.4 Configurar variáveis de ambiente
No Railway, adicione estas variáveis:
```
DATABASE_URL=postgresql://...  (copiada do PostgreSQL)
PORT=4000
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-super-segura-aqui-12345
OPENAI_API_KEY=SUA_CHAVE_AQUI
FRONTEND_URL=https://seu-frontend.vercel.app
```

### 1.5 Deploy
1. Clique em "Deploy"
2. Aguarde a build
3. Copie a URL pública do backend (ex: `https://crm-backend-production.up.railway.app`)

### 1.6 Criar usuário admin
No Railway, vá em "Deploy" → "Open Terminal" e execute:
```bash
cd apps/backend
node prisma/seed.js
```

---

## 🌐 PASSO 2: Deploy do Frontend no Vercel

### 2.1 Preparar o projeto
No seu terminal local:
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"

# Commit das alterações
git add .
git commit -m "feat: preparar deploy para Vercel + Railway"
git push origin main
```

### 2.2 Conectar ao Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New" → "Project"
4. Selecione o repositório do CRM
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.3 Configurar variáveis de ambiente
No Vercel, adicione:
```
NEXT_PUBLIC_API_URL=https://crm-backend-production.up.railway.app
```
(substitua pela URL do seu backend Railway)

### 2.4 Deploy
1. Clique em "Deploy"
2. Aguarde 2-3 minutos
3. Acesse a URL gerada (ex: `https://crm-nexo.vercel.app`)

---

## ✅ PASSO 3: Testar Sistema Online

### 3.1 Acessar o CRM
1. Acesse sua URL Vercel
2. Faça login com:
   - **Email**: admin@nexo.com
   - **Senha**: admin123

### 3.2 Funcionalidades disponíveis
- ✅ Dashboard com métricas de ROI
- ✅ Criar agentes de IA
- ✅ Gerenciar leads
- ✅ Conversas em tempo real
- ✅ Integrações (WhatsApp, Instagram, Facebook)
- ✅ Publicidades (Kanban)
- ✅ Calendário
- ✅ Configurações

---

## 🔄 PASSO 4: Comandos Rápidos para Deploy Local → Vercel

### Fazer novo deploy após alterações:
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"

# Commit
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy automático no Vercel (detecta push)
```

### Deploy manual via CLI:
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
vercel --prod
```

---

## 🛠️ Alternativa: Deploy Vercel + Supabase

Se preferir usar Supabase para banco de dados:

### 1. Criar projeto Supabase
1. Acesse: https://supabase.com
2. Crie novo projeto PostgreSQL
3. Copie a `DATABASE_URL` (Connection String)

### 2. Configurar Railway
Use a mesma `DATABASE_URL` do Supabase nas variáveis de ambiente

### 3. Executar migrations
No terminal Supabase SQL Editor:
```sql
-- Copie o schema do arquivo: apps/backend/prisma/schema.prisma
-- E execute as migrations
```

---

## 📋 Checklist Final

- [ ] Backend rodando no Railway
- [ ] PostgreSQL configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend deployado no Vercel
- [ ] URL do backend configurada no frontend
- [ ] Usuário admin criado
- [ ] Login funcionando
- [ ] Todas as abas carregando
- [ ] Integrações configuradas

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Railway**: https://docs.railway.app

---

## ⚡ Comando Único para Deploy Rápido

Execute este comando para fazer deploy direto do terminal:

```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"

# Fazer commit
git add .
git commit -m "deploy: atualização do CRM"
git push origin main

# Deploy no Vercel (via GitHub integrado)
# Ou use: vercel --prod
```

O Vercel detecta automaticamente o push e faz deploy!

---

## 🎯 Próximos Passos Recomendados

1. **Domínio Customizado**: Configure um domínio personalizado (ex: crm.seusite.com)
2. **SSL/HTTPS**: Já incluído automaticamente no Vercel
3. **Monitoramento**: Configure alertas no Railway e Vercel
4. **Backup**: Configure backups automáticos do PostgreSQL
5. **Analytics**: Adicione Google Analytics ou Vercel Analytics

---

**Seu CRM estará online em menos de 15 minutos! 🚀**
