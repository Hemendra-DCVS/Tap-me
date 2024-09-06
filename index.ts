import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import http from 'http';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

// GraphQL schema
const typeDefs = fs.readFileSync('./schema.graphql', 'utf-8');
const resolvers = {
  Query: {
    getUser: async (_: any, { telegramId }: { telegramId: string }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();
      return data || null;
    },
  },
  Mutation: {
    addCoins: async (_: any, { telegramId, coins }: { telegramId: string, coins: number }) => {
      console.log("Adding coins for:", telegramId, "Coins:", coins);
      const { data, error } = await supabase
        .from('users')
        .upsert({ telegram_id: telegramId, coins })
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error("Error adding coins");
      }

      console.log("Added coins:", data);
      return data;
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const yoga = createYoga({ schema });

// Initialize the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
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

  if (data === 'tap_me' && chatId) {
    // Handle tap action
    // You may want to update user coins here and send a response
    // Example: Updating user coins and sending the updated balance
    const userId = String(chatId); // Assuming chatId is used as userId
    const { data: userData } = await supabase
      .from('users')
      .upsert({ telegram_id: userId, coins: 1 })
      .single();

    if (userData) {
      bot.sendMessage(chatId, `You have ${userData.coins} coins.`);
    }
  }
});

// Use the port provided by the environment variable, default to 4000 if not set
const PORT = process.env.PORT || 4000;

// Use Node.js built-in HTTP server
const server = http.createServer(yoga);

// Start the server on the specified port
server.listen(PORT, () => {
  console.log(`GraphQL Yoga server is running on http://localhost:${PORT}`);
});
