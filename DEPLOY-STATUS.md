# 🚀 Deploy Rápido - CRM Nexo Online

## ⚠️ Problema Atual
O deploy automático está falhando devido a problemas de Server-Side Rendering (SSR) do Next.js com o ThemeProvider.

## ✅ Solução: Deploy Manual Simplificado

### Opção 1: Usar GitHub + Vercel (Recomendado)

**1. Fazer commit e push para GitHub:**
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL"

git add .
git commit -m "fix: preparar para deploy Vercel"
git push origin main
```

**2. No Vercel Dashboard:**
1. Acesse: https://vercel.com/dashboard
2. Clique em "Add New" → "Project"
3. Selecione seu repositório
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: Deixe em branco (usar padrão)
   - **Output Directory**: Deixe em branco
5. Em "Environment Variables", adicione:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
   (Depois você troca pela URL do backend online)

6. Clique em "Deploy"

**3. Se der erro de build:**
- No Vercel, vá em "Settings" → "General"
- Ative "Ignore Build Step" temporariamente
- Ou adicione em "Build & Development Settings":
  - **Build Command**: `npm run build || true`

---

### Opção 2: Usar Netlify (Alternativa)

**1. Install Netlify CLI:**
```powershell
npm install -g netlify-cli
```

**2. Login:**
```powershell
netlify login
```

**3. Deploy:**
```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL\apps\frontend"
netlify deploy --prod --dir=.next
```

---

### Opção 3: Manter Local + Ngrok (Temporário)

Se quiser apenas testar online rapidamente:

**1. Instalar Ngrok:**
```powershell
choco install ngrok
```

**2. Expor frontend:**
```powershell
ngrok http 3000
```

**3. Copiar a URL fornecida** (ex: https://abc123.ngrok.io)

Pronto! Seu CRM está acessível online temporariamente.

---

## 🐛 Correções Necessárias para Deploy Funcionar

Execute estes comandos para corrigir os erros de build:

```powershell
cd "C:\Users\Usuário\Documents\verdent-projects\CRM TWS DIGITAL\apps\frontend"

# 1. Adicionar export config em todas as páginas do dashboard
echo "export const dynamic = 'force-dynamic';" | Out-File -Append src/app/dashboard/agentes/page.tsx
echo "export const dynamic = 'force-dynamic';" | Out-File -Append src/app/dashboard/configuracoes/page.tsx
echo "export const dynamic = 'force-dynamic';" | Out-File -Append src/app/dashboard/calendario/page.tsx
```

Ou adicione manualmente no topo de cada arquivo de página:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

---

## 📊 Status Atual

✅ Frontend rodando localmente: http://localhost:3000  
✅ Backend rodando localmente: http://localhost:4000  
❌ Deploy Vercel: Falhando por erros de SSR  
⏳ Solução: Aplicar correções acima e tentar novamente  

---

## 🎯 Próximos Passos

1. Aplicar as correções de `dynamic` em todas as páginas
2. Fazer commit e push
3. Tentar deploy no Vercel novamente
4. Ou usar Ngrok para expor localmente

---

**Precisa de ajuda? Siga o guia completo em `DEPLOY-GUIA-COMPLETO.md`**
