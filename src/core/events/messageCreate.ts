import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' })
import {
  EmbedBuilder,
  GuildMember,
  inlineCode,
  Message,
  PermissionsBitField,
  userMention,
} from 'discord.js'
import { debug, log } from '../../helpers'
import { oneLine } from 'common-tags'
import { getPermLevel, getSettings } from '../db/functions'

export async function messageCreate(msg: Message): Promise<void> {
  if (!process.env.DISCORD_HONEYPOT_CHANNEL_ID || !process.env.DISCORD_HONEYPOT_LOG_CHANNEL_ID)
    return
  const isBot = msg.author.bot
  let author: GuildMember | undefined
  let bot = undefined
  if (isBot === true) {
    author = msg.guild?.members.cache.get(msg.interactionMetadata?.user.id!)
    bot = msg.author
  } else {
    author = msg.guild?.members.cache.get(msg.author.id)
  }
  if (!author || author.user.bot) return

  const isHoneypotChannel = msg.channel.id === process.env.DISCORD_HONEYPOT_CHANNEL_ID
  if (isHoneypotChannel === false) return

  const permissions = msg.guild?.members.me?.permissionsIn(process.env.DISCORD_HONEYPOT_CHANNEL_ID)
  const manageServerPermission = permissions?.has(PermissionsBitField.Flags.ManageGuild)
  const viewChannelPermission = permissions?.has(PermissionsBitField.Flags.ViewChannel)
  if (viewChannelPermission === false) return

  const permLevel = await getPermLevel(author)
  if (permLevel.level >= 2) return

  log(oneLine`${author.user.username} (${author.id}) triggered the honeypot`)
  const media = msg.attachments.size > 0 ? msg.attachments.map((a) => a.url).join('\n') : ''
  const embed = new EmbedBuilder()
    .setAuthor({ name: author.user.username, iconURL: author.displayAvatarURL() })
    .setDescription(
      'User triggered the honeypot... \nUse the `/honeypot` command to enable/disable the honeypot',
    )
    .addFields(
      { name: 'User', value: userMention(author.id), inline: true },
      { name: 'ID', value: inlineCode(author.id), inline: true },
      {
        name: 'Media',
        value: media.length ? msg.attachments.size.toString() : 'None',
        inline: true,
      },
    )
    .setTimestamp(new Date())
  if (media !== '') {
    embed.addFields({ name: 'Attachments', value: media })
  }
  if (msg.content !== '') {
    embed.addFields({ name: 'Message', value: msg.content })
  }
  if (bot) {
    embed.addFields({ name: 'Command', value: `Used a command from ${bot.username}` })
  }
  if (msg.poll) {
    embed.addFields({ name: 'Message', value: 'Made a poll' })
  }
  const settings = getSettings(msg.guild!)
  const honeypot = settings.honeypot

  if (manageServerPermission === true && honeypot === true) {
    try {
      const results = await msg.guild?.bans.bulkCreate([author.id], {
        deleteMessageSeconds: 60 * 60,
      })
      // const results = { bannedUsers: [] }
      if (results?.bannedUsers.length === 0) {
        log(oneLine`could not ban user ${author.id}`)
        embed.setTitle('Failed to ban user')
      } else {
        embed.setTitle('Successfully banned user')
        // await msg.guild?.bans.remove(author.id)
      }
    } catch (err) {
      debug('Unable to ban user: ' + err)
    }
  } else {
    log(oneLine`banning users is disabled ${author.id}`)
    embed.setTitle('Banning users is disabled')
    embed.setDescription(
      'Honeypot triggered. Use the `/honeypot` command to enable banning non-mod users',
    )
  }

  const logChannel = await msg.guild?.channels.fetch(process.env.DISCORD_HONEYPOT_LOG_CHANNEL_ID)
  if (logChannel?.isSendable() && logChannel?.isTextBased()) {
    try {
      await logChannel?.send({ embeds: [embed] })
    } catch (err) {
      debug('Unable to send message to log channel: ' + err)
    }
  }
}
