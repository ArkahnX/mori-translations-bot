/** @file Exports main streamer list and streamer-related utility functions */
import { CommandInteraction, Message, bold } from 'discord.js'
import { ciEquals } from '../../../helpers'
import { createEmbed, reply } from '../../../helpers/discord'
import { YouTubeChannelId } from '../../../modules/holodex/frames'
import { ValidatedOptions } from '../functions'
import { hololive } from './hololive'
import { indies } from './indies'
import { nijisanji } from './nijisanji'

export const streamers = StreamerArray([...hololive, ...nijisanji, ...indies] as const)

export const streamersMap: Map<YouTubeChannelId, Streamer> = new Map(
  streamers.map((s) => [s.ytId, s]),
)

export const streamersYtIdSet: Set<YouTubeChannelId> = new Set(streamers.map((s) => s.ytId))

export const names = streamers.map((x) => x.name)
export const twitters = streamers.map((x) => x.twitter)
export type StreamerName = typeof names[number] | 'all'
export type StreamerTwitter = typeof twitters[number]

export function getStreamerList(): string {
  const groups: Map<string, Set<string>> = new Map();
  for(const streamer of streamers) {
    const group = streamer.groups[0];
    if(groups.has(group) === false) {
      groups.set(group,new Set());
    }
    const talents = groups.get(group) as Set<string>;
    talents.add(streamer.name)
  }
  const result = [];
  for(const [group, talents] of groups.entries()) {
    result.push(`${bold(group)}: ${Array.from(talents.values()).sort().join(", ")}`)
  }
  result.sort();
  // return streamers.map((streamer) => streamer.name).join(', ')
  return result.join("\n");
}

export function findStreamerName(name: string): StreamerName | undefined {
  const bySubname = streamers.find((s) => s.name.split(' ').some((word) => ciEquals(word, name)))
  const byFullName = streamers.find((s) => s.name === name)
  const byAlias = streamers.find((s) =>
    s.aliases?.some((a) => (typeof a === 'string' ? ciEquals(a, name) : name.match(a))),
  )
  const streamer = bySubname ?? byFullName ?? byAlias

  return name === 'all' ? 'all' : streamer?.name
}

export function getTwitterUsername(streamer: StreamerName): StreamerTwitter {
  return streamers.find((x) => x.name === streamer)?.twitter ?? 'discord'
}

export function replyStreamerList(x: CommandInteraction | ValidatedOptions): void {
  const msg = x instanceof CommandInteraction ? x : x.intr
  reply(
    msg,
    createEmbed({
      title: 'Supported channels',
      description: getStreamerList(),
    }),
  )
}

export function isSupported(ytId: string): boolean {
  return streamers.some((streamer) => streamer.ytId === ytId)
}

export type Streamer = Readonly<{
  aliases: readonly string[]
  groups: readonly string[]
  name: string
  picture: string
  twitter: string
  ytId: string
  chName: string
}>

//////////////////////////////////////////////////////////////////////////////

/**
 * This constrained identity function validates array without typing it
 * so that we may use 'as const' on the array
 **/
function StreamerArray<T extends readonly Streamer[]>(arr: T) {
  return arr
}

// type stringOrRegex = string | RegExp
