import { actions } from '@/ghost/actions.js'
import { WraithPayload } from '@/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'

action(async () => {
  const data = attempt(
    () => {
      const str = core.getInput('data')
      return JSON.parse(str) as WraithPayload
    },
    (e, o) => e ?? new Error(String(o))
  )

  await actions(data)
})
