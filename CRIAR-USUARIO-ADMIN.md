# 🔐 Como Criar Usuário Admin no Railway

## Opção 1: Via Interface Web do Railway (MAIS FÁCIL)

1. Acesse: https://railway.app/
2. Faça login
3. Entre no projeto **CRM TWS DIGITAL**
4. Clique no serviço **Postgres**
5. Vá em **Data** → **Query**
6. Cole o SQL abaixo:

```sql
-- Criar usuário admin com senha: admin123
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

7. Clique em **Run Query**
8. Veja a mensagem de sucesso: "1 row inserted"

---

## Opção 2: Via Railway CLI (SE TIVER INSTALADO)

```bash
# Conectar ao banco
railway run psql $DATABASE_URL

# Dentro do psql, cole o SQL acima e pressione Enter
```

---

## ✅ CREDENCIAIS DO ADMIN

Após executar o SQL acima, use estas credenciais para fazer login:

- **Email**: `admin@crm.com`
- **Senha**: `admin123`
- **URL Login**: https://frontend-pi-eight-36.vercel.app/login

---

## 🧪 TESTAR SE FUNCIONOU

1. Acesse: https://frontend-pi-eight-36.vercel.app/login
2. Digite:
   - Email: `admin@crm.com`
   - Senha: `admin123`
3. Clique em "Entrar"
4. Você deverá ser redirecionado para o Dashboard!

---

## 🆘 SE DER ERRO

### Erro: "Invalid credentials"

**Causa**: Usuário não foi criado ou senha está errada.

**Solução**: 
1. Execute o SQL novamente no Railway
2. Verifique se a tabela se chama `users` (não `"User"`)
3. Tente executar:
   ```sql
   SELECT * FROM users WHERE email = 'admin@crm.com';
   ```
   Se retornar vazio, significa que não foi criado.

### Erro: "No token provided"

**Causa**: Frontend não está enviando o token.

**Solução**: 
1. Abra o DevTools (F12)
2. Vá em "Console"
3. Veja se há erros de JavaScript
4. Faça um hard refresh (Ctrl+Shift+R)

### Erro de tabela não encontrada

**Causa**: Nome da tabela pode estar errado.

**Solução**: Tente com aspas duplas:
```sql
INSERT INTO "users" (id, email, name, password, role, "isActive", "createdAt", "updatedAt") ...
```

Ou sem aspas:
```sql
INSERT INTO users (id, email, name, password, role, isActive, createdAt, updatedAt) ...
```

---

## 📊 POPULAR BANCO COM DADOS DE TESTE (OPCIONAL)

Se quiser testar o sistema com alguns leads fake:

```sql
-- Dados de exemplo para testar o sistema
INSERT INTO "Lead" (id, name, email, phone, status, "currentQueue", source, "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'João Silva', 'joao@teste.com', '+5511987654321', 'lead', 'PRE_VENDA', 'whatsapp', true, NOW(), NOW()),
(gen_random_uuid(), 'Maria Santos', 'maria@teste.com', '+5511987654322', 'pre_venda', 'PRE_VENDA', 'instagram', true, NOW(), NOW()),
(gen_random_uuid(), 'Pedro Costa', 'pedro@teste.com', '+5511987654323', 'aluno_ativo', 'POS_VENDA', 'facebook', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Criar usuário admin (você está aqui!)
2. ✅ Fazer login no sistema
3. ✅ Explorar o dashboard
4. ✅ Configurar agentes de IA
5. ✅ Conectar WhatsApp/Instagram
6. ✅ Começar a usar!

---

**🔥 Dica**: Salve as credenciais em um lugar seguro!
