# 🚀 GUIA RÁPIDO - Como Iniciar o CRM

## ⚠️ PROBLEMA ATUAL
O erro "Erro ao salvar agente" acontece porque o **BACKEND NÃO ESTÁ RODANDO**.

O frontend está perfeito, mas precisa do backend para salvar dados no banco.

---

## ✅ SOLUÇÃO - Opção 1: Script Automático (RECOMENDADO)

### **Execute no PowerShell:**

```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
.\START-FULL-SYSTEM.ps1
```

Este script vai:
1. ✅ Verificar se Docker está rodando
2. ✅ Criar/iniciar container PostgreSQL
3. ✅ Criar tabelas no banco
4. ✅ Iniciar backend (porta 4000)
5. ✅ Iniciar frontend (porta 3000)

---

## ✅ SOLUÇÃO - Opção 2: Iniciar Manualmente

### **1. Iniciar PostgreSQL (Docker)**
```powershell
# Iniciar Docker Desktop (aguarde abrir)
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguarde 30 segundos...

# Criar container PostgreSQL
docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres

# Aguarde 5 segundos...
```

### **2. Criar Tabelas**
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL\apps\backend"
npx prisma db push
```

### **3. Iniciar Backend**
```powershell
# Terminal 1
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
.\START-BACKEND.ps1
```

### **4. Iniciar Frontend**
```powershell
# Terminal 2 (novo)
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
.\START-FRONTEND.ps1
```

---

## 🌐 Acessar o Sistema

Depois de iniciar:

1. **Frontend**: http://localhost:3000
2. **Backend**: http://localhost:4000
3. **Login**:
   - Email: `admin@nexo.com`
   - Senha: `admin123`

---

## 🔍 Verificar se Está Funcionando

### **Backend rodando?**
```powershell
# Deve mostrar: "🚀 Servidor rodando na porta 4000"
```

### **PostgreSQL rodando?**
```powershell
docker ps
# Deve mostrar: crm-postgres
```

### **Frontend rodando?**
```powershell
# Deve abrir automaticamente: http://localhost:3000
```

---

## ⚠️ Erros Comuns

### **1. "Docker não encontrado"**
- **Solução**: Abra Docker Desktop manualmente e aguarde iniciar

### **2. "Porta 5432 já em uso"**
- **Solução**: 
  ```powershell
  docker stop crm-postgres
  docker rm crm-postgres
  # Depois execute novamente
  ```

### **3. "Erro ao criar tabelas"**
- **Solução**:
  ```powershell
  cd apps/backend
  npx prisma generate
  npx prisma db push --force-reset
  ```

### **4. "Backend não inicia"**
- **Solução**: Verificar se PostgreSQL está rodando:
  ```powershell
  docker ps
  # Se não aparecer crm-postgres, inicie:
  docker start crm-postgres
  ```

---

## 🛑 Parar Tudo

```powershell
# Parar backend e frontend (se rodando em jobs)
Get-Job | Stop-Job

# Parar PostgreSQL
docker stop crm-postgres
```

---

## 📝 Depois de Iniciar

1. Acesse: http://localhost:3000
2. Faça login
3. Vá em **Agentes de IA**
4. Crie um agente
5. Agora vai salvar corretamente! ✅

---

## 🆘 AINDA NÃO FUNCIONA?

Se mesmo após iniciar o backend continuar dando erro:

1. **Abra o console do navegador** (F12)
2. **Veja o erro real** na aba "Console" ou "Network"
3. **Tire um print** e me mostre
4. Ou execute:
   ```powershell
   cd apps/backend
   npm run dev
   # Veja as mensagens de erro
   ```
