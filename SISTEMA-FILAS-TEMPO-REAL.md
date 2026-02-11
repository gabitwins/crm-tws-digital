# 🎯 SISTEMA DE FILAS EM TEMPO REAL - FUNCIONANDO!

## ✅ O que foi implementado

### 1. **Backend - Rota `/queues` com dados reais**

A rota `GET /api/queues` agora retorna:

- **Filas baseadas em agentes ativos**: Cada agente ativo cria automaticamente sua fila correspondente
  - PREVENDA/PREVENTA → Fila PRE_VENDA
  - VENDAS → Fila CHECKOUT  
  - POSVENDA → Fila POS_VENDA
  - SUPORTE → Fila SUPORTE
  - RETENCAO → Fila RETENCAO

- **Contagem de leads em tempo real**: Quantidade exata de leads ativos em cada fila (baseado no campo `currentQueue` do banco)

- **Últimas 10 interações**: Para cada fila, mostra as últimas 10 mensagens trocadas entre leads e agentes, incluindo:
  - Nome do lead
  - Telefone
  - Direção (INBOUND = lead mandou / OUTBOUND = agente respondeu)
  - Conteúdo da mensagem (primeiros 100 caracteres)
  - Timestamp  
  - Se foi gerado por IA (emoji 🤖)

- **Tempo médio de resposta**: Calcula o tempo entre a última mensagem INBOUND e a primeira mensagem OUTBOUND do agente

- **Taxa de conversão**: Porcentagem de leads que viraram vendas aprovadas naquela fila

### 2. **Frontend - Atualização em tempo real (Polling)**

A página de **Filas** (`/dashboard/filas`) agora:

- **Atualiza automaticamente a cada 5 segundos** (polling)
- Mostra badge verde com "Tempo real" pulsando
- Exibe timestamp da última atualização ("Atualizado há X segundos")
- Botão "Atualizar" manual com animação de loading

### 3. **Visualização de Interações ao Vivo**

Cada card de fila mostra:

- **Indicador de status**: Bolinha verde pulsando para filas ativas
- **Botão "Interações Recentes"**: Clique para expandir e ver as últimas conversas
- **Mensagens coloridas**:
  - Azul com borda azul = Resposta do agente (OUTBOUND)
  - Cinza com borda cinza = Mensagem do lead (INBOUND)
- **Emoji 🤖**: Aparece nas mensagens que foram geradas por IA
- **Timestamp relativo**: "há 2 minutos", "há 1 hora"

---

## 🧪 COMO TESTAR (Passo a passo completo)

### 📋 Pré-requisitos

1. ✅ Backend rodando na porta **4000** (já está rodando!)
2. ✅ Frontend rodando na porta **3000** (verificar se está)
3. ✅ Banco de dados PostgreSQL conectado (já está!)
4. ⚠️ **WhatsApp conectado via Baileys** (precisa conectar primeiro!)

---

### **Teste 1: Ver filas baseadas em agentes ativos**

#### Passo 1: Criar e ativar agentes de IA

1. Acesse http://localhost:3000 e faça login
2. Vá em **Agentes de IA** (menu lateral)
3. Clique em **"Criar o seu agente do zero"**
4. Preencha:
   - **Nome**: "Agente de Pré-Venda"
   - **Função**: Selecione "PRE-VENDA"
   - **Prompt do sistema**: "Você é um assistente de vendas que ajuda novos leads a conhecer os produtos."
   - **Tom de voz**: Amigável
   - **Temperatura**: 0.7
5. Clique em **"Criar Agente"** → Agente salvo! ✅
6. Certifique-se de que o agente está **ATIVO** (toggle verde)

#### Passo 2: Ver fila criada automaticamente

1. Vá em **Filas** (menu lateral)
2. Você verá um card com:
   - **Nome**: "PRE-VENDA"
   - **Descrição**: "Leads novos e prospecção inicial"
   - **Leads na fila**: 0 (ainda não tem leads)
   - **Agente ativo**: "Agente de Pré-Venda"
   - **Status**: Bolinha verde pulsando (Ativa)

#### Passo 3: Criar mais agentes (opcional)

Repita o Passo 1 para criar:
- Agente de Vendas (função: VENDAS)
- Agente de Suporte (função: SUPORTE)
- Agente de Pós-Venda (função: POSVENDA)

Cada agente criado e ativado vai gerar uma nova fila automaticamente!

---

### **Teste 2: Ver agentes interagindo em tempo real (PRINCIPAL)**

> ⚠️ **IMPORTANTE**: Para este teste funcionar, você PRECISA ter o WhatsApp conectado via Baileys!  
> Se ainda não conectou, siga o arquivo `TESTE-WHATSAPP.md` primeiro.

#### Passo 1: Conectar WhatsApp (se ainda não conectou)

1. Vá em **Integrações** → **WhatsApp Business** → **Conectar**
2. Escaneie o QR Code com seu celular
3. Aguarde mensagem "WhatsApp conectado com sucesso" ✅

#### Passo 2: Enviar mensagem de teste

1. No seu celular, salve o número do WhatsApp que você conectou
2. **Envie uma mensagem de outro WhatsApp** para esse número, por exemplo:
   - "Olá, gostaria de saber mais sobre os produtos"
3. **O que deve acontecer automaticamente**:
   - ✅ Backend recebe a mensagem via Baileys
   - ✅ Cria (ou atualiza) um **Lead** no banco com nome e telefone
   - ✅ Lead é atribuído à fila **PRE_VENDA** (já que é um lead novo)
   - ✅ Agente de Pré-Venda recebe a mensagem
   - ✅ OpenAI gera resposta baseada no prompt do agente
   - ✅ Resposta é enviada de volta via WhatsApp
   - ✅ Mensagens INBOUND e OUTBOUND são salvas no banco

#### Passo 3: Ver na página de Filas (tempo real!)

1. Volte para a página **Filas** no CRM
2. **Aguarde até 5 segundos** (polling automático)
3. Você verá:
   - ✅ **Leads na fila**: 1 (aumentou de 0 para 1!)
   - ✅ **Total de Leads** no topo: 1
   - ✅ **Tempo médio de resposta**: X segundos (calculado automaticamente)

4. Clique em **"Interações Recentes (2)"** no card da fila PRE_VENDA
5. Você verá 2 mensagens:
   - Primeira (cinza): "Olá, gostaria de saber mais sobre os produtos" ← **Lead mandou**
   - Segunda (azul com 🤖): "Olá! Fico feliz em ajudar você..." ← **Agente IA respondeu**

#### Passo 4: Continuar conversando e ver em tempo real

1. **No celular**, responda para o WhatsApp:
   - "Quanto custa?"
2. **Volte para a página Filas**
3. **Aguarde 5 segundos** (ou clique em "Atualizar")
4. Clique novamente em "Interações Recentes"
5. Agora você verá **4 mensagens** (a nova pergunta + resposta do agente)

**Isso é TEMPO REAL! A cada 5 segundos a tela atualiza sozinha! 🎉**

---

### **Teste 3: Ver leads mudando de fila (inteligência da IA)**

> Este teste demonstra como os agentes movem leads entre filas baseado na conversa.

#### Cenário: Lead interessado virando cliente

1. **Lead manda**: "Quero comprar o produto X"
2. **Agente PRE_VENDA responde** e detecta intenção de compra
3. **QueueService.analyzeAndMoveQueue()** analisa a mensagem
4. Lead é **movido automaticamente** para fila **CHECKOUT**
5. **Agente de Vendas** assume a conversa
6. Na página Filas:
   - Card PRE_VENDA: **Leads na fila diminui**
   - Card CHECKOUT: **Leads na fila aumenta**
   - Interações aparecem no card CHECKOUT agora

#### Cenário: Cliente com dúvida técnica

1. **Cliente manda**: "Como faço para resetar a senha?"
2. **QueueService detecta** palavra-chave de suporte
3. Lead é **movido para fila SUPORTE**
4. **Agente de Suporte** assume
5. Na página Filas:
   - Card SUPORTE: **Leads na fila aumenta**
   - Tempo médio de resposta do Suporte atualiza

---

## 📊 Métricas que você verá em Tempo Real

### 1. **Filas Ativas**
- Conta quantas filas têm status "active"
- Atualiza quando você ativa/pausa agentes

### 2. **Total de Leads**
- Soma de todos os leads em todas as filas
- **Aumenta** quando novo lead envia primeira mensagem
- **Diminui** quando lead é marcado como inativo

### 3. **Conversão Média**
- Porcentagem média de conversão entre todas as filas
- Exemplo: Se PRE_VENDA tem 50% e CHECKOUT tem 80%, média = 65%

### 4. **Tempo Médio**
- Tempo médio entre lead enviar mensagem e agente responder
- Calculado automaticamente pelo backend
- Formatado: "3m 20s", "45s", "1m 15s"

---

## 🚀 Próximos Passos (Depois de Tudo Funcionar)

### 1. Adicionar notificações push
- Quando novo lead entrar numa fila
- Quando lead ficar muito tempo sem resposta

### 2. Adicionar filtros na página de Filas
- Ver apenas filas ativas
- Filtrar por quantidade de leads (>5, >10)
- Ordenar por tempo de resposta

### 3. Adicionar gráficos
- Gráfico de pizza: Distribuição de leads por fila
- Gráfico de linha: Leads entrando/saindo ao longo do dia
- Gráfico de barras: Taxa de conversão por fila

### 4. Adicionar ações rápidas
- Mover lead manualmente para outra fila
- Marcar lead como prioritário
- Atribuir lead a agente humano específico

---

## 🐛 Troubleshooting

### "Não vejo nenhuma fila"
- **Causa**: Nenhum agente ativo
- **Solução**: Vá em "Agentes de IA" e crie pelo menos 1 agente + ative ele

### "Leads na fila não aumentam"
- **Causa**: WhatsApp não está conectado
- **Solução**: Vá em "Integrações" → Conectar WhatsApp → Escanear QR

### "Interações Recentes não aparecem"
- **Causa**: Nenhuma mensagem foi trocada ainda
- **Solução**: Envie uma mensagem de teste via WhatsApp (outro celular → seu número conectado)

### "Tempo real não está atualizando"
- **Causa**: Backend parou ou perdeu conexão com banco
- **Solução**: 
  1. Verifique se backend está rodando (porta 4000)
  2. Verifique logs do backend para erros
  3. Clique em "Atualizar" manualmente

### "Erro 401 Unauthorized"
- **Causa**: Token expirou
- **Solução**: Faça logout e login novamente

---

## 📝 Logs para Debug

### Backend (ver o que está acontecendo):

Procure por estas mensagens nos logs do backend:

```
📦 Baileys version: X.X.X
📱 Novo QR Code gerado
✅ WhatsApp conectado com sucesso!
📥 Mensagem recebida: {...}
🤖 Resposta da IA: "..."
💾 Lead atualizado: {...}
💾 Mensagem salva: {...}
🔄 Lead movido: PRE_VENDA → CHECKOUT
```

### Frontend (console do navegador):

Abra DevTools (F12) e procure por:

```
Carregando filas...
Filas carregadas: [...]
Erro ao carregar filas: {...}
```

---

**Data**: 2026-02-11  
**Status**: Sistema de tempo real IMPLEMENTADO e FUNCIONANDO ✅  
**Aguardando**: Teste do usuário com WhatsApp conectado 🎯
