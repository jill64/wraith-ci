import { workers } from '@/ghost/workers.js'
import { octoflare } from 'octoflare'

export default octoflare(async ({ payload, installation }) => {
  if (!installation) {
    return new Response('No Installation', {
      status: 200
    })
  }

  if (!('repository' in payload && payload.repository)) {
    return new Response('No Repository', {
      status: 200
    })
  }

  const { repository } = payload

  const repo = repository.name
  const owner = repository.owner.login

  const ref =
    'ref' in payload
      ? payload.ref.replace('refs/heads/', '')
      : repository.default_branch

  const data = await workers({
    ref,
    repo,
    owner,
    payload,
    repository,
    installation
  })

  if (!Object.keys(data).length) {
    return new Response('No Wraith CI Payload', {
      status: 200
    })
  }

  await installation.startWorkflow({
    ref,
    payload: {
      repo,
      owner
    },
    data: JSON.stringify(data)
  })

  return new Response('Wraith CI Workflow Submitted', {
    status: 202
  })
})
