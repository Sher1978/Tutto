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
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

  const conversationText = conversation.map(c => `${c.role === 'user' ? 'Пользователь' : 'ИИ'}: ${c.text}`).join('\n')

  const prompt = `
Ты - ИИ-ассистент платформы обратных аукционов (маркетплейс услуг). 
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
    "title": "Краткое название (до 40 симв)",
    "categoryName": "ОДНА_ИЗ_КАТЕГОРИЙ: ПРОКАТ, ЖИЛЬЁ, ДЕНЬГИ, УСЛУГИ, ЕДА, КЛИНИНГ, КРАСОТА, ДЕТИ, ТУРЫ, ВРАЧИ, КУРЬЕР, ИВЕНТЫ, ПРАКТИКИ, ДРУГОЕ",
    "budget": 300,
    "description": "Полное красивое описание на основе диалога, с эмодзи",
    "district": "район (из диалога или текущий)"
  }
}
`

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      return parsed as SmartAIResponse
    } catch (error: any) {
      console.error(`Gemini API Error (Attempt ${attempt}):`, error)
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota')
      if (attempt < maxRetries && (isRateLimit || error?.message?.includes('503') || error?.message?.includes('fetch failed'))) {
        await delay(attempt * 2000)
        continue
      }
      if (attempt === maxRetries) {
        // Fallback to complete
        return {
          status: 'complete',
          requestParams: {
            title: 'Заявка',
            categoryName: 'ДРУГОЕ',
            budget: 0,
            description: conversation[0]?.text || '',
            district: currentDistrict,
            hub: currentHub
          }
        }
      }
    }
  }

  throw new Error('Failed to analyze request')
}
