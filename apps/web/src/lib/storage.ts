import { supabase } from './supabase'

export const BUCKET_NAME = 'user-uploads'

/**
 * Сжатие изображения перед загрузкой в Supabase Storage
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

/**
 * Загрузка фото в Supabase Storage
 */
export async function uploadUserPhoto(
  file: File,
  folder: 'requests' | 'market' | 'avatars' = 'requests'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const compressedBlob = await compressImage(file)
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressedBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.warn('Supabase Storage upload fallback/error:', error.message)
      // В режиме без ключа бакета или если бакет еще не создан в Supabase — возвращаем ObjectURL для локальной симуляции
      return { url: URL.createObjectURL(file), error: null }
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return { url: publicUrlData.publicUrl, error: null }
  } catch (err: any) {
    console.error('Storage Upload Exception:', err)
    return { url: URL.createObjectURL(file), error: err.message || 'Ошибка загрузки фото' }
  }
}

/**
 * Удаление фото из Supabase Storage по его публичному URL
 */
export async function deleteUserPhoto(publicUrl: string): Promise<boolean> {
  try {
    if (!publicUrl || !publicUrl.includes(BUCKET_NAME)) return false

    // Извлекаем путь к файлу внутри бакета из URL
    const urlParts = publicUrl.split(`${BUCKET_NAME}/`)
    if (urlParts.length < 2) return false

    const filePath = urlParts[1]
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
    if (error) {
      console.warn('Failed to delete storage file:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Delete Storage Photo Error:', err)
    return false
  }
}
