import { workers } from '@/ghost/workers.js'
import { GhostPayload } from './GhostPayload.js'
import { WorkerContext } from './WorkerContext.js'

export type Ghost = {
  worker: (context: WorkerContext) => Promise<GhostPayload | void>
  action?: (
    data: Awaited<ReturnType<typeof workers>> extends Record<string, infer U>
      ? U
      : never
  ) => Promise<unknown>
}
