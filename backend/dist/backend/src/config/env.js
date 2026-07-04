"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load .env file from backend directory
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().url().default('postgresql://postgres:postgres@localhost:5432/bizgrowth?schema=public'),
    JWT_SECRET: zod_1.z.string().min(8).default('supersecretjwtaccesskey123456!'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(8).default('supersecretjwtrefreshkey123456!'),
    ACCESS_TOKEN_EXPIRY: zod_1.z.string().default('15m'),
    REFRESH_TOKEN_EXPIRY: zod_1.z.string().default('7d'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
