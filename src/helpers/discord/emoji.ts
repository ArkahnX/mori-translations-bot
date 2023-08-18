import { Client, GuildEmoji } from 'discord.js'
import { log } from '../logging';

export const emoji: Record<
  Name,
  { name: string; id?: string; animated?: boolean; emote?: GuildEmoji | string }
> = {
  respond: { id: '814173011313295370', name: 'LunaRespond' },
  deepl: { id: '1139682676073320478', name: 'deepl' },
  nbsp: { id: '832910690998026260', name: 'nbsp' },
  discord: { id: '1139682571832266782', name: 'Discord' },
  holo: { id: '1140017507504238622', name: 'Hololive' },
  ping: { id: '864533105821220894', name: 'WatamePing' },
  yt: { id: '1139682642669871135', name: 'YouTube' },
  peek: { id: '873613928867975248', name: 'LunaPeek' },
  phone: { id: '826588285014638592', name: 'MoriPhone' },
  MoriDeath: { id: '754514949874647110', name: 'MoriDeath' },
  MoriRap: { id: '772468623012397077', name: 'MoriRap', animated: true },
  MoriMoney: { id: '757158735964536842', name: 'MoriMoney' },
  phoneHeh: { id: '883399944575279174', name: 'MoriPhoneHeh' },
  niji: { name: 'rainbow' },
  speech_balloon: { id: '883399944575279174', name: 'MoriPhoneHeh' },
  family_mmbb: { name: 'family_mmbb' },
  warning: { name: 'warning' },
  no_entry: { name: 'no_entry' },
  clown: { name: 'clown' },
  bookmark_tabs: { name: 'bookmark_tabs' },
  tools: { name: 'tools' },
  loudspeaker: { name: 'loudspeaker' },
  white_check_mark: { name: 'white_check_mark' },
  candy: { name: 'candy' },
} as const

export function loadAllEmoji(client: Client) {
  log("Loading all custom emoji.")
  for (const emote of Object.values(emoji)) {
    if (!emote.id) {
      emote.emote = `:${emote.name}:`
    } else {
      const emojiData = client.emojis.cache.get(emote.id)
      if (emojiData) {
        emote.emote = emojiData
      } else {
        log(`Missing emoji ${emote.name}`)
        emote.emote = `<${emote.animated ? 'a' : ''}:${emote.name}:${emote.id}>`
      }
    }
  }
}

export function getEmoji(id: keyof typeof emoji) {
  return emoji[id].emote as GuildEmoji|string;
}

///////////////////////////////////////////////////////////////////////////////

type Name = string
type EmojiCode = string
