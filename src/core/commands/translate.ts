import { Command, emoji, getEmoji } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { ChatInputCommandInteraction } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/functions'
import { notificationCommand } from '../../helpers/discord/slash'

export const translate: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description: oneLine`
      Start or stop relaying a streamer's translations in the current Discord channel.
    `,
  },
  slash: notificationCommand({ name: 'translate', subject: 'start of TL relays' }),
  callback: (intr: ChatInputCommandInteraction): void => {
    const streamer = intr.options.getString('channel')!

    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear' | 'viewcurrent',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'translate',
      add: {
        success: `${getEmoji("speech_balloon")} Relaying TLs for`,
        failure: `
           ${getEmoji("warning")} ${streamer} is already being relayed in this channel
        `,
      },
      remove: {
        success: `${getEmoji("speech_balloon")} Stopped relaying TLs for`,
        failure: oneLine`
          ${getEmoji("warning")} ${streamer}'s translations weren't already being relayed
          in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
