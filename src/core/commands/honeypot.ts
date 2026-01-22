import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' })
import { Command } from '../../helpers/discord'
import {
  channelMention,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  Snowflake,
} from 'discord.js'
import { getSettings, updateSettings } from '../db/functions'
import { debug } from '../../helpers'

const description = 'Enable or disable the honeypot channel.'

export const honeypot: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'General',
    description,
  },
  slash: new SlashCommandBuilder()
    .setName('honeypot')
    .setDescription(description)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('enable')
        .setDescription('when a non mod user posts in the honeypot channel, they will be banned'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('disable')
        .setDescription(
          'posting in the honeypot channel will not ban users but it will create a log entry',
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('state').setDescription('check the state of the honeypot'),
    ),
  callback: async (intr: ChatInputCommandInteraction): Promise<void> => {
    const verb = intr.options.getSubcommand(true) as 'enable' | 'disable' | 'state'
    if (!process.env.DISCORD_HONEYPOT_CHANNEL_ID || !process.env.DISCORD_HONEYPOT_LOG_CHANNEL_ID) {
      await intr.editReply({ content: 'Honeypot channel is not configured' })
      return
    }
    const honeypotChannel = intr.guild?.channels.cache.get(process.env.DISCORD_HONEYPOT_CHANNEL_ID)

    const permissions = intr.guild?.members.me?.permissionsIn(
      process.env.DISCORD_HONEYPOT_CHANNEL_ID,
    )
    const manageServerPermission = permissions?.has(PermissionsBitField.Flags.ManageGuild)
    const moderateServerPermission = permissions?.has(PermissionsBitField.Flags.ModerateMembers)
    const viewChannelPermission = permissions?.has(PermissionsBitField.Flags.ViewChannel)

    if (verb === 'state') {
      const settings = getSettings(intr)
      const embed = new EmbedBuilder()
        .setTitle('Honeypot State')
        .setDescription(
          'Requires the "Manage Server" permission in order to ban users and delete their recent messages.\nAnyone with kick permissions is already excluded from being banned.',
        )
        .addFields(
          { name: 'Issue Bans', value: settings.honeypot ? '✅' : '❌', inline: true },
          {
            name: 'Manage Server Permissions',
            value: manageServerPermission ? '✅' : '❌',
            inline: true,
          },
           {
            name: 'Moderate Members Permissions',
            value: moderateServerPermission ? '✅' : '❌',
            inline: true,
          },
          {
            name: 'Can See Channel',
            value: viewChannelPermission ? '✅' : '❌',
            inline: true,
          },
          {
            name: 'Honeypot Channel',
            value: channelMention(process.env.DISCORD_HONEYPOT_CHANNEL_ID),
          },
          {
            name: 'Log Channel',
            value: channelMention(process.env.DISCORD_HONEYPOT_LOG_CHANNEL_ID),
          },
          {
            name: 'Extra Bot Admin Roles',
            value: getRoleList(settings.admins),
          },
        )

      await intr.editReply({
        embeds: [embed],
      })
      return
    }

    let reply = 'Mori Translations will actively ban non-mod users who post in the honeypot channel'

    if (viewChannelPermission === false) {
      reply = 'Please allow Mori Translations to view the honeypot channel'
    }

    if (manageServerPermission === false) {
      reply = 'Mori Translations is watching the honeypot channel, but will not ban users'
    }

    if (verb === 'disable' && honeypotChannel?.type === ChannelType.GuildText) {
      updateSettings(intr, { honeypot: false })
    }
    if (verb === 'enable' && honeypotChannel?.type === ChannelType.GuildText) {
      updateSettings(intr, { honeypot: true })
    }

    const settings = getSettings(intr)
    const honeypot = settings.honeypot

    if (!honeypot) {
      reply = 'Mori Translations is watching the honeypot channel, but will not ban users'
    }
    try {
      await intr.editReply({
        content: reply,
      })
      return
    } catch (err) {
      debug('Unable to reply to command: ' + err)
    }
  },
}

function getRoleList(roles: Snowflake[]) {
  let roleString = roles.map((id) => '<@&' + id + '>')
  if (roleString.length === 0) {
    roleString.push('No one')
  }
  return `**Current**: ${roleString.join(' ')}`
}
