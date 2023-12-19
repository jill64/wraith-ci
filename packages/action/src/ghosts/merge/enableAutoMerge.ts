import { ActionOctokit } from 'octoflare/action'

export const enableAutoMerge = async ({
  repo,
  owner,
  octokit,
  pull_number
}: {
  repo: string
  owner: string
  octokit: ActionOctokit
  pull_number: number
}) => {
  const {
    repository: {
      pullRequest: { id: pullRequestId }
    }
  } = await octokit.graphql<{
    repository: { pullRequest: { id: string } }
  }>(/* GraphQL */ `
    query Query {
      repository(name: "${repo}", owner: "${owner}") {
        pullRequest(number: ${pull_number}) {
          id
        }
      }
    }
  `)

  try {
    await octokit.graphql(/* GraphQL */ `
    mutation MyMutation {
      enablePullRequestAutoMerge(input: { pullRequestId: "${pullRequestId}" }) {
        clientMutationId
      }
    }
  `)
  } catch {
    await octokit.rest.pulls.merge({
      repo,
      owner,
      pull_number
    })
  }
}
