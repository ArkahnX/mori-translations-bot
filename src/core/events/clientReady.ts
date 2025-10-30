import { client } from '../'
// import { config } from '../../config'
import { debug, log } from '../../helpers'
import { clearOldData, clearOldBotData } from '../db/functions'
import { isMainThread } from 'worker_threads'
import { ActivityType } from 'discord.js'
import { loadAllEmoji } from '../../helpers/discord'

export async function clientReady() {
  log(`${client.user!.tag} serving ${client.guilds.cache.size} servers.`)
  client.user!.setActivity(`Streaming Translations right to your doorstep`, { type: ActivityType.Playing })
  if (isMainThread) {
    loadAllEmoji(client);
    debug('community notifier...')
    import('../../modules/community/communityNotifier')
    debug('youtube notifier..')
    import('../../modules/youtubeNotifier')
    debug('chatrelayer')
    import('../../modules/livechat/chatRelayer')

    // setInterval(clearOldData, 24 * 60 * 60 * 100)
    clearOldData()
    clearOldBotData()
  }
}
