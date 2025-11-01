import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' })
import { Message } from 'discord.js'

export async function messageCreate(msg: Message): Promise<void> {
  // console.log('received message')
  const isBot = msg.author.bot
  if (isBot === true) return
  const isHoneypotChannel = msg.channel.id === process.env.DISCORD_HONEYPOT_CHANNEL_ID
  if (isHoneypotChannel === false) return
  const isOwner = msg.author.id === msg.guild?.ownerId;
  if (isOwner === true) return
  const isMod = msg.member?.roles.cache.some(
    (r) => r.id === '753100158966956122' || r.id === '754089681842339891',
  )
  if (isMod === true) return
  await msg.guild?.bans.bulkCreate([msg.author.id], {deleteMessageSeconds: 60 * 60});
  // await msg.guild?.bans.remove(msg.author.id);
  // console.log('testing message', isBot, isHoneypotChannel, isMod, isOwner)
  console.log(msg.author.username, 'triggered the honeypot')
}
