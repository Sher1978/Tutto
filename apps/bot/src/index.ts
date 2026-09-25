import { Bot, InlineKeyboard } from 'grammy'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const botToken = process.env.TELEGRAM_BOT_TOKEN || '8859291375:AAFWh7FXsDHMplqHPpW293DQLcsn9HfrNNU'
const appUrl = process.env.VITE_APP_URL || 'https://needtnow.vercel.app'

export const bot = new Bot(botToken)

// Command /start
bot.command('start', async (ctx) => {
  const startParam = ctx.match
  const userName = ctx.from?.first_name || 'Пользователь'

  let welcomeText = `👋 *Добро пожаловать в TuttoMinutto, ${userName}!*\n`
  welcomeText += `_«Здесь выбираешь ты!»_\n\n`
  welcomeText += `*TuttoMinutto* — это локальный обратный аукцион услуг в курортных хабах (Пхукет, Бали, Бангкок, Вьетнам, Сеул, Токио).\n\n`
  welcomeText += `💡 *Как это работает:*\n`
  welcomeText += `1. Вы создаете запрос и указываете желаемые условия (или «Жду предложений»).\n`
  welcomeText += `2. Проверенные исполнители и *AI Sales Agent* делают встречные офферы за 1 минуту.\n`
  welcomeText += `3. Вы выбираете лучший отклик и связываетесь напрямую в чате Telegram.\n\n`

  if (startParam) {
    welcomeText += `🎁 *Вы пришли по ссылке заказа:* \`${startParam}\`\n\n`
  }

  const keyboard = new InlineKeyboard()
    .webApp('🚀 Открыть TuttoMinutto App', appUrl)
    .row()
    .url('💬 Поддержка & Вопросы', 'https://t.me/tuttominutto_bot')

  await ctx.reply(welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  })
})

// Command /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    `ℹ️ *Справка TuttoMinutto*\n\n` +
    `_Здесь выбираешь ты!_\n\n` +
    `• /start — Перезапустить бота и открыть Mini App\n` +
    `• Нажмите кнопку «Открыть TuttoMinutto App» для просмотра аукционов\n` +
    `• Вся связь между клиентом и исполнителем происходит напрямую.\n\n` +
    `Юзернейм бота: @tuttominutto_bot`,
    { parse_mode: 'Markdown' }
  )
})

/**
 * Push notification sent to Client when a provider or AI Agent submits a bid
 */
export async function notifyClientNewBid(
  clientTelegramId: number,
  requestTitle: string,
  bidPrice: number,
  providerName: string,
  requestId: string,
  isAI: boolean = false
): Promise<void> {
  const emoji = isAI ? '🤖' : '💬'
  const deepLink = `${appUrl}?startapp=request_${requestId}`

  try {
    await bot.api.sendMessage(
      clientTelegramId,
      `${emoji} <b>Новое предложение на ваш запрос!</b>\n\n` +
      `📋 <i>${requestTitle}</i>\n` +
      `👤 ${providerName}: <b>$${bidPrice}</b>\n\n` +
      `Нажмите ниже, чтобы посмотреть все предложения 👇`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '👀 Смотреть предложения в App', web_app: { url: deepLink } }
          ]]
        }
      }
    )
  } catch (err) {
    console.error(`[Telegram Bot] Failed to send push notification to user ${clientTelegramId}:`, err)
  }
}

/**
 * Push notification sent to Providers when a new request is created in their hub
 */
export async function notifyProviderNewRequest(
  providerTelegramId: number,
  requestTitle: string,
  district: string,
  budget: number | null,
  requestId: string
): Promise<void> {
  const budgetText = budget ? `$${budget}` : 'Жду предложений'
  const deepLink = `${appUrl}?startapp=request_${requestId}`

  try {
    await bot.api.sendMessage(
      providerTelegramId,
      `📣 <b>Новый запрос в вашем хабе!</b>\n\n` +
      `📍 Район: <b>${district}</b>\n` +
      `📋 Запрос: ${requestTitle}\n` +
      `💰 Бюджет: <b>${budgetText}</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✍️ Сделать отклик', web_app: { url: deepLink } }
          ]]
        }
      }
    )
  } catch (err) {
    console.error(`[Telegram Bot] Failed to notify provider ${providerTelegramId}:`, err)
  }
}

bot.start({
  onStart: (botInfo) => {
    console.log(`🤖 Telegram Bot @${botInfo.username} (TuttoMinutto) успешно запущен!`)
  },
})
