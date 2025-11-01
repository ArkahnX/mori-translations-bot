declare namespace NodeJS {
  interface ProcessEnv {
    DISCORD_TOKEN: string
    DISCORD_CLIENT_ID: string
    DEEPL_KEY: string
    HOLODEX_API_KEY: string
    DiSCORD_BOT_OWNER_ID: string
    MONGODB_URL: string
    DISCORD_ERROR_CHANNEL_ID?: string
    DISCORD_ERROR_ROLE_ID?: string
    DISCORD_HONEYPOT_CHANNEL_ID?: string
  }
}
