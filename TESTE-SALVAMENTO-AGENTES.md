# 🤖 GUIA COMPLETO - Sistema de Salvamento de Agentes

## ✅ **O QUE FOI IMPLEMENTADO**

### **Backend - APIs CRUD Completas**
Arquivo: `apps/backend/src/routes/agent.routes.ts`

#### **✅ CRIAR (Create)**
```http
POST /api/training/agents
Authorization: Bearer {token}
Content-Type: application/json

{
  "agentType": "PRE_VENDA",
  "name": "Agente de Pré-Vendas",
  "systemPrompt": "Você é um agente especializado...",
  "personality": "Profissional e consultivo",
  "tone": "professional",
  "language": "pt-BR",
  "temperature": 0.7,
  "maxTokens": 500,
  "dosList": ["Qualificar leads", "Responder dúvidas"],
  "dontsList": ["Prometer descontos", "Falar de preços"],
  "exampleConversations": {...},
  "knowledgeBase": "FAQ e documentação...",
  "pdfFiles": [...],
  "isActive": true
}
```

#### **✅ LISTAR (Read)**
```http
GET /api/training/agents
Authorization: Bearer {token}

# Retorna todos os agentes do usuário logado
```

#### **✅ BUSCAR UM (Read One)**
```http
GET /api/training/agents/{id}
Authorization: Bearer {token}

# Retorna um agente específico
```

#### **✅ ATUALIZAR (Update)**
```http
PUT /api/training/agents/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo nome",
  "systemPrompt": "Novo prompt...",
  ...
}
```

#### **✅ ATIVAR/DESATIVAR (Toggle)**
```http
PATCH /api/training/agents/{id}/toggle
Authorization: Bearer {token}

# Alterna entre ativo/inativo
```

#### **✅ EXCLUIR (Delete)**
```http
DELETE /api/training/agents/{id}
Authorization: Bearer {token}

# Remove permanentemente
```

---

## 🚀 **COMO TESTAR**

### **1. Iniciar PostgreSQL + Backend**

```powershell
# 1. Iniciar PostgreSQL (Docker)
docker start crm-postgres

# OU criar se não existir:
docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres

# 2. Aguardar 5 segundos

# 3. Criar tabelas
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL\apps\backend"
npx prisma db push

# 4. Iniciar backend
npm run dev
```

**Deve aparecer**:
```
✓ Conectado ao banco de dados
🚀 Servidor rodando na porta 4000
```

---

### **2. Fazer Login no Frontend**

```
URL: http://localhost:3000/login
Email: admin@nexo.com
Senha: admin123
```

O token JWT será salvo automaticamente no localStorage.

---

### **3. Criar um Agente**

1. Acesse: http://localhost:3000/dashboard/agentes
2. Clique em **"+ Novo Agente"**
3. Escolha **"Criar do Zero"** ou **"Usar Modelos Prontos"**
4. Preencha o formulário:
   - **Nome**: "Meu Agente de Vendas"
   - **Função**: Vendas Consultivas
   - **Prompt Sistema**: "Você é um especialista..."
   - (Preencha as outras tabs)
5. Clique **"Salvar Agente"**

---

### **4. Verificar se Salvou no Banco**

#### **Opção 1: Abrir Prisma Studio**
```powershell
cd apps/backend
npx prisma studio
```

Abre interface web em http://localhost:5555

- Clique em `AgentConfig`
- Veja os agentes salvos

#### **Opção 2: Query SQL Direto**
```powershell
docker exec -it crm-postgres psql -U postgres -d crm_nexo

# Dentro do PostgreSQL:
SELECT id, name, "agentType", "isActive", "createdAt" FROM "AgentConfig";

# Sair:
\q
```

#### **Opção 3: API Direto**
```powershell
# Pegar token do localStorage (F12 → Console):
localStorage.getItem('token')

# Testar API:
curl http://localhost:4000/api/training/agents `
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🐛 **ERROS COMUNS E SOLUÇÕES**

### **1. "Erro ao salvar agente"**

#### **Causa A**: Backend não está rodando
```powershell
# Verificar se porta 4000 está ativa:
netstat -ano | findstr :4000

# Se não aparecer nada, iniciar:
cd apps/backend
npm run dev
```

#### **Causa B**: PostgreSQL não está rodando
```powershell
# Verificar:
docker ps

# Se não aparecer crm-postgres, iniciar:
docker start crm-postgres
```

#### **Causa C**: Tabelas não existem
```powershell
cd apps/backend
npx prisma db push
```

---

### **2. "Database does not exist"**

```powershell
# Recriar banco:
docker stop crm-postgres
docker rm crm-postgres
docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres

# Aguardar 5 segundos
Start-Sleep -Seconds 5

# Criar tabelas:
cd apps/backend
npx prisma db push
```

---

### **3. "Unauthorized" ou erro 401**

**Causa**: Token expirado ou inválido

**Solução**:
1. Saia do sistema (botão sair)
2. Faça login novamente
3. Tente criar o agente

---

### **4. Agente salva mas não aparece na lista**

**Causa**: Frontend não está chamando a API de listagem

**Solução**:
1. Abra console do navegador (F12)
2. Vá na aba "Network"
3. Recarregue a página `/dashboard/agentes`
4. Veja se aparece requisição `GET /api/training/agents`
5. Se aparecer erro, veja a resposta

---

## 📊 **ESTRUTURA DO BANCO DE DADOS**

### **Tabela: AgentConfig**

```prisma
model AgentConfig {
  id                   String    @id @default(uuid())
  userId               String    // Qual usuário criou
  agentType            String    // PRE_VENDA, SUPORTE, etc.
  name                 String    // Nome do agente
  systemPrompt         String    // Prompt principal
  personality          String?   // Personalidade
  tone                 String    // Tom de voz
  language             String    @default("pt-BR")
  temperature          Float     @default(0.7)
  maxTokens            Int       @default(500)
  dosList              String[]  // O que DEVE fazer
  dontsList            String[]  // O que NÃO DEVE fazer
  exampleConversations Json?     // Exemplos de conversa
  knowledgeBase        String?   // Base de conhecimento
  pdfFiles             Json?     // PDFs processados
  isActive             Boolean   @default(true)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

---

## 🧪 **TESTAR TODAS AS OPERAÇÕES**

### **1. CREATE - Criar agente**
1. Vá em http://localhost:3000/dashboard/agentes
2. Clique "+ Novo Agente"
3. Preencha e salve
4. ✅ Card aparece na lista

### **2. READ - Listar agentes**
1. Recarregue a página
2. ✅ Todos os agentes aparecem

### **3. UPDATE - Editar agente**
1. Clique "Editar" em um card
2. Mude o nome
3. Salve
4. ✅ Nome atualiza no card

### **4. TOGGLE - Ativar/Desativar**
1. Clique "Pausar" em um agente ativo
2. ✅ Badge fica cinza, borda cinza, opacidade 75%
3. Clique "Ativar"
4. ✅ Badge verde, borda verde, animação pulse

### **5. DELETE - Excluir**
1. Clique botão vermelho (lixeira)
2. Confirme
3. ✅ Card desaparece da lista

---

## 📱 **VISUAL ESPERADO**

### **Estado Vazio** (nenhum agente)
```
┌────────────────────────────────────┐
│  🤖 Nenhum agente criado          │
│                                    │
│  Crie seu primeiro agente de IA   │
│  para automatizar conversas        │
│                                    │
│  [+ Criar Primeiro Agente]         │
└────────────────────────────────────┘
```

### **Com Agentes Salvos**
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ 🤖 PRÉ │ │ 🤖 PÓS │ │ 🤖 SUP │
│  VENDA  │ │  VENDA  │ │ ORTE    │
│ ● Ativo │ │ ○ Inativo│ │ ● Ativo │
│         │ │          │ │         │
│ [Editar]│ │ [Editar] │ │ [Editar]│
│[Pausar]│ │ [Ativar] │ │[Pausar]│
│  [🗑️]   │ │   [🗑️]   │ │  [🗑️]   │
└─────────┘ └─────────┘ └─────────┘
```

---

## ✅ **CHECKLIST FINAL**

Antes de dizer "não funciona", verifique:

- [ ] Docker Desktop está aberto e rodando
- [ ] Container PostgreSQL está ativo (`docker ps`)
- [ ] Tabelas foram criadas (`npx prisma db push`)
- [ ] Backend está rodando na porta 4000
- [ ] Frontend está rodando na porta 3000
- [ ] Você fez login e tem token válido
- [ ] Console do navegador não mostra erros (F12)

---

## 🎯 **RESUMO**

✅ **Backend**: APIs CRUD completas implementadas  
✅ **Frontend**: Interface com lista, criar, editar, ativar, excluir  
✅ **Banco**: Tabela `AgentConfig` com todos os campos  
✅ **Segurança**: Autenticação JWT, isolamento por usuário  

**TUDO PRONTO!** Basta iniciar backend + PostgreSQL e começar a usar! 🚀
