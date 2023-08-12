export const emoji: Record<Name, EmojiCode> = {
  respond: '<:LunaRespond:814173011313295370>',
  deepl: '<:deepl:1139682676073320478>',
  nbsp: '<:nbsp:832910690998026260>',
  discord: '<:Discord:1139682571832266782>',
  holo: '<:Hololive:1139682716384763995>',
  ping: '<:WatamePing:864533105821220894>',
  yt: '<:YouTube:1139682642669871135>',
  peek: '<:LunaPeek:873613928867975248>',
  niji: '<:nijisanji:893782660156112986>',
  phoneHeh: '<:MoriPhoneHeh:1139711096421367910>',
  phone: '<:MoriPhone:1139711054314749974>',
} as const

///////////////////////////////////////////////////////////////////////////////

type Name = string
type EmojiCode = string
