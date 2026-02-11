# ⚡ SOLUÇÃO RÁPIDA - Erro nas Integrações

## ❌ PROBLEMA
Quando você clica em "Conectar" nas integrações, aparece:
- "Erro ao conectar WhatsApp"
- "Erro ao conectar Instagram"
- "Erro ao conectar Facebook"
- Etc...

## ✅ CAUSA
O **backend não está rodando**. As APIs de integração precisam do servidor ativo.

---

## 🚀 SOLUÇÃO EM 3 PASSOS

### **PASSO 1: Abrir Docker Desktop**

1. Abra o menu Iniciar
2. Procure por "Docker Desktop"
3. Clique para abrir
4. **AGUARDE 1-2 MINUTOS** até aparecer "Docker Desktop is running"

---

### **PASSO 2: Criar PostgreSQL**

Abra o **PowerShell** e execute:

```powershell
docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres
```

**Se der erro "container already exists":**
```powershell
docker start crm-postgres
```

Aguarde 5 segundos.

---

### **PASSO 3: Iniciar Backend**

No mesmo PowerShell:

```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
.\INICIAR-SISTEMA.ps1
```

**OU execute manualmente:**
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL\apps\backend"
npx prisma db push
npm run dev
```

Aguarde aparecer:
```
✓ Conectado ao banco de dados
🚀 Servidor rodando na porta 4000
```

---

## ✅ TESTAR SE FUNCIONOU

1. **Backend rodando?**
   - Abra: http://localhost:4000
   - Deve aparecer uma mensagem (não erro 404)

2. **Teste as integrações:**
   - Acesse: http://localhost:3000/dashboard/integracoes
   - Clique em "Conectar" no WhatsApp
   - **Agora deve funcionar!** ✅

---

## 🐛 AINDA DÁ ERRO?

### **Erro: "Docker não encontrado"**
→ Instale Docker Desktop: https://www.docker.com/products/docker-desktop

### **Erro: "Port 4000 already in use"**
→ Outro processo está usando a porta:
```powershell
# Ver o que está na porta 4000:
netstat -ano | findstr :4000

# Matar o processo (substitua PID pelo número que apareceu):
taskkill /PID 12345 /F
```

### **Erro: "Cannot find module"**
→ Instalar dependências:
```powershell
cd apps/backend
npm install
```

---

## 📋 RESUMO

**O frontend funciona, mas o BACKEND NÃO.**

Para as integrações funcionarem, você precisa:
1. ✅ Docker Desktop rodando
2. ✅ PostgreSQL ativo (container)
3. ✅ Backend rodando (porta 4000)

Depois disso, **TUDO FUNCIONA!** 🎉

---

## 🎯 SCRIPT AUTOMÁTICO

Quer iniciar tudo de uma vez? Execute:

```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
.\INICIAR-SISTEMA.ps1
```

Este script:
- ✅ Verifica/inicia Docker
- ✅ Cria/inicia PostgreSQL
- ✅ Cria tabelas
- ✅ Inicia backend

**Tudo automático!** 🚀
