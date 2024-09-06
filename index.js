"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_yoga_1 = require("graphql-yoga");
const schema_1 = require("@graphql-tools/schema");
const supabase_js_1 = require("@supabase/supabase-js");
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const typeDefs = fs_1.default.readFileSync('./schema.graphql', 'utf-8');
const resolvers = {
    Query: {
        getUser: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { telegramId }) {
            const { data, error } = yield supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();
            return data || null;
        }),
    },
    Mutation: {
        addCoins: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { telegramId, coins }) {
            const { data, error } = yield supabase
                .from('users')
                .upsert({ telegram_id: telegramId, coins })
                .single();
            return data;
        }),
    },
};
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers });
const yoga = (0, graphql_yoga_1.createYoga)({ schema });
// Use Node.js built-in HTTP server
const server = http_1.default.createServer(yoga);
// Start the server on port 4000 (or any port you prefer)
server.listen(4000, () => {
    console.log('GraphQL Yoga server is running on http://localhost:4000');
});
