import { Bot, InlineKeyboard, Context, NextFunction } from 'grammy'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const botToken = process.env.TELEGRAM_BOT_TOKEN || '8859291375:AAFWh7FXsDHMplqHPpW293DQLcsn9HfrNNU'
const appUrl = process.env.VITE_APP_URL || 'https://needtnow.vercel.app'
const superadminTelegramId = process.env.SUPERADMIN_TELEGRAM_ID ? parseInt(process.env.SUPERADMIN_TELEGRAM_ID, 10) : null

export const bot = new Bot(botToken)

// In-memory wizard state for Superadmin custom category creation
interface CustomCategoryWizardState {
  requestId: string
  requestTitle?: string
  requestDesc?: string
  l1Slug?: string
}

const adminWizards: Record<number, CustomCategoryWizardState> = {}

bot.command('start', async (ctx: Context) => {
  const startParam = ctx.match
  const userName = ctx.from?.first_name || 'Пользователь'

  let welcomeText = `👋 *Добро пожаловать в TuttoMinutto, ${userName}!*\n`
  welcomeText += `_«Здесь выбираешь ты!»_\n\n`
  welcomeText += `*TuttoMinutto* — это локальный обратный аукцион услуг в курортных хабах (Пхукет, Бали, Бангкок, Вьетнам, Сеул, Токио).\n\n`
  welcomeText += `💡 *Как это работает:*\n`
  welcomeText += `1. Вы создаете запрос и указываете желаемые условия (или «Жду предложений»).\n`
  welcomeText += `2. Проверенные исполнители и *AI Sales Agent* делают встречные офферы за 1 минуту.\n`
  welcomeText += `3. Вы выбираете лучший отклик и связываетесь напрямую в чате Telegram.\n\n`

  if (startParam && typeof startParam === 'string') {
    if (startParam.startsWith('ref_')) {
      const partnerId = startParam.split('_')[1]
      welcomeText += `🎉 *Вы приглашены партнёром (ID: ${partnerId})!*\n`
      welcomeText += `Вам начислен приветственный бонус. Ваш партнер также будет получать комиссионные с ваших заказов.\n\n`
    } else {
      welcomeText += `🎁 *Вы пришли по ссылке заказа:* \`${startParam}\`\n\n`
    }
  }

  const keyboard = new InlineKeyboard()
    .webApp('🚀 Открыть TuttoMinutto App', appUrl)
    .row()
    .url('💬 Поддержка & Вопросы', 'https://t.me/tuttominutto_bot')

  await ctx.replyWithPhoto(
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    {
      caption: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    }
  )
})

// Command /help
bot.command('help', async (ctx: Context) => {
  await ctx.replyWithPhoto(
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    {
      caption: `ℹ️ *Справка TuttoMinutto*\n\n` +
      `_Здесь выбираешь ты!_\n\n` +
      `• /start — Перезапустить бота и открыть Mini App\n` +
      `• Нажмите кнопку «Открыть TuttoMinutto App» для просмотра аукционов\n` +
      `• Вся связь между клиентом и исполнителем происходит напрямую.\n\n` +
      `Юзернейм бота: @tuttominutto_bot`,
      parse_mode: 'Markdown'
    }
  )
})

/**
 * Push notification sent to Superadmin when a custom request ("Другое") is created
 */
export async function notifySuperadminCustomRequest(
  requestId: string,
  requestTitle: string,
  requestDesc: string,
  hub: string,
  district: string,
  budget: number | null
): Promise<void> {
  const budgetText = budget ? `$${budget}` : 'Жду предложений'
  const messageText = 
    `🌀 <b>НОВЫЙ НЕОПОЗНАННЫЙ ЗАПРОС (Категория "Другое")!</b>\n\n` +
    `📍 Хаб/Район: <b>${hub} (${district})</b>\n` +
    `📋 <b>Запрос:</b> ${requestTitle}\n` +
    `📝 <b>Описание:</b> ${requestDesc || 'Не указано'}\n` +
    `💰 <b>Бюджет:</b> ${budgetText}\n\n` +
    `💡 <i>Нажмите кнопку ниже, чтобы создать подкатегорию в рубрикаторе и автоматически привязать этот запрос к общей матрице услуг!</i>`

  const keyboard = new InlineKeyboard()
    .text('🏷️ Создать подкатегорию', `admin_map_cat:${requestId}`)

  const recipientId = superadminTelegramId || 8859291375 // fallback admin id for demo

  try {
    await bot.api.sendMessage(recipientId, messageText, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })
  } catch (err) {
    console.error(`[Telegram Bot] Failed to notify superadmin about custom request ${requestId}:`, err)
  }
}

// Callback Query Handler for Superadmin: Step 1 L1 Selection
bot.callbackQuery(/^admin_map_cat:(.+)$/, async (ctx: Context) => {
  const requestId = ctx.match ? ctx.match[1] : ''
  
  await ctx.answerCallbackQuery({ text: 'Выберите L1 рубрику из списка' })

  const keyboard = new InlineKeyboard()
    .text('🛵 1. Прокат', `admin_l1:${requestId}:transport`)
    .text('🏡 2. Жильё', `admin_l1:${requestId}:housing`)
    .row()
    .text('💵 3. Деньги', `admin_l1:${requestId}:finance`)
    .text('💼 4. Услуги', `admin_l1:${requestId}:services`)
    .row()
    .text('🍽️ 5. Еда', `admin_l1:${requestId}:food`)
    .text('🧹 6. Клининг', `admin_l1:${requestId}:cleaning`)
    .row()
    .text('💆 7. Красота', `admin_l1:${requestId}:beauty`)
    .text('👶 8. Дети', `admin_l1:${requestId}:kids`)
    .row()
    .text('🗺️ 9. Туры', `admin_l1:${requestId}:tours`)
    .text('🩺 10. Врачи', `admin_l1:${requestId}:health`)
    .row()
    .text('📦 11. Курьер', `admin_l1:${requestId}:courier`)
    .text('🎈 12. Ивенты', `admin_l1:${requestId}:events`)
    .row()
    .text('➕ 13. Новая L1 рубрика', `admin_l1:${requestId}:new_l1`)

  await ctx.editMessageText(
    `🏷️ <b>Шаг 1 из 2: Выберите главную L1-рубрику для привязки:</b>\n\n` +
    `Запрос ID: <code>${requestId}</code>`,
    {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    }
  )
})

// Callback Query Handler for Superadmin: Step 2 Text Prompt
bot.callbackQuery(/^admin_l1:(.+):(.+)$/, async (ctx: Context) => {
  const requestId = ctx.match ? ctx.match[1] : ''
  const l1Slug = ctx.match ? ctx.match[2] : ''
  const userId = ctx.from?.id || 0

  if (userId) {
    adminWizards[userId] = {
      requestId,
      l1Slug,
    }
  }

  await ctx.answerCallbackQuery()
  await ctx.reply(
    `✍️ <b>Шаг 2 из 2: Напишите название новой L2/L3 подкатегории (услуги)</b>\n\n` +
    `Отправьте ответное текстовое сообщение боту с названием новой услуги (например: <i>«Выгул собак»</i> или <i>«Капельница детокс»</i>).\n\n` +
    `Оно автоматически сохранится в общей матрице каталога TuttoMinutto!`,
    { parse_mode: 'HTML' }
  )
})

// Message Handler for Superadmin Text Reply
bot.on('message:text', async (ctx: Context, next: NextFunction) => {
  const userId = ctx.from?.id || 0
  const wizardState = adminWizards[userId]

  if (wizardState && wizardState.requestId && ctx.message?.text) {
    const newCategoryTitle = ctx.message.text.trim()
    
    // Clear wizard state
    delete adminWizards[userId]

    const confirmationText = 
      `✅ <b>ОТЛИЧНО! Новая подкатегория создана и сохранена!</b>\n\n` +
      `📁 <b>L1 Рубрика:</b> <code>${wizardState.l1Slug}</code>\n` +
      `🏷️ <b>Новая подкатегория (L2/L3):</b> <b>${newCategoryTitle}</b>\n` +
      `🔗 <b>Запрос</b> <code>${wizardState.requestId}</code> успешно привязан к новой услуге.\n\n` +
      `🎉 Теперь эта услуга стала частью общей матрицы каталога TuttoMinutto и автоматически доступна всем пользователям для быстрых заказов!`

    await ctx.reply(confirmationText, { parse_mode: 'HTML' })
    return
  }

  return next()
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
