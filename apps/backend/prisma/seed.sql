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

-- Dados de exemplo para testar o sistema
INSERT INTO "Lead" (id, name, email, phone, status, "currentQueue", source, "isActive", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'João Silva', 'joao@teste.com', '+5511987654321', 'lead', 'PRE_VENDA', 'whatsapp', true, NOW(), NOW()),
(gen_random_uuid(), 'Maria Santos', 'maria@teste.com', '+5511987654322', 'pre_venda', 'PRE_VENDA', 'instagram', true, NOW(), NOW()),
(gen_random_uuid(), 'Pedro Costa', 'pedro@teste.com', '+5511987654323', 'aluno_ativo', 'POS_VENDA', 'facebook', true, NOW(), NOW()),
(gen_random_uuid(), 'Ana Paula', 'ana@teste.com', '+5511987654324', 'aluno_ativo', 'SUPORTE', 'whatsapp', true, NOW(), NOW()),
(gen_random_uuid(), 'Carlos Lima', 'carlos@teste.com', '+5511987654325', 'suporte', 'SUPORTE', 'instagram', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
