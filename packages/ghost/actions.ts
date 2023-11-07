import { ActionContext } from '@/types/ActionContext.js'
import { WraithPayload } from '@/types/WraithPayload.js'
import { apps } from './apps.js'

export const actions = (
  context: Omit<ActionContext, 'data'> & { data: WraithPayload | Error }
) =>
  Promise.allSettled(
    Object.entries(apps).map(
      ([name, app]) =>
        app.action?.({
          ...context,
          data:
            context.data instanceof Error
              ? {
                  status: 'error',
                  result: context.data
                }
              : context.data[name]
        })
    )
  )
