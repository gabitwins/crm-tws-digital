# ❓ FAQ - WhatsApp no CRM NEXO

## 📱 WhatsApp Normal vs WhatsApp Business

### ✅ **FUNCIONA COM AMBOS!**

A integração do CRM NEXO usa **Baileys** (biblioteca não-oficial) que funciona tanto com:
- ✅ **WhatsApp Pessoal** (app verde normal)
- ✅ **WhatsApp Business** (app verde com "B")

**NÃO** há diferença ou restrição entre os dois tipos de conta.

---

## 🔌 Limitações de Dispositivos Conectados

### WhatsApp Normal (Pessoal)
- **Máximo**: 4 dispositivos vinculados simultaneamente
- Isso inclui: Web, Desktop, iPad e **este CRM**

### WhatsApp Business
- **Máximo**: 4 dispositivos vinculados simultaneamente
- Mesmas limitações do WhatsApp normal

---

## ⚠️ Erro: "Não é possível conectar novos dispositivos no momento"

### Causas Comuns:

#### 1. **Limite de dispositivos atingido** (4 máximo)
**Solução**:
1. No celular, vá em:
   - **Android**: WhatsApp → ⋮ (3 pontinhos) → Aparelhos conectados
   - **iPhone**: WhatsApp → Ajustes → Aparelhos conectados
2. Veja quantos dispositivos estão conectados
3. **Desconecte** algum dispositivo antigo que você não usa mais
4. Volte ao CRM e tente conectar novamente

#### 2. **Sessão corrompida no servidor**
Isso acontece quando:
- Você tentou conectar várias vezes seguidas
- Houve erro na última conexão
- Você escaneou o QR mas não finalizou a conexão

**Solução**:
1. No CRM, clique em **"Resetar WhatsApp (limpar sessão)"**
2. Aguarde 5 segundos
3. Clique em **"Conectar"** novamente
4. Escaneie o **novo** QR Code

#### 3. **WhatsApp do celular está desatualizado**
**Solução**:
1. Atualize o WhatsApp na Play Store (Android) ou App Store (iPhone)
2. Tente conectar novamente

---

## 🕐 Timeout: "A conexão demorou muito"

Se você vê essa mensagem, pode ser por:

### 1. **Internet lenta**
- Verifique sua conexão
- Tente novamente com internet mais estável

### 2. **Servidor do WhatsApp instável**
- Aguarde alguns minutos
- Tente conectar novamente

### 3. **Firewall bloqueando**
- Alguns antivírus/firewalls bloqueiam WebSocket (protocolo do WhatsApp)
- Desative temporariamente o antivírus e tente novamente

---

## 🔄 Fluxo de Conexão Normal

### 1. **Clique em "Conectar"**
- Sistema limpa sessão anterior automaticamente
- Leva ~5 segundos

### 2. **"Gerando QR Code..."**
- Sistema está conectando com servidores do WhatsApp
- Leva ~10 segundos
- Se passar de 60 segundos, timeout automático

### 3. **QR Code aparece na tela**
- Escaneie COM SEU CELULAR
- Seu WhatsApp deve estar **aberto**

### 4. **"WhatsApp conectado com sucesso!"**
- Pronto! Seu CRM agora recebe mensagens automaticamente
- Agentes de IA respondem sozinhos

---

## 🤖 Como Funcionam os Agentes de IA?

Após conectar o WhatsApp:

1. **Lead envia mensagem** → WhatsApp do CRM recebe
2. **Sistema identifica o lead** → Cria automaticamente se for novo
3. **Agente de IA analisa** → Qual fila? (Pré-Venda, Suporte, Pós-Venda)
4. **IA responde automaticamente** → Usando ChatGPT (modelo configurado)
5. **Lead responde** → Ciclo continua até conversão ou transferência para humano

---

## 🚨 Problemas Conhecidos e Soluções

### Problema: QR Code não aparece
**Solução**:
1. Verifique se o **backend está rodando** (porta 4000)
2. Verifique logs do backend (procure por "Baileys")
3. Clique em "Resetar WhatsApp"
4. Tente novamente

---

### Problema: QR Code aparece mas não conecta
**Solução**:
1. Certifique-se de que está escaneando com o **celular correto**
2. Verifique se o WhatsApp do celular está **atualizado**
3. Verifique se você tem **menos de 4 dispositivos conectados**
4. Tente desconectar outro dispositivo e escanear novamente

---

### Problema: Conecta mas depois desconecta sozinho
**Solução**:
1. Isso pode ser **instabilidade de internet**
2. Verifique se o servidor (backend) não está sendo reiniciado
3. Em produção, use **PM2** ou **Docker** para manter o processo ativo
4. Configure **keepAlive** no Baileys (já está configurado)

---

## 📋 Checklist de Conexão

Antes de conectar, verifique:

- [ ] Backend está rodando (porta 4000)
- [ ] Frontend está acessível (porta 3000)
- [ ] Banco de dados está conectado
- [ ] WhatsApp do celular está atualizado
- [ ] Você tem **menos de 4 dispositivos** vinculados
- [ ] Internet está estável (no servidor e no celular)
- [ ] Sessão anterior foi limpa (botão "Resetar" se necessário)

---

## 🆘 Suporte

Se nenhuma das soluções acima funcionar:

1. Verifique os **logs do backend** (sessão do terminal)
2. Procure por erros com palavra-chave: `Baileys`, `WhatsApp`, `QR`, `connection`
3. Anote o erro exato
4. Documente os passos que você seguiu
5. Entre em contato com suporte técnico

---

## 📚 Documentação Técnica

### Biblioteca usada: `@whiskeysockets/baileys`
- **Versão**: Última estável (atualizada automaticamente)
- **Tipo**: Não-oficial (não requer API oficial do WhatsApp Business)
- **Limitações**: 
  - Não envia templates de marketing
  - Não tem botões interativos oficiais
  - Funciona como WhatsApp Web

### Alternativa: WhatsApp Business API Oficial
Se você precisa de recursos avançados:
- **Templates aprovados pelo WhatsApp**
- **Botões interativos**
- **Lista de produtos**
- **Pagamentos in-app**

Entre em contato para migração para API oficial (requer aprovação do Meta).

---

**Data**: 2026-02-11  
**Status**: Funcional ✅  
**Tipo**: WhatsApp Normal + Business
