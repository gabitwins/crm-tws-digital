FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS as dependências (incluindo devDependencies para prisma)
RUN npm ci

# Copiar código fonte
COPY . .

# Build do TypeScript
RUN npm run build

# Gerar Prisma Client
RUN npx prisma generate

# Variável para auto-seed do admin
ENV AUTO_SEED=true
ENV NODE_ENV=production

EXPOSE 3000

# Comando que roda migrations + seed + servidor
CMD npx prisma migrate deploy && node prisma/seed.js && node dist/index.js
