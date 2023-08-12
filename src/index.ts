/**
 * LUNA'S TRANSLATIONS DISCORD BOT
 */
Error.stackTraceLimit = Infinity
import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' })
import { config } from './config'
import { client } from './core/'
import mongoose from 'mongoose'
import { debug } from './helpers'
import { codeBlock, roleMention } from 'discord.js'

const MONGODB_URL = process.env.MONGODB_URL ?? 'mongodb://db/luna'

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

process.on('uncaughtException', function (err) {
  debug('Uncaught exception: ' + err)
  client.guilds.cache.find((g) => g.id === '')
  if (process.env.DISCORD_ERROR_CHANNEL_ID) {
    const ch = client.channels.cache.get(process.env.DISCORD_ERROR_CHANNEL_ID)
    if(ch && ch.isTextBased()) {
      if (process.env.DISCORD_ERROR_ROLE_ID) {
        ch.send(`${roleMention(process.env.DISCORD_ERROR_ROLE_ID)} UNCAUGHT EXCEPTION: ${codeBlock(JSON.stringify(err))}`)
      } else {
        ch.send(`UNCAUGHT EXCEPTION: ${codeBlock(JSON.stringify(err))}`)
      }
    }
  }

  debug(err.stack)
})

client.login(config.token)
