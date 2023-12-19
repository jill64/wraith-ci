import { TriggerEvent } from './TriggerEvent.js'

export type WraithPayload = {
  head_sha: string
  event: TriggerEvent
  ref: string
}
