# 🚀 SEU CRM ESTÁ QUASE ONLINE!

## ✅ Backend JÁ está online:
- URL: https://web-production-1d256.up.railway.app/api
- Status: Funcionando perfeitamente

## 🎯 Para colocar o FRONTEND online (último passo):

### Opção 1: Via Browser (RECOMENDADO - 3 minutos)
1. Acesse: https://railway.app/new
2. Clique em "Deploy from GitHub repo"
3. Se não estiver logado, faça login com GitHub
4. Autorize o Railway a acessar seus repositórios
5. Selecione: `gabitwins/crm-tws-digital`
6. Configure:
   - Root Directory: `apps/frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
7. Em "Variables", adicione:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://web-production-1d256.up.railway.app/api`
8. Clique em "Deploy"

Aguarde 5 minutos e seu CRM estará 100% ONLINE! 🎉

O Railway vai gerar um link público tipo:
`https://seu-crm.up.railway.app`

---

## 📋 Credenciais de acesso:
- Email: admin@nexo.com
- Senha: admin123

---

## 🔧 Alternativa: Usar local enquanto isso
Execute o arquivo: `INICIAR.bat`
Acesse: http://localhost:3000
