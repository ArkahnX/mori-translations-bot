/** @file Generic Discord.js helper functions applicable to any bot. */
import { config } from '../../config'
import { Guild, GuildMember, Message, Snowflake, TextBasedChannels, TextChannel, PermissionResolvable,NewsChannel, DMChannel, ThreadChannel } from 'discord.js'
import { client } from '../../core'

export function findTextChannel (
  id: Snowflake | undefined
): TextChannel | ThreadChannel | undefined {
  const ch    = client.channels.cache.get (id ?? '')
  const valid = [TextChannel, ThreadChannel].some (type => ch instanceof type)
  return valid ? <TextChannel | ThreadChannel> ch : undefined
}

export function isGuild (scrutinee: any): scrutinee is Guild {
  return scrutinee instanceof Guild
}

export function isMessage (scrutinee: any): scrutinee is Message {
  return scrutinee instanceof Message
}

export function isMember (scrutinee: any): scrutinee is GuildMember {
  return scrutinee instanceof GuildMember
}

export function isDm (msg: Message): boolean {
  return msg.guild === undefined
}

export function hasRole (x: Message | GuildMember, role: Snowflake): boolean {
  const user = isMessage (x) ? x.member
                             : x
  return <boolean> user?.roles.cache.has (role)
}

export function isGuildOwner (scrutinee: Message | GuildMember): boolean {
  return getUserId (scrutinee) === scrutinee.guild?.ownerId
}

export function isBotOwner (scrutinee: Message | GuildMember): boolean {
  return getUserId (scrutinee) === config.ownerId
}

export function getUserId (subject: Message | GuildMember): Snowflake {
  return isMessage (subject) ? subject.author.id
                             : subject.id
}

export function hasKickPerms (subject: Message | GuildMember): boolean {
  const author = isMessage (subject)
    ? subject.member
    : subject

  return <boolean> author?.permissions.has ('KICK_MEMBERS')
}

export function getGuildId (
  subject: Message | Guild | GuildMember
): Snowflake | undefined {
  const isADm = isMessage (subject) && isDm (subject)
  return isADm               ? undefined
       : isMessage (subject) ? subject.guild!.id
       : isGuild (subject)   ? subject.id
                             : subject.guild!.id
}

export function mentionsMe (msg: Message): boolean {
  const mentionRegex = new RegExp (`^<@!?${client.user!.id}>`)
  return Boolean (msg.content.match (mentionRegex))
}

export function isBot (msg: Message): boolean {
  return Boolean (msg.author?.bot)
}

export function validateRole (
  g: Guild, role: string | undefined
): Snowflake | undefined {
  return g.roles.cache.get (role?.replace (/[<@&>]/g, '') as any)?.id
}

export function canBot (
  perm: PermissionResolvable, channel?: TextBasedChannels
): boolean {
  const unsupported = [DMChannel]
  const isSupported = unsupported.every (type => !(channel instanceof type))
  const validated = <TextChannel | ThreadChannel | NewsChannel | undefined> channel
  return isSupported
      && !!validated?.guild.me
      && validated.permissionsFor (validated.guild.me!).has (perm)
}

export function snowflakeToUnix (snowflake: Snowflake): number {
  return new Date (Number (snowflake) / 4194304 + 1420070400000).getTime ()
}
