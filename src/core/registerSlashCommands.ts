const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9');
import { loadAllCommands } from '../helpers/discord/loaders'
import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../../.env' })

const commands = loadAllCommands()

const clientId = process.env.DISCORD_CLIENT_ID

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)

;(async () => {
  try {
    const { log } = console
    log('Started refreshing application (/) commands.')
    const body = [...commands.map((v, k) => {
      log(`jsonning ${k}`)
      return v.slash.toJSON()
    }).toList().toArray()]

    log(body)
    log('====================')
    await rest.put(Routes.applicationCommands(clientId), { body })

    log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
