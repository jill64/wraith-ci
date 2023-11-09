import { initWraithStatus } from '@/shared/src/initWraithStatus.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'
import { apps } from './apps.js'

action<WraithPayload>(async ({ octokit, payload, updateCheckRun }) => {
  const wraith_status = initWraithStatus(payload.data.status)
  const name = core.getInput('name')

  if (!(name in apps)) {
    throw new Error(`Invalid ghost name: ${name}`)
  }

  const ghost_name = name as keyof typeof apps
  const app = apps[ghost_name]

  const result = await app({
    octokit,
    payload
  })

  wraith_status.update(ghost_name, result)

  await updateCheckRun(wraith_status.generateOutput())
})
