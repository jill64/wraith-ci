import { Octokit } from '@octokit/rest'
import { type RequestEvent } from '@sveltejs/kit'

export const genOctokit = async (event: RequestEvent, accessToken: string) => {
  const kit = new Octokit({
    token: accessToken
  })

  return kit
}
