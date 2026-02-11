# ====================================
# ARQUIVO .ENV - CONFIGURAÇÃO COMPLETA
# ====================================
# Copie este conteúdo para o arquivo .env do backend

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_nexo"

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:4000

# JWT
JWT_SECRET=super-secret-jwt-key-change-in-production-2026
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=SUA_CHAVE_AQUI

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-sessions

# ====================================
# GOOGLE OAUTH (OBRIGATÓRIO PARA INTEGRAÇÕES)
# ====================================
# Como obter:
# 1. Acesse: https://console.cloud.google.com/
# 2. Crie um projeto novo
# 3. Vá em "APIs e serviços" → "Credenciais"
# 4. Crie "ID do cliente OAuth 2.0"
# 5. Tipo: Aplicativo da Web
# 6. URIs de redirecionamento autorizados:
#    - http://localhost:4000/api/integrations/google-ads/callback
#    - http://localhost:4000/api/integrations/google-calendar/callback

GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI

# ====================================
# FACEBOOK / INSTAGRAM / META OAUTH
# ====================================
# Como obter:
# 1. Acesse: https://developers.facebook.com/
# 2. Crie um app
# 3. Adicione produto "Login do Facebook"
# 4. URIs de redirecionamento válidos:
#    - http://localhost:4000/api/integrations/instagram/callback
#    - http://localhost:4000/api/integrations/facebook-ads/callback
# 5. Copie App ID e App Secret

FACEBOOK_APP_ID=SEU_APP_ID_AQUI
FACEBOOK_APP_SECRET=SEU_APP_SECRET_AQUI

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# ====================================
# INSTRUÇÕES:
# ====================================
# 1. Copie este conteúdo para apps/backend/.env
# 2. Substitua os valores "SEU_CLIENT_ID_AQUI" pelas credenciais reais
# 3. Reinicie o backend: npm run dev
