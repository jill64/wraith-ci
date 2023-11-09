import { WraithStatus } from './WraithStatus.js'

export type WraithPayload = {
  check_run_id: string
  ref: string
  status: WraithStatus
}
