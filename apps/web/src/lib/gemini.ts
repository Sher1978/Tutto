/**
 * Google Gemini API Client for TuttoMinutto AI Sales Consultant & Assistant
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

/**
 * Ask Google Gemini API for an instant consulting response
 */
export async function askGeminiConsultant(promptText: string, contextHistory: GeminiMessage[] = []): Promise<string> {
  if (!GEMINI_API_KEY) {
    return 'Укажите GEMINI_API_KEY в файле .env для включения ответов ИИ-консультанта Gemini.'
  }

  const systemInstruction = 
    `Вы — вежливый, дружелюбный и экспертный ИИ-консультант сервиса обратного аукциона TuttoMinutto ("Здесь выбираешь ты!"). ` +
    `Помогайте экспатам и туристам в курортных хабах (Пхукет, Бали, Бангкок, Вьетнам, Сеул, Токио) находить лучшие услуги: прокат байков/авто, жильё, обмен валют, визаран, клининг, гидов. ` +
    `Пишите кратко, тепло, без клише, обращайтесь к пользователю напрямую ("вы"/"ты").`

  const contents = [
    ...contextHistory,
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nЗапрос пользователя: ${promptText}` }],
    },
  ]

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn('[Gemini API Warning]', errText)
      return `Заявка принята! ИИ-менеджер обработал ваш запрос в хабе. Ожидайте первые предложения от исполнителей в течение 1 минуты!`
    }

    const data = await response.json()
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return candidateText || 'ИИ-консультант Gemini сформировал ответ по вашему заказу!'
  } catch (error) {
    console.error('[Gemini API Error]', error)
    return `Заявка принята! ИИ-менеджер обработал ваш запрос в хабе. Ожидайте первые предложения от исполнителей в течение 1 минуты!`
  }
}
