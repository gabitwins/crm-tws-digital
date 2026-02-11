# 🚨 ATENÇÃO: LEIA ISSO PRIMEIRO!

## 🔴 O PROBLEMA

Você está vendo **DADOS FAKE** na tela porque **NÃO ESTÁ LOGADO**.

O sistema está 100% funcional, mas a API exige autenticação. Quando você não está logado, o frontend mostra dados fake como fallback.

---

## ✅ SOLUÇÃO RÁPIDA (5 MINUTOS)

### ETAPA 1: Criar Usuário Admin (1 minuto)

1. **Abra uma nova aba** → https://railway.app/
2. **Faça login** no Railway
3. **Entre no projeto** "CRM TWS DIGITAL"
4. **Clique em** "Postgres" (o banco de dados)
5. **Clique em** "Data" (no menu superior)
6. **Clique em** "Query" (para abrir o editor SQL)
7. **Cole este código** no editor:

```sql
INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@crm.com',
  'Administrador',
  '$2a$10$nlyiBQkNPms/pYG6YYhB4.VkOcrxaJxGmWfgDDl7snW.vwd.xLsYO',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = '$2a$10$nlyiBQkNPms/pYG6YYhB4.VkOcrxaJxGmWfgDDl7snW.vwd.xLsYO',
  "updatedAt" = NOW();
```

8. **Clique em** "Run Query" (botão verde)
9. **Veja a mensagem** "1 row inserted" ou "1 row updated"

✅ **Usuário admin criado com sucesso!**

---

### ETAPA 2: Fazer Login no CRM (30 segundos)

1. **Abra uma nova aba** → https://frontend-pi-eight-36.vercel.app/login

2. **Digite as credenciais**:
   - Email: `admin@crm.com`
   - Senha: `admin123`

3. **Clique em** "Entrar"

4. **Aguarde** 2-3 segundos (vai aparecer "Logging in...")

5. **Você será redirecionado** para o Dashboard!

✅ **Login realizado com sucesso!**

---

### ETAPA 3: Verificar se Funcionou (30 segundos)

Após fazer login, você deverá ver:

✅ **Dashboard com gráficos zerados** (sem dados fake)
✅ **Logo "NEXO"** no canto superior esquerdo
✅ **Seu nome "Admin"** no canto superior direito
✅ **Menu lateral** com todas as opções:
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

✅ **Clique em "Leads"** → você verá uma tela vazia dizendo "Nenhum lead encontrado"
✅ **Clique em "Mensagens"** → você verá uma lista vazia
✅ **Clique em "Agentes de IA"** → você verá os 3 agentes (Pré-Venda, Pós-Venda, Suporte)

---

## 🎯 O QUE FAZER AGORA?

Seu CRM está **100% FUNCIONAL e ZERADO**, pronto para uso real!

### Próximos passos:

1. ✅ **Conectar WhatsApp**
   - Vá em: Integrações → WhatsApp
   - Escolha o método (API oficial ou Baileys)
   - Siga as instruções para gerar QR Code

2. ✅ **Conectar Instagram**
   - Vá em: Integrações → Instagram
   - Conecte sua conta do Facebook Business
   - Vincule sua página do Instagram

3. ✅ **Configurar Agentes de IA**
   - Vá em: Agentes de IA
   - Configure os prompts dos 3 agentes:
     - Pré-Venda (para converter leads)
     - Pós-Venda (para onboarding e upsell)
     - Suporte (para dúvidas técnicas)

4. ✅ **Conectar Hotmart/Kiwify**
   - Vá em: Integrações → Hotmart (ou Kiwify)
   - Configure o webhook
   - Cole seu token de autenticação

5. ✅ **Conectar Facebook Ads**
   - Vá em: Integrações → Facebook Ads
   - Cole seu Pixel ID
   - Gere um Access Token
   - Cole o token e salve

---

## 🆘 PROBLEMAS COMUNS

### 1. "Invalid credentials" ao tentar logar

**Causa**: Usuário admin não foi criado ou você digitou a senha errada.

**Solução**:
1. Execute o SQL novamente no Railway (ETAPA 1)
2. Certifique-se de copiar o hash completo (começa com $2a$10$)
3. Tente fazer login novamente com `admin123`

---

### 2. Ainda vejo dados fake (João Silva, Pedro Costa, etc)

**Causa**: Cache do navegador está mostrando a versão antiga.

**Solução**:
1. Faça um **hard refresh**: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
2. Ou abra em **aba anônima**: Ctrl+Shift+N (Chrome/Edge)
3. Aguarde 2-3 minutos para o CDN do Vercel atualizar

---

### 3. Página branca após login

**Causa**: Erro de JavaScript ou token inválido.

**Solução**:
1. Abra o DevTools: F12
2. Vá em "Console"
3. Veja se há erros em vermelho
4. Me envie um print do erro para eu corrigir

---

### 4. API retorna 401 (Unauthorized)

**Causa**: Token não está sendo enviado ou é inválido.

**Solução**:
1. Faça logout (se tiver botão de logout)
2. Limpe o Local Storage:
   - F12 → Application → Local Storage → Limpar
3. Faça login novamente

---

### 5. Botões ainda não fazem nada

**Causa**: Você ainda está na versão antiga em cache.

**Solução**:
1. Ctrl+Shift+R para hard refresh
2. Aguarde 3 minutos
3. Abra em aba anônima para testar

---

## 📞 PRECISA DE AJUDA?

Se nada disso funcionar, me envie:

1. **Print da tela** do erro
2. **F12 → Console** (print dos erros em vermelho)
3. **URL** que você está tentando acessar
4. **Credenciais** que você está usando para logar

---

## 🔥 IMPORTANTE

**NÃO ADICIONE DADOS FAKE MANUALMENTE!**

Quando você conectar suas integrações (WhatsApp, Instagram, Hotmart), os dados reais vão aparecer automaticamente:

- Leads vindo do WhatsApp/Instagram
- Vendas vindo da Hotmart/Kiwify
- Métricas vindo do Facebook Ads
- Mensagens sendo respondidas pela IA

**O sistema está pronto para uso REAL!**

---

## ✅ CHECKLIST FINAL

Marque conforme for fazendo:

- [ ] Executei o SQL no Railway para criar o usuário admin
- [ ] Fiz login em https://frontend-pi-eight-36.vercel.app/login
- [ ] Estou vendo o dashboard zerado (sem dados fake)
- [ ] Cliquei em todas as abas e elas estão funcionando
- [ ] Vou conectar minhas integrações agora
- [ ] Vou configurar os agentes de IA

---

**🎉 Sistema 100% funcional! Basta seguir os 2 passos acima!**

---

**Criado em**: 10/02/2026  
**Última atualização**: Commit d3f446b  
**Status**: ✅ Sistema operacional e pronto para uso
