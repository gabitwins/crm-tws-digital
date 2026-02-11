# 🚀 CRM NEXO - Sistema Empresarial com IA

**Sistema Operacional Inteligente para Negócios Digitais**

CRM omnichannel completo com Inteligência Artificial nativa, integrações com WhatsApp, Instagram, Facebook, Google Ads, Hotmart, Kiwify e muito mais.

---

## 📋 **O QUE É?**

Um CRM profissional que centraliza:
- ✅ **Atendimento automático** via WhatsApp/Instagram/Facebook
- ✅ **Agentes de IA personalizados** (Pré-Venda, Suporte, Pós-Venda)
- ✅ **Gestão de Leads** com tags automáticas e filas inteligentes
- ✅ **Integrações de vendas** (Hotmart, Kiwify, Stripe, Mercado Pago)
- ✅ **Tráfego Pago** (Google Ads, Facebook Ads) com métricas em tempo real
- ✅ **Gestão de Publicidades** (substitui Monday/Trello)
- ✅ **Dashboards completos** por área (CEO, Financeiro, Atendimento, etc.)

---

## 🎯 **CARACTERÍSTICAS**

### **Frontend (Next.js 14)**
- Interface moderna e responsiva
- Dark mode completo
- 8 páginas principais totalmente funcionais:
  1. **Dashboard** - Visão geral do negócio
  2. **Leads** - Gestão completa de leads
  3. **Mensagens** - Central de atendimento
  4. **Agentes de IA** - CRUD completo de agentes
  5. **Filas** - Gestão de filas operacionais
  6. **Integrações** - 12 integrações visuais
  7. **Publicidades** - Gestão de entregas (estilo Monday)
  8. **Configurações** - Perfil, segurança, notificações

### **Backend (Node.js + TypeScript)**
- Express.js com arquitetura modular
- Prisma ORM com PostgreSQL
- Autenticação JWT
- APIs REST completas
- Integração com OpenAI (GPT-4)
- WhatsApp com Baileys
- OAuth para Google/Facebook

### **Banco de Dados (PostgreSQL)**
- 20+ tabelas relacionadas
- Isolamento multi-tenant por usuário
- Suporte a JSON, Enums, Arrays
- Migrations automáticas com Prisma

---

## 🚀 **COMO INICIAR**

### **Opção 1: Script Automático (RECOMENDADO)**

```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"
.\INICIAR-SISTEMA.ps1
```

### **Opção 2: Manual**

#### **1. Instalar Dependências**
```powershell
# Raiz do projeto
npm install

# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend
npm install
```

#### **2. Configurar Banco de Dados**

```powershell
# Abrir Docker Desktop (aguarde iniciar)

# Criar PostgreSQL
docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres

# Aguardar 5 segundos
Start-Sleep -Seconds 5

# Criar tabelas
cd apps/backend
npx prisma db push
```

#### **3. Configurar Variáveis de Ambiente**

Edite `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_nexo"
PORT=4000
JWT_SECRET=super-secret-jwt-key-change-in-production
OPENAI_API_KEY=SUA_CHAVE_AQUI

# Google OAuth (opcional - para integrações)
GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI

# Facebook OAuth (opcional - para integrações)
FACEBOOK_APP_ID=SEU_APP_ID_AQUI
FACEBOOK_APP_SECRET=SEU_APP_SECRET_AQUI
```

#### **4. Iniciar Serviços**

**Terminal 1 - Backend:**
```powershell
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd apps/frontend
npm run dev
```

---

## 🌐 **ACESSAR O SISTEMA**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Prisma Studio**: http://localhost:5555 (após `npx prisma studio`)

### **Login Padrão**
```
Email: admin@nexo.com
Senha: admin123
```

---

## 📚 **GUIAS DISPONÍVEIS**

- `COMO-INICIAR.md` - Guia completo de inicialização
- `TESTE-SALVAMENTO-AGENTES.md` - Como criar e salvar agentes de IA
- `SISTEMA-INTEGRACOES-COMPLETO.md` - Configurar OAuth (Google, Facebook)
- `ERRO-INTEGRACOES-SOLUCAO.md` - Resolver erro "Erro ao conectar"
- `AGENTES-PROFISSIONAIS.md` - Sistema CRUD de agentes IA

---

## 🛠️ **TECNOLOGIAS**

### **Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

### **Backend**
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Baileys (WhatsApp)
- OpenAI API

### **DevOps**
- Docker
- Docker Compose
- Vercel (deploy frontend)
- Railway (deploy backend)

---

## 📦 **ESTRUTURA DO PROJETO**

```
CRM TWS DIGITAL/
├── apps/
│   ├── backend/          # API Node.js + Express
│   │   ├── src/
│   │   │   ├── routes/   # Rotas da API
│   │   │   ├── services/ # Lógica de negócio
│   │   │   ├── middlewares/
│   │   │   └── config/
│   │   ├── prisma/       # Schema e migrations
│   │   └── .env          # Variáveis de ambiente
│   │
│   └── frontend/         # Next.js 14
│       ├── src/
│       │   ├── app/      # Páginas (App Router)
│       │   ├── components/
│       │   ├── lib/      # Utilitários
│       │   └── contexts/ # Context API
│       └── public/       # Assets estáticos
│
├── INICIAR-SISTEMA.ps1   # Script de inicialização
├── COMO-INICIAR.md       # Guia de setup
└── README.md             # Este arquivo
```

---

## 🔐 **SEGURANÇA**

- ✅ Autenticação JWT com expiração
- ✅ Senhas com bcrypt (hash + salt)
- ✅ Isolamento de dados por usuário
- ✅ Validação de entrada em todas as rotas
- ✅ CORS configurado
- ✅ Rate limiting (em desenvolvimento)

---

## 🐛 **PROBLEMAS COMUNS**

### **1. "Erro ao conectar WhatsApp/Instagram/Facebook"**
→ **Causa**: Backend não está rodando  
→ **Solução**: Execute `.\INICIAR-SISTEMA.ps1`

### **2. "Database does not exist"**
→ **Causa**: PostgreSQL não foi criado  
→ **Solução**: Execute o script ou crie manualmente:
```powershell
docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres
cd apps/backend
npx prisma db push
```

### **3. "Port 4000 already in use"**
→ **Causa**: Outro processo usando a porta  
→ **Solução**:
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### **4. Agentes não salvam**
→ **Causa**: Backend não conectou ao banco  
→ **Solução**: Verifique se PostgreSQL está rodando:
```powershell
docker ps
# Deve mostrar: crm-postgres
```

---

## 📊 **STATUS DO DESENVOLVIMENTO**

### ✅ **Pronto e Funcionando**
- [x] Login e autenticação JWT
- [x] Dashboard com métricas
- [x] Gestão de Leads (CRUD completo)
- [x] **Agentes de IA** (CRUD completo + salvamento real no banco)
- [x] **Integrações** (12 cards visuais + APIs OAuth prontas)
- [x] Filas operacionais (estado vazio inteligente)
- [x] Publicidades (gestão de entregas)
- [x] Configurações (perfil, segurança)
- [x] Dark mode completo
- [x] Backend com todas as rotas
- [x] WhatsApp com Baileys (QR Code funcional)

### 🚧 **Em Desenvolvimento**
- [ ] Instagram Direct (aguardando credenciais OAuth)
- [ ] Facebook Messenger (aguardando credenciais OAuth)
- [ ] Google Ads (aguardando credenciais OAuth)
- [ ] Hotmart webhook (backend pronto, aguardando token)
- [ ] Kiwify webhook (backend pronto, aguardando token)
- [ ] Dashboards com gráficos reais (dados fake por enquanto)

### 📅 **Planejado**
- [ ] Sistema de notificações em tempo real
- [ ] Relatórios em PDF
- [ ] Exportação de dados (CSV, Excel)
- [ ] API pública com documentação Swagger
- [ ] Testes automatizados (Jest + Cypress)
- [ ] CI/CD com GitHub Actions

---

## 🤝 **CONTRIBUINDO**

1. Faça fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 **LICENÇA**

Este projeto é privado e confidencial.

---

## 📞 **SUPORTE**

Para dúvidas ou problemas:
1. Veja os guias em `*.md`
2. Verifique a seção "Problemas Comuns" acima
3. Abra uma issue no repositório

---

## 🎉 **AGRADECIMENTOS**

Sistema desenvolvido com ❤️ por TWS Digital.

**Tecnologias de ponta + IA nativa = Produtividade máxima**

---

**Última atualização**: 10 de fevereiro de 2026
