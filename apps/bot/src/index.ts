import { Bot, InlineKeyboard } from 'grammy'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const botToken = process.env.TELEGRAM_BOT_TOKEN || '8859291375:AAFWh7FXsDHMplqHPpW293DQLcsn9HfrNNU'
const appUrl = process.env.VITE_APP_URL || 'https://needtnow.vercel.app'

const bot = new Bot(botToken)

// Command /start
bot.command('start', async (ctx) => {
  const startParam = ctx.match // referral code if present
  const userName = ctx.from?.first_name || 'Пользователь'

  let welcomeText = `👋 *Добро пожаловать в NeedTnow, ${userName}!*\n\n`
  welcomeText += `NeedTnow — это локальный *обратный аукцион услуг* в курортных хабах ЮВА (Пхукет, Бали, Бангкок, Вьетнам).\n\n`
  welcomeText += `💡 *Как это работает:*\n`
  welcomeText += `1. Вы создаете запрос и указываете свою цену (или «Жду предложений»).\n`
  welcomeText += `2. Проверенные исполнители и *AI Sales Agent* делают встречные офферы.\n`
  welcomeText += `3. Вы выбираете лучший отклик и связываетесь напрямую в чате Telegram.\n\n`

  if (startParam) {
    welcomeText += `🎁 *Вы пришли по реферальной ссылке:* \`${startParam}\`\n\n`
  }

  const keyboard = new InlineKeyboard()
    .webApp('🚀 Открыть NeedTnow App', appUrl)
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
    `ℹ️ *Справка NeedTnow*\n\n` +
    `• /start — Перезапустить бота и открыть Mini App\n` +
    `• Нажмите кнопку «Открыть NeedTnow App» для просмотра аукционов\n` +
    `• Вся связь между клиентом и исполнителем происходит напрямую.\n\n` +
    `Юзернейм бота: @tuttominutto_bot`,
    { parse_mode: 'Markdown' }
  )
})

bot.start({
  onStart: (botInfo) => {
    console.log(`🤖 Telegram Bot @${botInfo.username} запущен и готов к работе!`)
  },
})
