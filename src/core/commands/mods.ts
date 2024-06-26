import { toggleSetting } from '../db/functions'
import { CommandInteraction } from 'discord.js'
import { Command, emoji, getEmoji } from '../../helpers/discord'
import { SlashCommandBuilder } from '@discordjs/builders'

const description = 'Toggles the relaying of mod messages serverwide.'

export const mods: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description,
  },
  slash: new SlashCommandBuilder().setName('mods').setDescription(description),
  callback: (intr: CommandInteraction): void => {
    toggleSetting({
      intr,
      setting: 'modMessages',
      enable: `${getEmoji("tools")} I will now relay mod messages.`,
      disable: `
      ${getEmoji("tools")} I will no longer relay mod messages.
        (Channel owner and other Hololive members will still be relayed.)
      `,
    })
  },
}
