import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' })
import {
  AttachmentBuilder,
  codeBlock,
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
  let successfulBan = false
  let banningDisabled = false
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
      } else {
        log(oneLine`successfully banned user ${author.id}`)
        successfulBan = true
        // await msg.guild?.bans.remove(author.id)
      }
    } catch (err) {
      debug('Unable to ban user: ' + err)
    }
  } else {
    log(oneLine`banning users is disabled ${author.id}`)
    banningDisabled = true
  }

  const logChannel = await msg.guild?.channels.fetch(process.env.DISCORD_HONEYPOT_LOG_CHANNEL_ID)
  if (logChannel?.isSendable() && logChannel?.isTextBased()) {
    try {
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
      if (successfulBan) {
        embed.setTitle('Successfully banned user')
      } else {
        embed.setTitle('Failed to ban user')
      }
      if (banningDisabled) {
        embed.setTitle('Banning users is disabled')
        embed.setDescription(
          'Honeypot triggered. Use the `/honeypot` command to enable banning non-mod users',
        )
      }
      if (media !== '') {
        embed.addFields({ name: 'Attachments', value: media })
      }
      if (msg.content !== '') {
        if (msg.content.length > 1000) {
          embed.addFields({ name: 'Message', value: 'Message too long, see attachment' })
        } else {
          embed.addFields({ name: 'Message', value: codeBlock(msg.content) })
        }
      }
      if (bot) {
        embed.addFields({ name: 'Command', value: `Used a command from ${bot.username}` })
      }
      if (msg.poll) {
        embed.addFields({ name: 'Message', value: 'Made a poll' })
      }
      if (msg.content && msg.content.length > 1000) {
        let attachment = new AttachmentBuilder(Buffer.from(msg.content, 'utf-8')).setName(
          'message.txt',
        )
        await logChannel?.send({ embeds: [embed], files: [attachment] })
      } else {
        await logChannel?.send({ embeds: [embed] })
      }
    } catch (err) {
      debug('Unable to send message to log channel: ' + err)
    }
  }
}
