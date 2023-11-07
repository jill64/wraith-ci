import { actions } from '@/ghost/actions.js'
import { WraithPayload } from '@/types/WraithPayload.js'
import exec from '@actions/exec'
import { attempt } from '@jill64/attempt'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'

action(async ({ octokit, payload: { repo, owner } }) => {
  const data = attempt(
    () => {
      const str = core.getInput('data')
      return JSON.parse(str) as WraithPayload
    },
    (e, o) => e ?? new Error(String(o))
  )

  const ref = core.getInput('ref')

  await actions({
    ref,
    exec,
    data,
    repo,
    owner,
    octokit
  })
})
