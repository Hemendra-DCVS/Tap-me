// telegramBot.js
const TelegramBot = require('node-telegram-bot-api');
const token = '7235697142:AAEgdWzf7jNVC9gzF8utN8Q_rQcJCIlu6bM';  
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Send a message or a start command to the user
  bot.sendMessage(chatId, 'Welcome to TapMe Clicker Game! Click the button below to start tapping.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Tap Me!', callback_data: 'tap_me' }]
      ]
    }
  });
});

// Export bot instance if needed elsewhere
module.exports = bot;
