# 🚨 SOLUÇÃO RÁPIDA PARA DEPLOY ONLINE

## O Problema:
O Railway está usando Node.js 18, mas o projeto precisa de Node 20+

## ✅ SOLUÇÃO (escolha uma):

### OPÇÃO 1: Upload Manual via GitHub (2 minutos)
1. Acesse: https://github.com/gabitwins/crm-tws-digital
2. Clique em "Add file" → "Upload files"
3. Arraste estes 3 arquivos da pasta do projeto:
   - `.nvmrc` (na raiz)
   - `railway.toml` (na raiz)
   - `apps/frontend/.nvmrc`
4. Escreva mensagem: "fix: configuração deploy render"
5. Clique em "Commit changes"
6. Volte para o Railway e clique em "Redeploy"

### OPÇÃO 2: Deploy via Vercel (RECOMENDADO - funciona agora)
O Vercel já está configurado e aceita Node 20 automaticamente!

1. Acesse: https://vercel.com/new
2. Importe o repositório: `gabitwins/crm-tws-digital`
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `apps/frontend`
   - Build Command: deixe padrão
   - Output Directory: deixe padrão
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://web-production-1d256.up.railway.app/api`
5. Click "Deploy"

Em 3 minutos estará ONLINE! 🎉

### OPÇÃO 3: Render.com
1. Acesse: https://dashboard.render.com/select-repo?type=web
2. Conecte o repositório
3. Configure Node version para 20 nas settings

## 🎯 URL do Backend (já está online):
https://web-production-1d256.up.railway.app/api

## 📋 Após Deploy:
- Email: admin@nexo.com
- Senha: admin123
