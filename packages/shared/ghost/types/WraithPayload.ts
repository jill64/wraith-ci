import type { GhostName } from './GhostName.js'

export type WraithPayload = {
  triggered_ghosts: GhostName[]
  pull_number: number | null
  head_sha: string
  ref: string

  /**
  {
    env: {
      [key: string]: string
    }
  }
  */
  encrypted: {
    encryptedData: string
    iv: string
    encryptedSessionKey: string
  }
}
