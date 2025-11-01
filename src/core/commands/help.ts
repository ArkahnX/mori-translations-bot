import { commands } from '../lunaBotClient'
import { getPermLevel, getSettings } from '../db/functions'
import { ChatInputCommandInteraction, EmbedField, GuildMember, inlineCode, SlashCommandBuilder } from 'discord.js'
import { Map, Set } from 'immutable'
import { GuildSettings, WatchFeatureSettings, WatchFeature } from '../db/models'
import { head, isEmpty } from 'ramda'
import { Command, createEmbed, emoji, getEmoji, reply } from '../../helpers/discord'
import { toTitleCase } from '../../helpers/language'
import { stripIndents } from 'common-tags'
import { config } from '../../config'

const description =
  'Displays available commands for your permission level in the requested category.'

export const help: Command = {
  config: {
    permLevel: 0,
  },
  help: {
    category: 'General',
    description,
  },
  slash: new SlashCommandBuilder()
    .setName('help')
    .setDescription(description)
    .addStringOption((option) => option.setName('category').setDescription('category')),
  callback: async (intr: ChatInputCommandInteraction) => {
    const askedCategory = intr.options.getString('category') ?? ''
    const commands = await getCommandsAtUserLevel(intr)
    const categories = getCategoriesOfCommands(commands)
    const helpToShow = categories.includes(toTitleCase(askedCategory))
      ? getCategoryHelp(toTitleCase(askedCategory))
      : getMainHelp(categories, getSettings(intr))

    reply(intr, helpToShow)
  },
}

///////////////////////////////////////////////////////////////////////////////

async function getCommandsAtUserLevel(intr: ChatInputCommandInteraction) {
  const authorLevel = await getPermLevel(intr.member as GuildMember)
  return commands.filter((x) => x.config.permLevel <= authorLevel.level)
}

function getCategoriesOfCommands(commands: Map<string, Command>): Set<string> {
  return commands
    .map((cmd) => cmd.help.category)
    .toSet()
    .filter((cat) => cat !== 'System')
}

function getCategoryHelp(category: string) {
  const fields = commands
    .filter((cmd) => cmd.help.category === category)
    .map((cmd, name) => ({
      name,
      value: cmd.help.description,
      inline: false,
    }))
    .toList() // discards keys
    .toArray()
    .sort((fa, fb) => fa.name.localeCompare(fb.name))

  return createEmbed({ fields })
}

function getMainHelp(categories: Set<string>, settings: GuildSettings) {
  const messages = [
    `${getEmoji('MoriRap')} Love, the me that's killing you ${getEmoji('MoriRap')}`,
    `${getEmoji('MoriRap')} ${inlineCode("Let's hit the sidewalk")} ${getEmoji('MoriRap')}`,
    `${getEmoji('MoriRap')} Red tomorrow, Red today / Dread, sorrow / can't turn away ${getEmoji(
      'MoriRap',
    )}`,
    `${getEmoji(
      'MoriRap',
    )} As petals fly, I’ll dance your tune, don’t hold your breath for me ${getEmoji('MoriRap')}`,
    `${getEmoji('MoriRap')} a yeet yeet skrt to the yacht yacht steeze ${getEmoji('MoriRap')}`,
    `${getEmoji(
      'MoriRap',
    )} knock ‘em unconscious, Bring ‘em back to life, then we tell ‘em “hey, watch this:” ${getEmoji(
      'MoriRap',
    )}`,
    `${getEmoji('MoriRap')} As if a million skeletons hit that "Subscribe" for satire ${getEmoji(
      'MoriRap',
    )}`,
    `${getEmoji('MoriMoney')} what a message no chad ${getEmoji('MoriMoney')}`,
    `${getEmoji('MoriDeath')} "Get Ripped, Skip Class" --Death Sensei, circa 2020 ${getEmoji(
      'MoriDeath',
    )}`,
  ]
  return createEmbed(
    {
      description: messages[Math.floor(Math.random() * messages.length)],
      fields: [
        ...getCategoryFields(categories),
        getSettingsField(settings),
        getBotManagerField(settings),
      ],
    },
    true,
  )
}

function getCategoryFields(categories: Set<string>): Set<EmbedField> {
  return categories.map((category) => ({
    name: category,
    value: `/help [category: ${category.toLowerCase()}]`,
    inline: true,
  }))
}

function getSettingsField({ relay, translate, cameos, community }: GuildSettings): EmbedField {
  return {
    name: 'Current settings',
    inline: false,
    value: stripIndents`
      ${getEmoji('speech_balloon')} **Full relay:** ${getWatchList('relay', relay)}
      ${getEmoji('speech_balloon')} **TL Only relay:** ${getWatchList('translate', translate)}
      ${getEmoji('holo')} **Live chat cameos:** ${getWatchList('cameos', cameos)}
      ${getEmoji('family_mmbb')} **Community posts:** ${getWatchList('community', community)}
    `,
  }
}

function getBotManagerField(settings: GuildSettings): EmbedField {
  return {
    name: 'Bot managers',
    inline: false,
    value: `
    ${getEmoji('tools')} **Admins:** ${getRoleList('admins', settings)}
    ${getEmoji('no_entry')} **Blacklisters:** ${getRoleList('blacklisters', settings)}
    `,
  }
}

function getWatchList(feature: WatchFeature, entries: WatchFeatureSettings[]): string {
  const first = head(entries)
  const firstMention = first?.roleToNotify ? `mentioning <@&${first.roleToNotify}>` : ''
  const templates = {
    empty: `None. Run \`${config.prefix}${feature}\``,
    one: `${first?.streamer} in <#${first?.discordCh}> ${firstMention}`,
    many: `Multiple. Run \`/${feature} viewcurrent\``,
  }

  return isEmpty(entries) ? templates.empty : entries.length === 1 ? templates.one : templates.many
}

function getRoleList(type: 'admins' | 'blacklisters', settings: GuildSettings): string {
  return settings[type].map((id) => `<@&${id}>`).join('') || `None yet. run ${config.prefix}${type}`
}
