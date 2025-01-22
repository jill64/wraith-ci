import { attempt } from '@jill64/attempt'
import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { env } from 'node:process'
import { App } from 'octokit'
import { scanner, string } from 'typescanner'
import { decrypt } from './decrypt.js'
import { assign } from './ghosts/assign.js'
import { build } from './ghosts/build.js'
import { bump } from './ghosts/bump/index.js'
import { docs } from './ghosts/docs/index.js'
import { format } from './ghosts/format.js'
import { lint } from './ghosts/lint.js'
import { merge } from './ghosts/merge/index.js'
import { release } from './ghosts/release/index.js'
import { Payload } from './types/Payload.js'
import { limitStr } from './utils/limitStr.js'
import { updateOutput } from './utils/updateOutput.js'

const isValidOutput = scanner({
  title: string,
  summary: string
})

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  const { body } = event

  const txt = await decrypt(body)
  const payload = JSON.parse(txt) as Payload

  const app = new App({
    appId: 420132,
    privateKey: env.GITHUB_APP_PRIVATEKEY_PKCS8!
  })

  const octokit = await app.getInstallationOctokit(payload.installation_id)

  let result

  if (payload.ghost === 'assign') {
    result = await assign(payload, octokit)
  } else if (payload.ghost === 'bump') {
    result = await bump({ payload, octokit })
  } else if (payload.ghost === 'release') {
    result = await release({ payload, octokit })
  } else if (payload.ghost === 'format') {
    result = await format(payload)
  } else if (payload.ghost === 'lint') {
    result = await lint(payload)
  } else if (payload.ghost === 'build') {
    result = await build(payload, octokit)
  } else if (payload.ghost === 'docs') {
    result = await docs({ payload, octokit })
  } else if (payload.ghost === 'merge') {
    result = await merge({ payload, octokit })
  } else {
    throw new Error(`Invalid ghost: ${payload.ghost}`)
  }

  if (typeof result === 'object' && result.status === 'failure') {
    console.error(result.detail)
    return {
      statusCode: 500,
      body: result.detail
    }
  }

  if (payload.check_run_id === undefined) {
    console.error('Missing check_run_id')
    return {
      statusCode: 400,
      body: 'Missing check_run_id'
    }
  }

  const { repo, owner, check_run_id, ghost } = payload

  const check = await attempt(
    () =>
      octokit.rest.checks.get({
        repo,
        owner,
        check_run_id
      }),
    null
  )

  const output = check?.data.output

  if (!isValidOutput(output)) {
    console.error(`Invalid checks output: ${JSON.stringify(output, null, 2)}`)
    return {
      statusCode: 500,
      body: 'Invalid checks output'
    }
  }

  const output_data = updateOutput({
    output,
    ghost_name: ghost,
    result
  })

  const conclusion = typeof result === 'string' ? result : result.status

  await octokit.rest.checks.update({
    check_run_id,
    owner,
    repo,
    status: 'in_progress',
    ...(conclusion ? { conclusion } : {}),
    details_url: '',
    output: output_data
      ? {
          ...output_data,
          title: limitStr(output.title ?? '', 1000),
          summary: limitStr(output.summary ?? '', 60000),
          ...(output.text ? { text: limitStr(output.text, 60000) } : {})
        }
      : undefined
  })

  return {
    statusCode: 200,
    body: 'OK'
  }
}
