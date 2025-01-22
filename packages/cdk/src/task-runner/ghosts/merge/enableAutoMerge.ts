import { Octokit } from 'octokit'

export const enableAutoMerge = async ({
  repo,
  owner,
  octokit,
  pull_number
}: {
  repo: string
  owner: string
  octokit: Octokit
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
    throw new Error('Failed to enable auto merge')
  }
}
