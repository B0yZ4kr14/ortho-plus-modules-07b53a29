-- Criar bucket para avatars/fotos de perfil (público para facilitar acesso)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Adicionar coluna avatar_url na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Criar políticas de storage para o bucket avatars
CREATE POLICY "Avatars são acessíveis publicamente"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuários podem atualizar seus próprios avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuários podem deletar seus próprios avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);