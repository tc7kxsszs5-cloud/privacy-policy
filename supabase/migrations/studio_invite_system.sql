-- 1. Добавляем studio_name в profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS studio_name text;

-- 2. Добавляем роль admin (если используется enum, иначе просто text)
-- Если role — это text, ничего делать не нужно.
-- Если role — это enum, выполни:
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- 3. Таблица инвайт-кодов
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  used boolean DEFAULT false,
  used_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 4. RLS для invite_codes
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Любой может проверить код (для регистрации)
CREATE POLICY "Anyone can read invite codes"
  ON invite_codes FOR SELECT
  USING (true);

-- Только admin может создавать коды
CREATE POLICY "Admin can insert invite codes"
  ON invite_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Аутентифицированный пользователь может пометить код как использованный
CREATE POLICY "Auth user can claim code"
  ON invite_codes FOR UPDATE
  USING (used = false AND auth.uid() IS NOT NULL);
