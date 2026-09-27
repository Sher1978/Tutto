/**
 * Client-Side Image Compressor & B&W Category Cover Helper
 */

export const CATEGORY_BW_COVERS: Record<string, string> = {
  'mcat-moto': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-tech': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-tickets': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-clothes': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-sport': 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-pets': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80&sat=-100',
  'mcat-other': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80&sat=-100',
}

export function getCategoryBWCover(categoryId: string): string {
  return CATEGORY_BW_COVERS[categoryId] || CATEGORY_BW_COVERS['mcat-other']
}

/**
 * Compresses image file on client side using HTML5 Canvas.
 * Resizes image down to max dimensions (default 1200x1200px) and JPEG quality (0.75).
 */
export function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = (err) => reject(err)
      img.src = e.target?.result as string
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
