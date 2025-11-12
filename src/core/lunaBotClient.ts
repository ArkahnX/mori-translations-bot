import { Client, GatewayIntentBits } from 'discord.js'
import { Command, loadAllCommands, loadAllEvents } from '../helpers/discord'
import { isMainThread } from 'worker_threads'
import { Map } from 'immutable'

export const commands: Map<string, Command> = isMainThread ? loadAllCommands() : Map()

export const client = new Client({
  intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  rest: {
    retries: 5,
    timeout: 30000,
  },
})

if (isMainThread) {
  loadAllEvents().forEach((callback, evtName) => client.on(evtName, callback))
}
