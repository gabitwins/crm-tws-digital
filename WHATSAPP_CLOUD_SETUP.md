# Guia: Integração com WhatsApp Cloud API (Meta)

## 🎯 Objetivo
Substituir Baileys por WhatsApp Cloud API oficial da Meta para maior estabilidade e suporte oficial.

## 📋 Pré-requisitos

### 1. Criar App no Meta for Developers
1. Acesse: https://developers.facebook.com/
2. Clique em **"My Apps"** → **"Create App"**
3. Escolha **"Business"** como tipo
4. Preencha:
   - **App Name**: "CRM TWS Digital"
   - **Contact Email**: seu email
   - **Business Account**: selecione ou crie uma
5. Clique em **"Create App"**

### 2. Configurar WhatsApp Business
1. No painel do app, clique em **"Add Product"**
2. Selecione **"WhatsApp"** → **"Set Up"**
3. Na seção **"API Setup"**, você verá:
   - **Phone Number ID** (exemplo: `123456789012345`)
   - **WhatsApp Business Account ID** (exemplo: `987654321098765`)
   - **Temporary Access Token** (válido por 24h)

### 3. Gerar Permanent Access Token
1. No menu lateral, vá em **"Tools"** → **"Graph API Explorer"**
2. Selecione seu app criado
3. Em **"User or Page"**, selecione **"Business Account"**
4. Clique em **"Generate Access Token"**
5. Permissões necessárias:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
6. Copie o token (começa com `EAA...`)
7. **IMPORTANTE**: Armazene esse token em local seguro (nunca comite no Git)

### 4. Configurar Webhook no Meta

#### 4.1. Expor sua API local para internet
**Opção 1: Usar ngrok** (desenvolvimento)
```bash
# Instalar ngrok
winget install ngrok

# Expor porta 4000
ngrok http 4000
```
Você receberá uma URL como: `https://abc123.ngrok.io`

**Opção 2: Usar Vercel/Railway** (produção)
Deploy o backend em um serviço com URL pública permanente.

#### 4.2. Configurar no Meta
1. No painel do WhatsApp, vá em **"Configuration"** → **"Webhook"**
2. Clique em **"Edit"**
3. Preencha:
   - **Callback URL**: `https://sua-url.ngrok.io/api/whatsapp/webhook`
   - **Verify Token**: crie um token secreto (ex: `meu_token_secreto_12345`)
   - Marque **"messages"** nas opções de assinatura
4. Clique em **"Verify and Save"**

Se aparecer ✅ verde, está funcionando!

## 🚀 Configurar no CRM

### Passo 1: Salvar credenciais
Use a rota **POST /api/whatsapp/configure** (via frontend ou Postman):

```json
{
  "phoneNumberId": "123456789012345",
  "accessToken": "EAA...seu_token_permanente",
  "businessAccountId": "987654321098765",
  "webhookVerifyToken": "meu_token_secreto_12345"
}
```

**Exemplo de chamada via curl:**
```bash
curl -X POST http://localhost:4000/api/whatsapp/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "phoneNumberId": "123456789012345",
    "accessToken": "EAA...",
    "businessAccountId": "987654321098765",
    "webhookVerifyToken": "meu_token_secreto_12345"
  }'
```

### Passo 2: Verificar status
```bash
curl http://localhost:4000/api/whatsapp/status \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

Resposta esperada:
```json
{
  "configured": true,
  "config": {
    "phoneNumberId": "123456789012345",
    "businessAccountId": "987654321098765"
  }
}
```

### Passo 3: Testar envio
```bash
curl -X POST http://localhost:4000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "to": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste do CRM."
  }'
```

**IMPORTANTE**: O número deve estar no formato internacional sem `+` (ex: `5511999999999`).

## 🔧 Fluxo de Funcionamento

### Receber Mensagens
1. Cliente envia mensagem no WhatsApp
2. Meta envia webhook para `/api/whatsapp/webhook` (POST)
3. Backend:
   - Cria/atualiza lead no banco
   - Gera resposta com IA (OpenAI)
   - Envia resposta via Cloud API
   - Analisa se deve mover de fila

### Enviar Mensagens
1. Frontend/Backend chama `/api/whatsapp/send`
2. Serviço faz POST para `https://graph.facebook.com/v21.0/{phone-number-id}/messages`
3. Mensagem é entregue pelo WhatsApp

## 🛡️ Segurança

### Tokens
- **Access Token**: NUNCA exponha em logs ou frontend
- **Verify Token**: Use string aleatória forte (mínimo 32 caracteres)
- Armazene em variáveis de ambiente:
  ```env
  WHATSAPP_ACCESS_TOKEN=EAA...
  WHATSAPP_VERIFY_TOKEN=meu_token_super_secreto
  ```

### Webhook
- Meta valida o `verify_token` antes de enviar mensagens
- Sempre retorne `200` no webhook, mesmo se houver erro interno
- Processe mensagens de forma assíncrona

## 📊 Limites da API (Tier Gratuito)

| Recurso | Limite |
|---------|--------|
| Mensagens/dia | 1.000 |
| Mensagens ativas | 250 conversas únicas |
| Números de teste | 5 |

Para aumentar, solicite upgrade na seção **"Phone Numbers"** do app.

## 🧪 Testar Recebimento

1. Envie uma mensagem do seu celular para o número do WhatsApp Business
2. Verifique logs do backend: `📩 Mensagem recebida de...`
3. Verifique se a resposta da IA foi enviada
4. Confirme no celular que recebeu a resposta

## 🐛 Troubleshooting

### Erro: "Invalid access token"
- Token expirou → Gere novo permanent token
- Token sem permissões → Adicione `whatsapp_business_messaging`

### Erro: "Webhook verification failed"
- Verify token incorreto → Confira o valor exato em ambos os lados
- URL incorreta → Verifique se ngrok está rodando

### Erro: "(#131009) Parameter value is not valid"
- Número de telefone em formato errado → Use formato internacional sem `+`
- Exemplo correto: `5511999999999`

### Webhook não recebe mensagens
1. Verifique se a subscription está ativa: **Configuration → Webhook → messages ✅**
2. Teste manualmente enviando uma mensagem
3. Verifique logs do backend
4. Teste URL do webhook: `curl https://sua-url.ngrok.io/api/whatsapp/webhook`

## 📝 Próximos Passos

1. ✅ Backend configurado (serviço + rotas)
2. ⏳ **Frontend**: Criar tela de configuração em "Integrações"
3. ⏳ **Produção**: Deploy em servidor com IP fixo (Railway, Render, etc)
4. ⏳ **Escala**: Solicitar aprovação de conta Business para tier superior

## 🔗 Links Úteis

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
