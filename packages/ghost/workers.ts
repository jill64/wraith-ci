import { WorkerContext } from '@/types/WorkerContext.js'
import { attempt } from '@jill64/attempt'
import { apps } from './apps.js'

export const workers = async (
  context: Omit<WorkerContext, 'createCheckRun' | 'head_sha'>
) => {
  const results = Object.entries(apps).map(async ([name, app]) => {
    const { payload, installation, repo, owner } = context

    const head_sha =
      'pull_request' in payload
        ? payload.pull_request.head.sha
        : 'after' in payload
        ? payload.after
        : null

    const createCheckRun = async (name: string) => {
      if (!(head_sha && Number(head_sha) !== 0)) {
        return 0
      }

      const {
        data: { id }
      } = await installation.kit.rest.checks.create({
        repo,
        owner,
        name,
        head_sha,
        status: 'in_progress'
      })

      return id
    }

    const data = await attempt(
      async () => {
        const result = await app.worker({
          ...context,
          createCheckRun,
          head_sha
        })

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

    return [name, data] as const
  })

  const data = await Promise.all(results)

  type DataValue = (typeof data)[number]

  return Object.fromEntries(
    data.filter(([, x]) => x) as [DataValue[0], NonNullable<DataValue[1]>][]
  )
}
