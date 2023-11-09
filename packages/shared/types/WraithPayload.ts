import { TriggerEvent } from './TriggerEvent.js'

export type WraithPayload = {
  ref: string
  event: TriggerEvent
  check_run_id: number
}
