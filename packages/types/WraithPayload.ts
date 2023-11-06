import { workers } from '@/ghost/workers.js'

export type WraithPayload = Awaited<ReturnType<typeof workers>>
