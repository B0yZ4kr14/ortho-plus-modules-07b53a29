-- Inserir clínica demo (tenant isolation test)
INSERT INTO tenant_data.clinicas (id, nome, cnpj, plano, ativa) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Clínica Demo São Paulo', '12345678000195', 'enterprise', true);

-- Inserir usuários admin (senhas hasheadas com bcrypt)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'admin@clinicademo.com', '$2a$10$...', NOW());

-- Vincular usuário à clínica
INSERT INTO auth.user_clinicas (user_id, clinica_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin');

-- Dados demo: Pacientes (fictícios, LGPD-compliant)
INSERT INTO tenant_data.pacientes (id, clinica_id, nome, email, telefone, data_nascimento) VALUES 
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'João Silva Teste', 'joao.teste@emailficticio.com', '11999990001', '1985-03-15'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Maria Santos Teste', 'maria.teste@emailficticio.com', '11999990002', '1990-07-22');

-- Dados demo: Procedimentos odontológicos
INSERT INTO tenant_data.procedimentos (id, clinica_id, nome, codigo_odontologico, valor) VALUES 
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Limpeza Completa', '0101', 250.00),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Extração de Siso', '0302', 450.00);
