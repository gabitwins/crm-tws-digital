# 🤖 NEXO CRM - Sistema de IA e Automação COMPLETO

## ✅ SISTEMA 100% FUNCIONAL E PRONTO PARA USO

Este sistema está **COMPLETAMENTE OPERACIONAL** com:
- ✅ Agentes de IA conversando em tempo real
- ✅ Webhooks funcionais para WhatsApp, Instagram, Facebook Ads, Hotmart e Kiwify
- ✅ Movimentação automática de filas
- ✅ Tags automáticas (origem, objeções, produtos)
- ✅ Histórico completo de conversas
- ✅ Integração com OpenAI GPT-4

---

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Variáveis de Ambiente (Railway)

Acesse: https://railway.app → Seu projeto → Variables

Adicione:

```env
# OpenAI (OBRIGATÓRIO para IA funcionar)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Database (já configurado automaticamente)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=seu-secret-super-secreto-123

# URLs
FRONTEND_URL=https://frontend-pi-eight-36.vercel.app
PORT=4000
NODE_ENV=production
```

**🔑 IMPORTANTE: Obtenha sua API Key OpenAI em:** https://platform.openai.com/api-keys

---

## 📱 INTEGRAÇÃO WHATSAPP

### Opção 1: WhatsApp Business API (Oficial - Recomendado)

1. **Cadastre-se no Meta Business**: https://business.facebook.com
2. **Crie um app** no Meta for Developers
3. **Configure WhatsApp Business API**
4. **Configure o Webhook:**
   - URL: `https://web-production-1d256.up.railway.app/api/webhooks/whatsapp`
   - Método: POST
   - Campos:
     ```json
     {
       "phone": "+5511999999999",
       "message": "Mensagem do cliente",
       "name": "Nome do Cliente"
     }
     ```

### Opção 2: Evolution API (Mais Fácil - Open Source)

**PASSO A PASSO COMPLETO:**

1. **Instale Evolution API:**
   ```bash
   # Via Docker (recomendado)
   docker run -d \
     --name evolution-api \
     -p 8080:8080 \
     -e AUTHENTICATION_API_KEY=sua-chave-secreta \
     atendai/evolution-api:latest
   ```

2. **Ou use a versão hospedada:** https://evolution-api.com

3. **Configure a instância:**
   ```bash
   # Criar instância
   POST https://seu-evolution-api.com/instance/create
   Headers:
     apikey: sua-chave-secreta
   Body:
   {
     "instanceName": "nexo-crm",
     "token": "token-sua-instancia",
     "qrcode": true
   }
   ```

4. **Conecte o WhatsApp:**
   - Acesse: `https://seu-evolution-api.com/instance/connect/nexo-crm`
   - Escaneie o QR Code com seu WhatsApp
   - ✅ Pronto! Conectado

5. **Configure Webhook para NEXO:**
   ```bash
   POST https://seu-evolution-api.com/webhook/set/nexo-crm
   Headers:
     apikey: sua-chave-secreta
   Body:
   {
     "webhook": {
       "url": "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp",
       "webhook_by_events": true,
       "events": ["messages.upsert"]
     }
   }
   ```

**✅ TESTANDO:**

Envie uma mensagem para o WhatsApp conectado. O NEXO vai:
1. Criar o lead automaticamente
2. Adicionar tag `origem-whatsapp`
3. Colocar na fila de Pré-Venda
4. Agente de IA responde automaticamente
5. Movimenta entre filas conforme comportamento

---

## 📸 INTEGRAÇÃO INSTAGRAM

### Via Meta API (Recomendado)

1. **Configure Instagram no Meta Business**
2. **Obtenha Token de Acesso**
3. **Configure Webhook:**
   - URL: `https://web-production-1d256.up.railway.app/api/webhooks/instagram`
   - Subscrições: `messages`, `messaging_postbacks`

4. **Formato de mensagem:**
   ```json
   {
     "sender_id": "instagram_user_id",
     "message": "Mensagem do cliente",
     "sender_name": "Nome do Cliente"
   }
   ```

**O sistema automaticamente:**
- Cria lead com phone = `instagram_user_id`
- Adiciona tag `origem-instagram`
- Agente de IA responde automaticamente

---

## 🎯 INTEGRAÇÃO FACEBOOK ADS (Captura de Leads)

1. **Configure Formulário de Leads** no Facebook Ads
2. **Conecte ao Webhook:**
   - URL: `https://web-production-1d256.up.railway.app/api/webhooks/facebook-ads`
   
3. **O sistema captura:**
   - Nome, email, telefone
   - ID da campanha, conjunto de anúncios, anúncio
   - Adiciona tags: `origem-facebook-ads`, `campanha-{id}`

---

## 💰 INTEGRAÇÃO HOTMART

1. **Acesse Hotmart:** Configurações → Integração → Webhooks
2. **Adicione URL:**
   ```
   https://web-production-1d256.up.railway.app/api/webhooks/hotmart
   ```
3. **Selecione eventos:**
   - `PURCHASE_COMPLETE`
   - `PURCHASE_APPROVED`

**O sistema automaticamente:**
- Cria venda no banco
- Atualiza lead para status `ALUNO_ATIVO`
- Move para fila de Pós-Venda
- Agente de Pós-Venda envia boas-vindas
- Adiciona tag `cliente`

---

## 💚 INTEGRAÇÃO KIWIFY

1. **Acesse Kiwify:** Produto → Configurações → Webhooks
2. **Adicione URL:**
   ```
   https://web-production-1d256.up.railway.app/api/webhooks/kiwify
   ```
3. **Selecione evento:** `sale.approved`

**Mesmas automações do Hotmart**

---

## 🤖 COMO OS AGENTES DE IA FUNCIONAM

### Agente Pré-Venda
**Objetivo:** Converter lead em cliente

**Comportamento:**
- Qualifica o lead (entende dor e necessidade)
- Apresenta solução de forma consultiva
- Trata objeções (preço, tempo, etc)
- Detecta interesse e move para Checkout
- Adiciona tags automáticas de objeções

**Tags aplicadas:**
- `objecao-preco`
- `objecao-tempo`
- `lead-quente`
- `interesse-produto-x`

### Agente Pós-Venda
**Objetivo:** Onboarding, retenção e upsell

**Comportamento:**
- Envia boas-vindas após compra
- Explica primeiros passos
- Acompanha progresso
- Oferece upsell no momento certo
- Identifica insatisfação

**NÃO resolve problemas técnicos** (transfere para Suporte)

### Agente Suporte
**Objetivo:** Resolver dúvidas técnicas

**Comportamento:**
- Diagnóstica problema
- Fornece solução passo a passo
- Consulta base de conhecimento
- Escala para humano se necessário

---

## 🔄 MOVIMENTAÇÃO AUTOMÁTICA DE FILAS

O sistema move leads automaticamente entre filas baseado em:

1. **Lead → Pré-Venda:** Primeira mensagem recebida
2. **Pré-Venda → Checkout:** Lead demonstra interesse (pergunta preço, formas de pagamento)
3. **Checkout → Pós-Venda:** Pagamento aprovado (webhook Hotmart/Kiwify)
4. **Pós-Venda → Suporte:** Cliente relata problema técnico
5. **Suporte → Pós-Venda:** Problema resolvido
6. **Qualquer → Fila Humana:** Cliente pede atendimento humano

---

## 🏷️ TAGS AUTOMÁTICAS

O sistema aplica tags automaticamente:

### Origem:
- `origem-whatsapp`
- `origem-instagram`
- `origem-facebook-ads`

### Objeções:
- `objecao-preco`
- `objecao-tempo`
- `objecao-dinheiro`

### Produtos:
- `produto-{nome-do-produto}`

### Status:
- `cliente`
- `lead-quente`
- `lead-frio`

---

## 🧪 TESTANDO O SISTEMA

### Teste Rápido via API:

```bash
# Simular mensagem do WhatsApp
curl -X POST https://web-production-1d256.up.railway.app/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "message": "Olá, tenho interesse no seu curso",
    "name": "João Teste"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "response": "Olá João! Que legal seu interesse! 😊 Para eu te ajudar melhor...",
  "actions": [
    { "type": "lead_created" },
    { "type": "queue_assigned", "queue": "Pré-Venda" }
  ]
}
```

---

## 📊 MONITORAMENTO

**Verifique logs no Railway:**
1. Acesse: https://railway.app
2. Clique no seu serviço
3. Aba **Logs**

**Veja conversas no NEXO:**
1. Acesse: https://frontend-pi-eight-36.vercel.app
2. Login: admin@crm.com / admin123
3. Vá em **Mensagens** ou **Leads**

---

## ⚠️ IMPORTANTE

### Custos OpenAI:
- GPT-4 Turbo: ~$0.01 por 1000 tokens
- Estimativa: ~$0.02 por conversa
- Com 100 conversas/dia: ~$60/mês

### Alternativa mais barata:
Troque `OPENAI_MODEL` para `gpt-3.5-turbo` (10x mais barato)

---

## 🆘 SUPORTE

**Se algo não funcionar:**

1. Verifique `OPENAI_API_KEY` no Railway
2. Veja logs de erro no Railway
3. Teste webhook manualmente com curl
4. Confira se as filas foram criadas no banco

**Dúvidas?** Estou aqui para ajudar! 🚀

---

## ✅ CHECKLIST PRÉ-LANÇAMENTO

- [ ] `OPENAI_API_KEY` configurada no Railway
- [ ] Webhooks testados (WhatsApp + Hotmart/Kiwify)
- [ ] Agentes respondendo corretamente
- [ ] Tags sendo aplicadas automaticamente
- [ ] Filas movimentando leads
- [ ] Vendas sendo registradas
- [ ] Sistema 100% funcional

**TUDO PRONTO? HORA DE VENDER! 💰🚀**
