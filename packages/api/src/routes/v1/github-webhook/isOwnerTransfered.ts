import { Buffer } from 'node:buffer'
import type { Octokit } from 'octoflare/octokit'
import { scanner, string } from 'typescanner'

const isValid = scanner({
  author: scanner({
    name: string
  })
})

export const isOwnerTransferred = async ({
  octokit,
  owner,
  ref,
  repo
}: {
  octokit: Octokit
  owner: string
  ref: string
  repo: string
}): Promise<boolean> => {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: 'package.json',
    ref
  })

  if (Array.isArray(data)) {
    return false
  }

  if (data.type !== 'file') {
    return false
  }

  const content = Buffer.from(data.content, 'base64').toString('utf-8')

  const packageJson = JSON.parse(content) as unknown

  if (!isValid(packageJson)) {
    return false
  }

  return packageJson.author.name === owner
}
