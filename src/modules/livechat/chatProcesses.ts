import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { VideoId } from '../holodex/frames'

/** Returns a singleton of the chat process for a given video ID */
export function getChatProcess (videoId: VideoId): ChatProcess {
  return chatProcesses[videoId] ??= spawnChatProcess (videoId)
}

export function chatProcessExists (videoId: VideoId): boolean {
  return chatProcesses[videoId] != undefined
}

export function deleteChatProcess (videoId: VideoId): void {
  delete chatProcesses[videoId]
}

///////////////////////////////////////////////////////////////////////////////

type ChatProcess = ChildProcessWithoutNullStreams

const chatProcesses: Record<VideoId, ChatProcess> = {}

function spawnChatProcess (liveId: VideoId): ChatProcess {
  return spawn ('python3', ['-u', './chat_dl.py', liveId])
}
