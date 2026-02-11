# 🌐 SISTEMA ONLINE - INSTRUÇÕES

## ✅ Backend já está ONLINE
- URL: https://web-production-1d256.up.railway.app/api
- Status: ✅ Funcionando

## 🚀 Para colocar o FRONTEND ONLINE (escolha uma opção):

### OPÇÃO 1: Netlify Drop (MAIS RÁPIDO - 2 minutos)
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta: `C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL\apps\frontend`
3. Aguarde o deploy
4. Netlify vai gerar um link público (exemplo: `seu-crm.netlify.app`)

### OPÇÃO 2: Vercel (precisa desbloquear no GitHub)
1. Acesse: https://vercel.com/new
2. Conecte com GitHub
3. Selecione o repositório: `gabitwins/crm-tws-digital`
4. Configure:
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://web-production-1d256.up.railway.app/api`

### OPÇÃO 3: Railway (mesma plataforma do backend)
1. Acesse: https://railway.app/new
2. Clique em "Deploy from GitHub repo"
3. Selecione: `gabitwins/crm-tws-digital`
4. Configure:
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add variable: `NEXT_PUBLIC_API_URL=https://web-production-1d256.up.railway.app/api`

## 📋 Credenciais do Sistema
- Email: admin@nexo.com
- Senha: admin123

## 🎯 Após Deploy
O frontend vai se conectar automaticamente com o backend que já está online!
