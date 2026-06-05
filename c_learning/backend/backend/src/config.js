import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env')

dotenv.config({ path: envPath })

const parseCorsOrigins = value => {
  return String(value || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

export const config = {
  port: Number(process.env.PORT || 8101),
  host: process.env.HOST || '0.0.0.0',
  db: {
    host: '101.43.95.248',
    port: 13037,
    user: 'root',
    password: 'aPTgM8WK#Ur5am%F',
    database: process.env.DB_NAME || 'c_teaching',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+08:00',
  },
  jwtSecret: process.env.JWT_SECRET || 'c-teaching-local-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'),
  ai: {
    provider: 'chatanywhere',
    apiKey: process.env.CHATANYWHERE_API_KEY || '',
    baseUrl: process.env.CHATANYWHERE_BASE_URL || 'https://api.chatanywhere.tech/v1',
    model: process.env.CHATANYWHERE_MODEL || '',
  },
}
