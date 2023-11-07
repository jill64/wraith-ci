import { ActionContext } from './ActionContext.js'
import { GhostPayload } from './GhostPayload.js'
import { WorkerContext } from './WorkerContext.js'

export type Ghost = {
  worker: (context: WorkerContext) => Promise<GhostPayload | void>
  action?: (context: ActionContext) => Promise<unknown>
}
