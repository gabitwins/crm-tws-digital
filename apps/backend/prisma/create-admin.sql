-- Criar usuário admin padrão
-- Senha: admin123 (hash bcrypt)

INSERT INTO "User" (
  id, 
  email, 
  password, 
  name, 
  role, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@nexo.com',
  '$2b$10$YourBcryptHashHere',
  'Administrador',
  'ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
