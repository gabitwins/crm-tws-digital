# 🚀 SETUP FINAL - RENDER.COM

## ❌ PROBLEMA ATUAL
O build do Render está falhando. Motivo: **DATABASE_URL não configurada no Render**

## ✅ SOLUÇÃO (5 minutos)

### PASSO 1: Acessar o Render Dashboard
1. Abra: https://dashboard.render.com
2. Clique em **"crm-tws-digital"** (seu serviço)

### PASSO 2: Configurar Environment Variables
1. No menu lateral, clique em **"Environment"**
2. Procure por **"Add Environment Variable"**
3. Adicione **exatamente** estas variáveis:

```
KEY                     VALUE
===================     ========================================
NODE_ENV                production
PORT                    5000
NODE_VERSION            20
JWT_SECRET              sua_chave_secreta_aqui_123456
DATABASE_URL            postgresql://seu_usuario:sua_senha@seu_host:5432/seu_banco
FRONTEND_URL            https://SEU_FRONTEND.vercel.app (ou similar)
```

### PASSO 3: DATABASE_URL Explicado
Formato:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

Exemplos:
- **Railway**: `postgresql://postgres:XXXX@containers-us-west-XX.railway.app:5432/railway`
- **Neon**: `postgresql://user:XXXX@ep-XXXX.us-east-2.neon.tech/dbname?sslmode=require`
- **AWS RDS**: `postgresql://admin:XXXX@crm-db.XXXX.us-east-1.rds.amazonaws.com:5432/crm_db`

### PASSO 4: Salvar e Deploy
1. Clique em **"Save"** após adicionar cada variável
2. Render vai notificar: *"Environment updated. New deployments will use these variables"*
3. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
4. Aguarde 3-5 minutos

### PASSO 5: Verificar URL do Backend
Após o deploy passar:
1. Volte para a aba **"Overview"**
2. Procure por **"Service URL"** (colinha azul no canto superior)
3. Será algo como: `https://crm-tws-digital.onrender.com`
4. Anote essa URL para configurar no frontend

---

## 🎯 PRÓXIMO PASSO
Assim que o backend estiver online no Render, você vai:
1. Copiar a URL do backend
2. Ir para: https://vercel.com (ou seu frontend online)
3. Adicionar `NEXT_PUBLIC_API_URL=https://crm-tws-digital.onrender.com/api`
4. Fazer redeploy

---

## ⚠️ DÚVIDAS?
Se o deploy ainda falhar:
1. Clique em **"Logs"** no Render
2. Procure por "error" ou "failed"
3. Me mande o erro exato
