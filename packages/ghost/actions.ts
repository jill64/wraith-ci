import { WraithPayload } from '@/types/WraithPayload.js'
import { apps } from './apps.js'

export const actions = (payload: WraithPayload | Error) =>
  Promise.allSettled(
    Object.entries(apps).map(
      ([name, app]) =>
        app.action?.(
          payload instanceof Error
            ? {
                status: 'error',
                result: payload
              }
            : payload[name]
        )
    )
  )
