# 🚀 NEXO CRM - DEPLOY IMEDIATO - SISTEMA 100% FUNCIONAL

## ⚡ PASSO A PASSO RÁPIDO (5 MINUTOS)

### 1️⃣ CONFIGURAR OPENAI (OBRIGATÓRIO)

**A. Obter API Key:**
1. Acesse: https://platform.openai.com/api-keys
2. Clique em **"Create new secret key"**
3. Copie a key (começa com `sk-proj-...`)

**B. Adicionar no Railway:**
1. Acesse: https://railway.app/project
2. Clique no serviço **web-production-1d256**
3. Vá em **Variables**
4. Clique **+ New Variable**
5. Nome: `OPENAI_API_KEY`
6. Valor: Cole sua key
7. Clique **Add**

✅ **PRONTO! O sistema já está funcional**

---

### 2️⃣ CONECTAR WHATSAPP (Evolution API - RECOMENDADO)

**Opção Mais Fácil: Docker**

```powershell
# Baixe e instale Docker Desktop
# https://www.docker.com/products/docker-desktop

# Rode Evolution API
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY=NEXO-2026-SECRET `
  atendai/evolution-api:latest
```

**Criar Instância WhatsApp:**

```powershell
# 1. Criar instância
$headers = @{ "apikey" = "NEXO-2026-SECRET" }
$body = @{
    instanceName = "nexo-crm"
    token = "nexo-token-2026"
    qrcode = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/instance/create" `
    -Method Post `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"

# 2. Ver QR Code
Start-Process "http://localhost:8080/instance/connect/nexo-crm"

# 3. Configurar Webhook NEXO
$webhookBody = @{
    webhook = @{
        url = "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp"
        webhook_by_events = $true
        events = @("messages.upsert")
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8080/webhook/set/nexo-crm" `
    -Method Post `
    -Headers $headers `
    -Body $webhookBody `
    -ContentType "application/json"
```

✅ **WhatsApp conectado e funcionando!**

---

### 3️⃣ CONECTAR HOTMART

1. Acesse: https://app.hotmart.com
2. Vá em: **Ferramentas → Configurações → Integrações → Postback**
3. Adicione:
   - **URL**: `https://web-production-1d256.up.railway.app/api/webhooks/hotmart`
   - **Eventos**: Selecione `PURCHASE_COMPLETE` e `PURCHASE_APPROVED`
4. Salve

✅ **Vendas serão registradas automaticamente!**

---

### 4️⃣ CONECTAR KIWIFY

1. Acesse: https://dashboard.kiwify.com.br
2. Vá em: **Produto → Configurações → Webhooks**
3. Adicione:
   - **URL**: `https://web-production-1d256.up.railway.app/api/webhooks/kiwify`
   - **Evento**: `sale.approved`
4. Salve

✅ **Vendas Kiwify automatizadas!**

---

## 🧪 TESTAR AGORA

### Teste Manual (WhatsApp):

```powershell
# Simular mensagem de lead
$testMessage = @{
    phone = "+5511999999999"
    message = "Olá, tenho interesse no curso"
    name = "João Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp" `
    -Method Post `
    -Body $testMessage `
    -ContentType "application/json"
```

**✅ Resposta esperada:**
```json
{
  "success": true,
  "response": "Olá João! Que legal seu interesse! 😊...",
  "actions": [...]
}
```

---

## 📱 ACESSAR O CRM

🌐 **https://frontend-pi-eight-36.vercel.app/login**

📧 **Email**: `admin@crm.com`  
🔒 **Senha**: `admin123`

**Veja:**
- ✅ Leads sendo criados automaticamente
- ✅ Agentes de IA respondendo
- ✅ Tags sendo aplicadas
- ✅ Filas movimentando
- ✅ Conversas em tempo real

---

## 🎯 COMO FUNCIONA

### Fluxo Automático:

1. **Lead envia mensagem** (WhatsApp/Instagram)
   ↓
2. **Sistema cria lead** + adiciona tags de origem
   ↓
3. **Coloca na fila** de Pré-Venda
   ↓
4. **Agente de IA** responde automaticamente
   ↓
5. **IA detecta intenção** e move entre filas
   ↓
6. **Lead compra** (webhook Hotmart/Kiwify)
   ↓
7. **Venda registrada** + move para Pós-Venda
   ↓
8. **Agente Pós-Venda** envia onboarding automático

**TUDO 100% AUTOMÁTICO!**

---

## 💰 CUSTOS

### OpenAI:
- **GPT-4 Turbo**: ~$0.02 por conversa
- **Estimativa**: 100 conversas/dia = ~$60/mês
- **Alternativa**: Use `gpt-3.5-turbo` (10x mais barato) → ~$6/mês

### Evolution API:
- **Self-hosted (Docker)**: GRÁTIS
- **Cloud**: A partir de $10/mês

### Total estimado:
- **Mínimo**: $6/mês (GPT-3.5 + Docker)
- **Ideal**: $60/mês (GPT-4 + Docker)

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Trocar para GPT-3.5 (mais barato):

No Railway → Variables:
```
OPENAI_MODEL=gpt-3.5-turbo
```

### Customizar Prompts dos Agentes:

Edite: `apps/backend/src/services/ai-agent.service.ts`

Linhas 213-280 (prompts dos 3 agentes)

---

## 🆘 PROBLEMAS?

### "IA não responde":
✅ Verifique se `OPENAI_API_KEY` está no Railway  
✅ Veja logs no Railway: Deployments → Logs  
✅ Teste com comando PowerShell acima

### "WhatsApp não conecta":
✅ Docker está rodando? `docker ps`  
✅ QR Code escaneado com WhatsApp correto?  
✅ Webhook configurado corretamente?

### "Vendas não aparecem":
✅ Webhook Hotmart/Kiwify está correto?  
✅ Teste manual enviando payload de teste  
✅ Verifique logs no Railway

---

## ✅ CHECKLIST FINAL

- [ ] `OPENAI_API_KEY` configurada
- [ ] WhatsApp Evolution API rodando
- [ ] Webhook WhatsApp configurado
- [ ] Hotmart webhook ativo
- [ ] Kiwify webhook ativo
- [ ] Teste manual funcionou
- [ ] Lead apareceu no CRM
- [ ] IA respondeu automaticamente

**TUDO OK? SISTEMA 100% OPERACIONAL! 🚀💰**

---

## 🎓 PRÓXIMOS PASSOS

1. **Customize os prompts** dos agentes para seu negócio
2. **Adicione base de conhecimento** do seu produto
3. **Configure Facebook Ads** para captura de leads
4. **Treine seu time** no uso do CRM
5. **Monitore métricas** (conversão, ROAS, etc)
6. **Escale** conforme crescimento

---

**PARABÉNS! SEU CRM COM IA ESTÁ 100% FUNCIONAL! 🎉**

Agora é só integrar suas redes sociais e começar a vender!

Qualquer dúvida, estou aqui para ajudar! 💪
