import { GoogleGenerativeAI } from '@google/generative-ai'

// В продакшене это должно быть в Edge Function, чтобы не светить ключ!
// Для прототипирования используем прямо из фронтенда.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export interface ParsedRequest {
  title: string
  categoryName: string
  budget: number
  description: string
  district?: string
  hub?: string
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SmartAIResponse {
  status: 'clarify' | 'complete'
  question?: string
  requestParams?: ParsedRequest
}

export async function analyzeRequestFlowWithAI(
  conversation: { role: 'user' | 'model', text: string }[],
  currentHub: string,
  currentDistrict: string,
  maxRetries = 3
): Promise<SmartAIResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const conversationText = conversation.map(c => `${c.role === 'user' ? 'Пользователь' : 'ИИ'}: ${c.text}`).join('\n')

  const prompt = `
Ты - ИИ-ассистент платформы обратных аукционов (маркетплейс услуг TuttoMinutto). 
Твоя задача - помочь пользователю составить заявку (карточку) на услугу.
Чтобы карточка получилась качественной, тебе нужны основные параметры (что именно, когда, бюджет, локация).

История общения:
${conversationText}

Текущая локация по GPS: Хаб ${currentHub}, Район ${currentDistrict}.

Правила:
1. Проанализируй весь диалог.
2. Если информации недостаточно (например, пользователь просто сказал "нужен байк", но не сказал на какой срок или бюджет), ты должен ВЕЖЛИВО задать ОДИН уточняющий вопрос. Верни status: "clarify" и твой question.
3. Если информации достаточно (понятно что, когда, и есть примерный бюджет или понятно, что бюджет "по договоренности"), верни status: "complete" и заполни requestParams.

Верни СТРОГО только JSON следующего формата:
Для уточнения:
{
  "status": "clarify",
  "question": "На какие даты вам нужен байк и какой примерно бюджет?"
}

Для завершения:
{
  "status": "complete",
  "requestParams": {
    "title": "Краткое название с интентом (например: ИЩУ няню для девочки 5 лет)",
    "categoryName": "ОДНА_ИЗ_КАТЕГОРИЙ: ПРОКАТ, ЖИЛЬЁ, ДЕНЬГИ, УСЛУГИ, ЕДА, КЛИНИНГ, КРАСОТА, ДЕТИ, ТУРЫ, ВРАЧИ, КУРЬЕР, ИВЕНТЫ, ПРАКТИКИ, ДРУГОЕ",
    "budget": 300,
    "description": "Полное красивое описание на основе диалога, с эмодзи",
    "district": "район (из диалога или текущий)"
  }
}
`

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!apiKey) {
        throw new Error('No API key provided, using intelligent fallback')
      }
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      return parsed as SmartAIResponse
    } catch (error: any) {
      console.warn(`Gemini API Warning (Attempt ${attempt}):`, error)
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota')
      if (attempt < maxRetries && (isRateLimit || error?.message?.includes('503') || error?.message?.includes('fetch failed'))) {
        await delay(1000)
        continue
      }
      if (attempt === maxRetries || !apiKey) {
        // Intelligent client-side fallback parsing user messages
        const userMsgs = conversation.filter(c => c.role === 'user').map(c => c.text).join(' ')
        const userText = userMsgs.trim() || 'Запрос на услугу'
        
        let titleIntent = 'ИЩУ ' + (userText.length > 35 ? userText.slice(0, 35) + '...' : userText)
        if (userText.toLowerCase().includes('нян')) titleIntent = `ИЩУ няню: ${userText.slice(0, 30)}`
        else if (userText.toLowerCase().includes('дом') || userText.toLowerCase().includes('вилл') || userText.toLowerCase().includes('жиль')) titleIntent = `СНИМУ жильё: ${userText.slice(0, 30)}`
        else if (userText.toLowerCase().includes('usdt') || userText.toLowerCase().includes('бат') || userText.toLowerCase().includes('обмен')) titleIntent = `ОБМЕНЯЮ валюту: ${userText.slice(0, 30)}`
        else if (userText.toLowerCase().includes('байк') || userText.toLowerCase().includes('скутер') || userText.toLowerCase().includes('авто')) titleIntent = `СНИМУ В АРЕНДУ: ${userText.slice(0, 30)}`

        return {
          status: 'complete',
          requestParams: {
            title: titleIntent,
            categoryName: 'УСЛУГИ',
            budget: 0,
            description: userText,
            district: currentDistrict,
            hub: currentHub
          }
        }
      }
    }
  }

  throw new Error('Failed to analyze request')
}
