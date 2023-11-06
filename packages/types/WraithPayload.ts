import { worker } from '@/ghost/worker.js'

export type WraithPayload = Awaited<ReturnType<typeof worker>>
