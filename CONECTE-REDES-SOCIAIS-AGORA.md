# 🚀 CONECTE SUAS REDES SOCIAIS AGORA - GUIA RÁPIDO

## ✅ PASSO 1: LIMPAR BANCO (REMOVER DADOS FAKE)

### No Railway:

1. **Acesse**: https://railway.app/project
2. **Clique** na aba **"postgres"** (banco de dados)
3. **Vá** em **"Data"** → **"Query"**
4. **Cole** este código SQL:

```sql
-- LIMPAR TUDO (sistema zerado)
DELETE FROM messages;
DELETE FROM sales;
DELETE FROM tickets;
DELETE FROM queue_history;
DELETE FROM activities;
DELETE FROM notes;
DELETE FROM lead_tags;
DELETE FROM leads;
DELETE FROM campaigns;
DELETE FROM ads;
DELETE FROM publicities;
DELETE FROM products;

-- Criar tags padrão
INSERT INTO tags (id, name, category, color, "isActive", "createdAt") VALUES
  (gen_random_uuid(), 'origem-whatsapp', 'origem', '#25D366', true, NOW()),
  (gen_random_uuid(), 'origem-instagram', 'origem', '#E4405F', true, NOW()),
  (gen_random_uuid(), 'origem-facebook-ads', 'origem', '#1877F2', true, NOW()),
  (gen_random_uuid(), 'cliente', 'status', '#10B981', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Resultado
SELECT 'BANCO LIMPO! Sistema zerado e pronto!' as status;
```

5. **Clique** em **"Run Query"**
6. ✅ **Pronto! Banco zerado!**

---

## 📱 PASSO 2: CONECTAR WHATSAPP

### A) Instalar Evolution API (Docker):

```powershell
# 1. Baixe Docker Desktop: https://www.docker.com/products/docker-desktop

# 2. Após instalar, execute:
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY=NEXO-2026-SECRET `
  atendai/evolution-api:latest

# 3. Aguarde 30 segundos e abra:
Start-Process "http://localhost:8080/manager"
```

### B) Configurar no Evolution Manager:

1. **Acesse**: http://localhost:8080/manager
2. **Clique** em **"+ Nova Instância"**
3. **Preencha**:
   - Nome: `nexo-crm`
   - Token: `nexo-token-2026`
4. **Clique** em **"Criar"**
5. **QR Code** vai aparecer → **Escaneie com seu WhatsApp Business**

### C) Configurar Webhook:

1. No Manager, **clique** na instância criada
2. Vá em **"Webhooks"**
3. **Configure**:
   ```
   URL: https://web-production-1d256.up.railway.app/api/webhooks/whatsapp
   Eventos: messages.upsert
   ```
4. **Salve**

### D) Testar:

```powershell
# Enviar mensagem teste
$body = @{
    phone = "+5511999999999"  # SEU NÚMERO
    message = "Oi! Teste do NEXO CRM"
    name = "Teste Bot"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Resultado esperado:**
```json
{
  "success": true,
  "response": "Olá Teste Bot! Que legal seu interesse!...",
  "actions": [...]
}
```

✅ **WhatsApp conectado! Agora os leads vão entrar automaticamente!**

---

## 📷 PASSO 3: CONECTAR INSTAGRAM

### A) Criar App no Facebook:

1. **Acesse**: https://developers.facebook.com
2. **Clique** em **"Meus Apps"** → **"Criar App"**
3. **Selecione**: "Empresa" → **Avançar**
4. **Preencha**:
   - Nome do App: `NEXO CRM`
   - Email: seu@email.com
5. **Criar App**

### B) Adicionar Instagram:

1. No painel do app, **clique** em **"Adicionar produto"**
2. Selecione **"Instagram"**
3. Vá em **"Instagram → Configurações → Webhooks"**

### C) Configurar Webhook:

1. **Callback URL**: `https://web-production-1d256.up.railway.app/api/webhooks/instagram`
2. **Verify Token**: `NEXO-INSTAGRAM-2026`
3. **Eventos**: Marque `messages`
4. **Salvar**

### D) Conectar sua conta:

1. Vá em **"Instagram → Testar"**
2. **Conecte** sua conta do Instagram Business
3. **Autorize** o app

✅ **Instagram conectado! Mensagens do Direct vão para o CRM!**

---

## 🛒 PASSO 4: CONECTAR HOTMART

1. **Acesse**: https://app.hotmart.com
2. **Vá** em: **Ferramentas → Configurações → Integrações**
3. **Clique** em **"Postback"**
4. **Configure**:
   ```
   URL: https://web-production-1d256.up.railway.app/api/webhooks/hotmart
   ```
5. **Eventos**: Marque:
   - ✅ PURCHASE_COMPLETE
   - ✅ PURCHASE_APPROVED
6. **Salvar**

✅ **Hotmart conectada! Vendas vão aparecer automaticamente!**

---

## 🥝 PASSO 5: CONECTAR KIWIFY

1. **Acesse**: https://dashboard.kiwify.com.br
2. **Vá** em: **Produto → Configurações → Webhooks**
3. **Adicione novo webhook**:
   ```
   URL: https://web-production-1d256.up.railway.app/api/webhooks/kiwify
   Evento: sale.approved
   ```
4. **Salvar**

✅ **Kiwify conectada! Clientes criados automaticamente!**

---

## 📊 PASSO 6: CONECTAR FACEBOOK ADS

1. **Acesse**: https://business.facebook.com
2. **Vá** em: **Configurações → Lead Access**
3. **Configure webhook**:
   ```
   URL: https://web-production-1d256.up.railway.app/api/webhooks/facebook-ads
   Evento: leadgen
   ```
4. **Salvar**

✅ **Facebook Ads conectado! Leads de campanhas vão direto pro CRM!**

---

## 🎯 COMO TESTAR TUDO FUNCIONANDO

### 1. Ver no CRM:

```
https://frontend-pi-eight-36.vercel.app/login

Email: admin@crm.com
Senha: admin123
```

### 2. Dashboard mostrará:

- ✅ Leads Ativos: 0 → vai aumentar quando chegarem leads
- ✅ Mensagens Hoje: 0 → vai contar cada mensagem
- ✅ Filas: vazias → vão preencher automaticamente
- ✅ Gráficos: zerados → vão animar com dados reais

### 3. Enviar teste WhatsApp:

```powershell
$body = @{
    phone = "+5511988887777"  # Número de teste
    message = "Olá! Quero saber sobre o curso"
    name = "Maria Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp" `
    -Method Post -Body $body -ContentType "application/json"
```

**No CRM você verá:**
1. ✅ Lead "Maria Teste" criado
2. ✅ Tag `origem-whatsapp` aplicada
3. ✅ Na fila "Pré-Venda"
4. ✅ IA respondeu automaticamente
5. ✅ Conversa aparece em "Mensagens"
6. ✅ Dashboard atualizado (+1 lead, +2 mensagens)

---

## ✅ CHECKLIST FINAL

- [x] ✅ OpenAI API Key configurada
- [ ] ⬜ Banco de dados limpo (SQL executado)
- [ ] ⬜ WhatsApp Evolution API rodando
- [ ] ⬜ Webhook WhatsApp configurado
- [ ] ⬜ QR Code WhatsApp escaneado
- [ ] ⬜ Instagram conectado
- [ ] ⬜ Hotmart webhook ativo
- [ ] ⬜ Kiwify webhook ativo
- [ ] ⬜ Facebook Ads conectado
- [ ] ⬜ Teste manual enviado
- [ ] ⬜ Lead apareceu no CRM
- [ ] ⬜ IA respondeu
- [ ] ⬜ Dashboard atualizou

---

## 🆘 PROBLEMAS COMUNS

### "IA não respondeu":
✅ Verifique se OPENAI_API_KEY está no Railway  
✅ Veja logs: Railway → Deployments → Logs  
✅ Teste com comando acima

### "WhatsApp não conecta":
✅ Docker Desktop instalado e rodando?  
✅ QR Code escaneado corretamente?  
✅ Webhook configurado com URL correta?

### "Leads não aparecem":
✅ Webhook está com URL certa?  
✅ Teste manual funcionou?  
✅ Backend está online? (já verificamos ✅)

---

## 🎉 PRONTO! SISTEMA 100% OPERACIONAL!

**Agora você tem:**
- ✅ CRM moderno com gráficos animados
- ✅ Agentes de IA funcionando 24/7
- ✅ Tags automáticas
- ✅ Movimentação de filas automática
- ✅ Dashboard em tempo real
- ✅ Integrações com todas as plataformas

**É SÓ CONECTAR E COMEÇAR A VENDER! 🚀💰**

---

**Precisa de ajuda? Me chama!** 😊
