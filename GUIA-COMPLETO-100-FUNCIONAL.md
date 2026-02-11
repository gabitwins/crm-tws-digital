# 🚀 GUIA COMPLETO - SISTEMA 100% FUNCIONAL

## ✅ PASSO 1: LIMPAR BANCO DE DADOS (REMOVER DADOS FAKE)

### Via Railway Dashboard:

1. Acesse: https://railway.app → Seu Projeto
2. Clique na aba **"postgres"** (banco de dados)
3. Vá em **"Data"** → **"Query"**
4. Cole o conteúdo do arquivo `apps/backend/prisma/limpar-banco.sql`
5. Clique em **"Run Query"**
6. ✅ **Pronto! Banco zerado!**

---

## ✅ PASSO 2: CONFIGURAR OPENAI API KEY

1. Acesse: https://platform.openai.com/api-keys
2. Clique em **"Create new secret key"**
3. Copie a chave (começa com `sk-proj-...`)
4. Acesse: https://railway.app → Seu Projeto → Serviço **web-production-1d256**
5. Vá em **Variables**
6. Clique **"+ New Variable"**
7. Nome: `OPENAI_API_KEY`
8. Valor: Cole a chave copiada
9. Clique **"Add"**
10. ⏳ **Aguarde 2-3 minutos** (Railway vai fazer redeploy automático)

---

## ✅ PASSO 3: CONECTAR WHATSAPP (Evolution API)

### Método mais fácil (Docker):

```powershell
# 1. Baixe e instale Docker Desktop
# https://www.docker.com/products/docker-desktop

# 2. Execute Evolution API
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY=NEXO-2026-SECRET `
  atendai/evolution-api:latest

# 3. Aguarde 30 segundos e abra no navegador
Start-Process "http://localhost:8080/manager"
```

### Configurar no CRM:

1. Acesse seu CRM: https://frontend-pi-eight-36.vercel.app
2. Faça login (admin@crm.com / admin123)
3. Vá em **Integrações** → **WhatsApp**
4. Copie a **URL do Webhook**
5. No Evolution Manager:
   - Crie uma nova instância
   - Configure o webhook com a URL copiada
   - Eventos: `messages.upsert`
6. Escaneie o QR Code com seu WhatsApp Business
7. ✅ **WhatsApp conectado!**

### Testar:

```powershell
# Envie uma mensagem teste
$body = @{
    phone = "+5511999999999"  # Seu número
    message = "Oi, teste do NEXO CRM!"
    name = "Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Resultado esperado:**
- Lead criado automaticamente
- Agente de IA responde
- Conversa aparece no CRM

---

## ✅ PASSO 4: CONECTAR INSTAGRAM

1. Acesse: https://developers.facebook.com
2. Crie um App → **Tipo: Business**
3. Adicione produto **"Instagram"**
4. Configure Webhooks:
   - **Callback URL**: `https://web-production-1d256.up.railway.app/api/webhooks/instagram`
   - **Verify Token**: `NEXO-INSTAGRAM-2026`
   - **Eventos**: `messages`
5. Conecte sua conta do Instagram Business
6. ✅ **Instagram conectado!**

---

## ✅ PASSO 5: CONECTAR HOTMART

1. Acesse: https://app.hotmart.com
2. Vá em: **Ferramentas → Configurações → Postback**
3. Cole: `https://web-production-1d256.up.railway.app/api/webhooks/hotmart`
4. Selecione eventos:
   - `PURCHASE_COMPLETE`
   - `PURCHASE_APPROVED`
5. Salve
6. ✅ **Hotmart conectada!**

---

## ✅ PASSO 6: CONECTAR KIWIFY

1. Acesse: https://dashboard.kiwify.com.br
2. Vá em: **Produto → Configurações → Webhooks**
3. Cole: `https://web-production-1d256.up.railway.app/api/webhooks/kiwify`
4. Selecione evento: `sale.approved`
5. Salve
6. ✅ **Kiwify conectada!**

---

## ✅ PASSO 7: CONECTAR FACEBOOK ADS

1. Acesse: https://business.facebook.com
2. Vá em: **Configurações → Lead Access**
3. Configure webhook:
   - **URL**: `https://web-production-1d256.up.railway.app/api/webhooks/facebook-ads`
   - **Evento**: `leadgen`
4. Salve
5. ✅ **Facebook Ads conectado!**

---

## 🎯 COMO O SISTEMA FUNCIONA

### Fluxo Automático:

```
1. Lead envia mensagem (WhatsApp/Instagram)
         ↓
2. Sistema cria lead + adiciona tag de origem
         ↓
3. Coloca na fila PRÉ-VENDA
         ↓
4. Agente de IA responde automaticamente
         ↓
5. IA detecta intenção e move entre filas
         ↓
6. Lead compra (webhook Hotmart/Kiwify)
         ↓
7. Venda registrada + move para PÓS-VENDA
         ↓
8. Agente Pós-Venda envia onboarding
```

### Agentes de IA:

- **Pré-Venda**: Qualifica, apresenta solução, trata objeções, fecha venda
- **Pós-Venda**: Onboarding, relacionamento, upsell, retenção
- **Suporte**: Resolve dúvidas técnicas baseado na base de conhecimento

### Sistema de Tags:

Tags são aplicadas automaticamente:
- `origem-whatsapp`, `origem-instagram`, `origem-facebook-ads`
- `objecao-preco`, `objecao-tempo`
- `cliente`, `interessado`

### Movimentação de Filas:

Leads mudam de fila automaticamente baseado em:
- **Eventos**: Mensagem, compra, reembolso
- **IA**: Detecta palavras-chave (checkout, comprar, preço)
- **Webhooks**: Hotmart/Kiwify movem para Pós-Venda após pagamento

---

## 🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Acessar o CRM:
```
https://frontend-pi-eight-36.vercel.app/login
Email: admin@crm.com
Senha: admin123
```

### 2. Verificar Integrações:
- Vá em **Integrações**
- Clique em **"Testar Webhook"** em cada uma
- Status deve ficar **"Conectado"** (verde)

### 3. Enviar Mensagem Teste:
```powershell
# WhatsApp teste
$body = @{
    phone = "+5511999999999"
    message = "Oi! Quero saber sobre o curso"
    name = "Maria Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://web-production-1d256.up.railway.app/api/webhooks/whatsapp" `
    -Method Post -Body $body -ContentType "application/json"
```

### 4. Ver no CRM:
- Dashboard: Contador de leads deve aumentar
- Leads: Lead "Maria Teste" aparece
- Mensagens: Conversa com resposta da IA
- Tags: `origem-whatsapp` aplicada

---

## 📊 CUSTOS ESTIMADOS

### OpenAI:
- **GPT-4 Turbo**: ~$0.02 por conversa
- **100 conversas/dia**: ~$60/mês
- **Alternativa GPT-3.5**: ~$6/mês (10x mais barato)

### Evolution API:
- **Self-hosted (Docker)**: GRÁTIS
- **Cloud (opcional)**: $10-20/mês

### Total mínimo:
- **$6/mês** (GPT-3.5 + Docker)
- **$60/mês** (GPT-4 + Docker) ← Recomendado

---

## 🆘 PROBLEMAS COMUNS

### "IA não responde":
✅ Verifique `OPENAI_API_KEY` no Railway  
✅ Veja logs: Railway → Deployments → Logs  
✅ Teste com comando PowerShell acima

### "WhatsApp não conecta":
✅ Docker está rodando? `docker ps`  
✅ QR Code escaneado corretamente?  
✅ Webhook configurado na Evolution API?

### "Vendas não aparecem":
✅ Webhook Hotmart/Kiwify configurado?  
✅ Teste com payload de exemplo  
✅ Veja logs no Railway

### "Leads não mudam de fila":
✅ Verifique logs da IA  
✅ Palavras-chave detectadas? (checkout, comprar, preço)  
✅ Backend está online?

---

## ✅ CHECKLIST FINAL

- [ ] Banco de dados limpo (SQL executado)
- [ ] `OPENAI_API_KEY` configurada no Railway
- [ ] WhatsApp Evolution API rodando
- [ ] Webhook WhatsApp configurado
- [ ] Instagram conectado (opcional)
- [ ] Hotmart webhook ativo
- [ ] Kiwify webhook ativo
- [ ] Facebook Ads webhook ativo (opcional)
- [ ] Teste manual enviado
- [ ] Lead apareceu no CRM
- [ ] IA respondeu automaticamente
- [ ] Dashboard mostrando dados reais

---

## 🎉 SISTEMA 100% OPERACIONAL!

Agora você tem um **CRM Empresarial com IA completo** rodando!

**Próximos passos:**
1. Customize prompts dos agentes (opcional)
2. Adicione base de conhecimento do seu produto
3. Configure campanhas de tráfego pago
4. Monitore métricas e otimize

**Suporte:**
- Documentação completa em `/DEPLOY-RAPIDO.md`
- Arquivo de integração IA em `/INTEGRACAO-IA-COMPLETA.md`

---

**Desenvolvido com 💙 por NEXO - 2026**
