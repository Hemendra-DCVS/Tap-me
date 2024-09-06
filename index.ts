import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import http from 'http';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
      const { data, error } = await supabase
        .from('users')
        .upsert({ telegram_id: telegramId, coins })
        .single();
      return data;
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const yoga = createYoga({ schema });

// Use the port provided by the environment variable, default to 4000 if not set
const PORT = process.env.PORT || 4000;

// Use Node.js built-in HTTP server
const server = http.createServer(yoga);

// Start the server on the specified port
server.listen(PORT, () => {
  console.log(`GraphQL Yoga server is running on http://localhost:${PORT}`);
});
