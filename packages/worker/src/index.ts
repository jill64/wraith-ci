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

  const data = await workers({
    repo,
    owner,
    payload,
    repository,
    installation
  })

  if (!data) {
    return new Response('No Wraith CI Payload', {
      status: 200
    })
  }

  await installation.startWorkflow({
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
