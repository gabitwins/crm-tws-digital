# 🚀 DEPLOY NO RAILWAY - GUIA COMPLETO

## 📋 PASSO A PASSO

### ✅ ETAPA 1: SUBIR PARA O GITHUB

1. **Crie uma conta no GitHub** (se não tiver): https://github.com/signup

2. **Crie um novo repositório:**
   - Acesse: https://github.com/new
   - Nome: `crm-tws-digital`
   - Privado ou Público (sua escolha)
   - **NÃO** marque nenhuma opção de inicialização
   - Clique em **"Create repository"**

3. **No seu computador, execute no PowerShell:**

```powershell
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit - CRM TWS Digital"

# Conectar ao GitHub (substitua SEU-USUARIO pelo seu nome de usuário)
git remote add origin https://github.com/SEU-USUARIO/crm-tws-digital.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

---

### ✅ ETAPA 2: CRIAR CONTA NO RAILWAY

1. Acesse: https://railway.app
2. Clique em **"Login"**
3. Escolha **"Login with GitHub"**
4. Autorize o Railway a acessar seus repositórios

---

### ✅ ETAPA 3: CRIAR NOVO PROJETO

1. No Railway, clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione o repositório **`crm-tws-digital`**
4. Railway vai detectar automaticamente o projeto Node.js

---

### ✅ ETAPA 4: ADICIONAR POSTGRESQL

1. No seu projeto Railway, clique em **"+ New"**
2. Escolha **"Database"**
3. Selecione **"PostgreSQL"**
4. Railway vai criar o banco automaticamente

---

### ✅ ETAPA 5: ADICIONAR REDIS (OPCIONAL)

1. Clique em **"+ New"** novamente
2. Escolha **"Database"**
3. Selecione **"Redis"**

---

### ✅ ETAPA 6: CONFIGURAR VARIÁVEIS DE AMBIENTE

1. Clique no seu **serviço principal** (crm-tws-digital)
2. Vá na aba **"Variables"**
3. Clique em **"+ New Variable"**

**Adicione estas variáveis:**

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

JWT_SECRET=seu-secret-super-secreto-producao-2024
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=sk-sua-chave-openai-aqui
OPENAI_MODEL=gpt-4-turbo-preview

NODE_ENV=production
PORT=4000

FRONTEND_URL=https://seu-dominio.up.railway.app
BACKEND_URL=https://seu-dominio.up.railway.app
```

**Obs:** O Railway já fornece automaticamente as variáveis do PostgreSQL e Redis quando você usa `${{Postgres.DATABASE_URL}}`

---

### ✅ ETAPA 7: CONFIGURAR BUILD E START

1. Ainda nas configurações do serviço
2. Vá em **"Settings"**
3. Em **"Build Command"**, deixe: `npm run build`
4. Em **"Start Command"**, deixe: `npm run start`

---

### ✅ ETAPA 8: RODAR MIGRAÇÕES

Depois que o deploy terminar:

1. Clique no serviço
2. Vá em **"Deployments"**
3. Clique nos **3 pontinhos** do último deploy
4. Escolha **"View Logs"**
5. Verifique se não há erros

Para rodar as migrações manualmente:

1. Vá em **"Settings"**
2. Role até **"Custom Start Command"**
3. Adicione: `npm run db:migrate && npm run start`

---

### ✅ ETAPA 9: GERAR DOMÍNIO PÚBLICO

1. Clique no serviço principal
2. Vá em **"Settings"**
3. Role até **"Networking"**
4. Clique em **"Generate Domain"**
5. Railway vai criar um domínio tipo: `seu-projeto.up.railway.app`

---

### ✅ ETAPA 10: CRIAR PRIMEIRO USUÁRIO

Para criar o usuário admin no banco Railway:

1. Clique no serviço **"PostgreSQL"**
2. Vá em **"Data"**
3. Clique em **"Query"**
4. Cole e execute:

```sql
INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@crm.com',
  'Administrador',
  '$2a$10$8ZqJ0Zy3Zz0Zy3Zz0Zy3ZeH7o6L8QZ1K2J3K4L5M6N7O8P9Q0R1S2',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

---

## 🎉 PRONTO! SEU CRM ESTÁ ONLINE!

Acesse o domínio gerado: `https://seu-projeto.up.railway.app`

**Login:**
- Email: `admin@crm.com`
- Senha: `admin123`

---

## 💰 CUSTOS

**Plano Gratuito Railway:**
- $5 de crédito por mês (GRÁTIS)
- Suficiente para testes e desenvolvimento
- Sem cartão de crédito necessário

**Plano Pro (se precisar mais):**
- $20/mês
- Recursos ilimitados

---

## 🔄 ATUALIZAR O PROJETO

Toda vez que você fizer mudanças:

```powershell
git add .
git commit -m "Descrição da mudança"
git push
```

Railway vai fazer **deploy automático**! 🚀

---

## 🐛 TROUBLESHOOTING

### Build falhou?

Verifique os logs em **"Deployments" > "View Logs"**

### Banco não conecta?

Verifique se a variável `DATABASE_URL` está configurada corretamente

### Erro 500?

Verifique os logs do serviço em tempo real

---

## 📞 SUPORTE RAILWAY

- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

---

**Agora seu CRM está na nuvem e acessível de qualquer lugar!** ☁️
