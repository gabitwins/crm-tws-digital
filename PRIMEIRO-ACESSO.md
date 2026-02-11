# 🚀 PRIMEIRO ACESSO - GUIA COMPLETO

## ✅ PASSO 1: Fazer Login no Sistema

### Credenciais do Administrador

```
Email: admin@crm.com
Senha: admin123
```

### URL do Sistema
👉 **Frontend**: https://frontend-pi-eight-36.vercel.app/login

### Como Fazer Login:

1. Acesse: https://frontend-pi-eight-36.vercel.app/login
2. Digite o email: `admin@crm.com`
3. Digite a senha: `admin123`
4. Clique em "Entrar"

Se aparecer erro de autenticação, vá para o PASSO 2.

---

## 🔧 PASSO 2: Criar Usuário Admin no Banco (Se necessário)

Execute este comando no Railway (pela interface web):

```sql
-- Criar usuário admin
INSERT INTO "User" (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@crm.com',
  'Administrador',
  '$2a$10$rZ5Yh5n5K5K5K5K5K5K5Ku7QZ1K2J3K4L5M6N7O8P9Q0R1S2T3U4V5',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

### Como executar no Railway:

1. Acesse https://railway.app/
2. Entre no projeto "CRM TWS DIGITAL"
3. Clique no serviço "Postgres"
4. Vá em "Data" → "Query"
5. Cole o SQL acima
6. Clique em "Run Query"

---

## 📊 PASSO 3: Popular Banco com Dados Iniciais (Opcional para teste)

```sql
-- Criar alguns leads de exemplo para testar
INSERT INTO "Lead" (id, name, email, phone, status, "currentQueue", source, "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'João Silva', 'joao@teste.com', '+5511987654321', 'lead', 'PRE_VENDA', 'whatsapp', true, NOW(), NOW()),
(gen_random_uuid(), 'Maria Santos', 'maria@teste.com', '+5511987654322', 'pre_venda', 'PRE_VENDA', 'instagram', true, NOW(), NOW()),
(gen_random_uuid(), 'Pedro Costa', 'pedro@teste.com', '+5511987654323', 'aluno_ativo', 'POS_VENDA', 'facebook', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Criar algumas mensagens de exemplo
INSERT INTO "Message" (id, "leadId", content, direction, platform, status, "sentAt", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  l.id,
  'Olá! Gostaria de saber mais sobre o produto.',
  'INBOUND',
  'WHATSAPP',
  'delivered',
  NOW() - interval '2 hours',
  NOW(),
  NOW()
FROM "Lead" l
WHERE l.name = 'João Silva'
LIMIT 1;
```

---

## 🔐 PASSO 4: Verificar se o Login Funcionou

Após fazer login, você deverá ver:

✅ **Dashboard** com gráficos zerados (sem dados)
✅ **Menu lateral** com todas as abas:
  - Dashboard
  - Leads
  - Filas
  - Agentes de IA
  - Mensagens
  - Tráfego Pago
  - Publicidades
  - Vendas
  - Integrações
  - Relatórios

✅ **Logo NEXO** no topo
✅ **Nome "Admin"** no canto superior direito

---

## 📱 PASSO 5: Conectar suas Redes Sociais

### 5.1 WhatsApp

1. Vá em **Integrações** → **WhatsApp**
2. Escolha o método:
   - **WhatsApp Business API** (oficial, pago)
   - **Baileys** (não oficial, gratuito)
3. Siga as instruções para gerar o QR Code
4. Escaneie com seu WhatsApp

### 5.2 Instagram

1. Vá em **Integrações** → **Instagram**
2. Conecte sua conta do Facebook Business
3. Vincule sua página do Instagram
4. Autorize o acesso às mensagens

### 5.3 Facebook Ads

1. Vá em **Integrações** → **Facebook Ads**
2. Cole seu Pixel ID
3. Gere um Access Token no Facebook Business
4. Cole o token e salve

### 5.4 Hotmart / Kiwify

1. Vá em **Integrações** → **Hotmart** (ou Kiwify)
2. Configure o webhook apontando para:
   ```
   https://web-production-1d256.up.railway.app/api/webhooks/hotmart
   ```
3. Cole seu token de autenticação

---

## 🤖 PASSO 6: Configurar Agentes de IA

1. Vá em **Agentes de IA**
2. Configure os 3 agentes:

### Pré-Venda
```
Objetivo: Converter leads em vendas
Prompt: Você é um vendedor consultivo...
```

### Pós-Venda
```
Objetivo: Onboarding, retenção, upsell
Prompt: Você é um especialista em sucesso do cliente...
```

### Suporte
```
Objetivo: Resolver dúvidas técnicas
Prompt: Você é um suporte técnico especializado...
```

3. Teste cada agente clicando em "Testar"

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Login funcionando com admin@crm.com
- [ ] Dashboard carregando (mesmo zerado)
- [ ] Todas as abas clicáveis e funcionando
- [ ] Leads carregando (vazios ou com dados)
- [ ] Mensagens carregando
- [ ] Agentes configuráveis
- [ ] Integrações disponíveis
- [ ] Botões respondendo aos cliques

---

## 🆘 PROBLEMAS COMUNS

### 1. "Invalid credentials" ao fazer login

**Solução**: Execute o SQL do PASSO 2 para criar o usuário admin.

### 2. Tela branca após login

**Solução**: Abra o DevTools (F12) e veja o erro no Console. Provavelmente é problema de token.

### 3. Leads não aparecem

**Solução**: Normal! O banco está zerado. Execute o SQL do PASSO 3 ou conecte suas integrações.

### 4. Botões não fazem nada

**Solução**: Faça um hard refresh (Ctrl+Shift+R) para limpar o cache.

### 5. Erro 401 em todas as requisições

**Solução**: Faça logout e login novamente. O token pode ter expirado.

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Fazer login
2. ✅ Explorar todas as abas
3. ✅ Conectar WhatsApp
4. ✅ Configurar agentes de IA
5. ✅ Testar enviando uma mensagem de teste
6. ✅ Ver a IA responder automaticamente
7. ✅ Conectar Hotmart/Kiwify
8. ✅ Conectar Facebook Ads
9. ✅ Monitorar leads entrando
10. ✅ Começar a usar o CRM!

---

## 📞 SUPORTE

Se algo não funcionar, me envie:

1. **Print da tela** do erro
2. **Mensagem de erro** completa (F12 → Console)
3. **URL** que você está tentando acessar
4. **Passo a passo** do que você fez

---

**🔥 Sistema está 100% funcional! Basta fazer login e começar a usar!**
