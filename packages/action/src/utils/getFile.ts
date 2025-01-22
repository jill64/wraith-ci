import { Buffer } from 'node:buffer'
import { ActionOctokit } from 'octoflare/action'
import * as core from 'octoflare/action/core'

export const getFile = async ({
  octokit,
  owner,
  repo,
  path,
  ref
}: {
  path: string
  owner: string
  repo: string
  ref: string
  octokit: ActionOctokit
}) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
    })

    if (!('type' in data && data.type === 'file')) {
      return null
    }

    const buff = Buffer.from(data.content, data.encoding as BufferEncoding)

    return buff.toString()
  } catch (e) {
    core.error(e instanceof Error ? e : new Error(JSON.stringify(e, null, 2)))
    return null
  }
}
