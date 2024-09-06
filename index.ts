const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const token = process.env.TELEGRAM_BOT_TOKEN;  
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl, supabaseKey);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; // Use Telegram user ID

  // Send a message or a start command to the user
  bot.sendMessage(chatId, 'Welcome to TapMe Clicker Game! Click the button below to start tapping.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Tap Me!', callback_data: 'tap_me' }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  const data = query.data;
  const userId = query.from.id; // Use Telegram user ID

  if (data === 'tap_me' && chatId) {
    // Handle tap action
    // Update user coins and send a response
    const { data: userData, error } = await supabase
      .from('users')
      .upsert({ telegram_id: userId, coins: (await getUserCoins(userId)) + 1 })
      .single();

    if (error) {
      console.error("Supabase error:", error);
      bot.sendMessage(chatId, 'Error updating coins.');
      return;
    }

    if (userData) {
      bot.sendMessage(chatId, `You have ${userData.coins} coins.`);
    }
  }
});

// Helper function to get the current coin balance
async function getUserCoins(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('coins')
    .eq('telegram_id', userId)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return 0;
  }

  return data?.coins || 0;
}
