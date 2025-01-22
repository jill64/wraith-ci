import { Buffer } from 'node:buffer'
import { Octokit } from 'octokit'

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
  octokit: Octokit
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
    console.error(
      e instanceof Error ? e : new Error(JSON.stringify(e, null, 2))
    )
    return null
  }
}
