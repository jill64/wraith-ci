import { WorkerContext } from '@/types/WorkerContext.js'
import { attempt } from '@jill64/attempt'
import { apps } from './apps.js'

export const workers = async (context: WorkerContext) => {
  const results = Object.entries(apps).map(
    async ([name, app]) =>
      [
        name,
        await attempt(
          async () => {
            const result = await app.worker(context)
            return result
              ? {
                  status: 'success' as const,
                  result
                }
              : null
          },
          (e, o) => ({
            status: 'error' as const,
            result: e ?? new Error(String(o))
          })
        )
      ] as const
  )

  const data = await Promise.all(results)

  type DataValue = (typeof data)[number]

  return Object.fromEntries(
    data.filter(([, x]) => x) as [DataValue[0], NonNullable<DataValue[1]>][]
  )
}
