-- Script para LIMPAR BANCO DE DADOS - Conta Zerada
-- Execute este script no Railway para começar com sistema 100% limpo

-- 1. Limpar todas as mensagens
DELETE FROM messages;

-- 2. Limpar todas as vendas
DELETE FROM sales;

-- 3. Limpar tickets
DELETE FROM tickets;

-- 4. Limpar histórico de filas
DELETE FROM queue_history;

-- 5. Limpar atividades
DELETE FROM activities;

-- 6. Limpar notas
DELETE FROM notes;

-- 7. Limpar relações de tags (mas manter as tags)
DELETE FROM lead_tags;

-- 8. Limpar leads (TODOS os leads de teste)
DELETE FROM leads;

-- 9. Limpar campanhas
DELETE FROM campaigns;

-- 10. Limpar anúncios
DELETE FROM ads;

-- 11. Limpar publicidades
DELETE FROM publicities;

-- 12. Limpar produtos (serão recriados automaticamente pelas vendas)
DELETE FROM products;

-- ============================================
-- MANTER APENAS:
-- - Usuário admin (para login)
-- - Tags padrão do sistema
-- ============================================

-- Criar tags padrão se não existirem
INSERT INTO tags (id, name, category, color, "isActive", "createdAt") VALUES
  (gen_random_uuid(), 'origem-whatsapp', 'origem', '#25D366', true, NOW()),
  (gen_random_uuid(), 'origem-instagram', 'origem', '#E4405F', true, NOW()),
  (gen_random_uuid(), 'origem-facebook-ads', 'origem', '#1877F2', true, NOW()),
  (gen_random_uuid(), 'origem-hotmart', 'origem', '#FF6600', true, NOW()),
  (gen_random_uuid(), 'origem-kiwify', 'origem', '#00B67A', true, NOW()),
  (gen_random_uuid(), 'cliente', 'status', '#10B981', true, NOW()),
  (gen_random_uuid(), 'objecao-preco', 'objecao', '#EF4444', true, NOW()),
  (gen_random_uuid(), 'objecao-tempo', 'objecao', '#F59E0B', true, NOW()),
  (gen_random_uuid(), 'interessado', 'intenção', '#3B82F6', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Resultado: Banco zerado, pronto para uso real!
SELECT 'Banco de dados limpo com sucesso! Sistema pronto para uso.' as resultado;

-- Verificar estado atual
SELECT 
  (SELECT COUNT(*) FROM leads) as leads_count,
  (SELECT COUNT(*) FROM messages) as messages_count,
  (SELECT COUNT(*) FROM sales) as sales_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM tags) as tags_count;
