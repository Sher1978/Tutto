-- ============================================================
-- SUPABASE STORAGE 30-DAY RETENTION & AUTO-CLEANUP SCRIPT
-- ============================================================
-- Выполните этот SQL скрипт в Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Создание публичного бакета 'user-uploads' для фото пользователей (заявки, товары маркета, аватары)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  10485760, -- 10 MB макс размер одного файла
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 2. RLS Политика: Публичный доступ к просмотру всех фото
CREATE POLICY "Public Read User Uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- 3. RLS Политика: Разрешить загрузку всем авторизованным и анонимным пользователям
CREATE POLICY "Public Insert User Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-uploads');

-- 4. Функция автоудаления медиафайлов старше 30 дней (30-day retention)
CREATE OR REPLACE FUNCTION delete_old_user_uploads_30_days()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Удаляем записи медиафайлов старше 30 дней из стораджа Supabase
  DELETE FROM storage.objects
  WHERE bucket_id = 'user-uploads'
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 5. Автоматический запуск ежедневно через pg_cron (каждую ночь в 03:00 UTC)
-- Note: Если плагин pg_cron включен в Supabase Database Extensions
SELECT cron.schedule(
  'auto-purge-user-uploads-30-days',
  '0 3 * * *',
  $$ SELECT delete_old_user_uploads_30_days(); $$
);
