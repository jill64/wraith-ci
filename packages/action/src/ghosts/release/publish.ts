import exec from '@actions/exec'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ActionOctokit } from 'octoflare/action'
import { TwitterApi } from 'twitter-api-v2'
import { array, optional, scanner, string } from 'typescanner'

const isValidJson = scanner({
  name: string,
  version: string,
  keywords: optional(array(string))
})

const env = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env ${key}`)
  }
  return value
}

const escape = (str: string) => str.replaceAll('@', '').replaceAll('#', '')

export const publish =
  ({
    repo,
    owner,
    octokit
  }: {
    repo: string
    owner: string
    octokit: ActionOctokit
  }) =>
  async (file: string) => {
    const cwd = path.dirname(file)

    const str = await readFile(file, 'utf-8')
    const package_json = JSON.parse(str)

    if (!isValidJson(package_json)) {
      return {
        status: 'skipped',
        detail: 'No version found in package.json'
      }
    }

    const version = package_json.version.trim()

    const publishedVersion = await exec.getExecOutput(
      'npm view . version',
      undefined,
      {
        cwd,
        ignoreReturnCode: true
      }
    )

    if (version === publishedVersion.stdout.trim()) {
      return {
        status: 'skipped',
        detail: 'No version changes'
      }
    }

    await exec.exec('npm publish', undefined, {
      cwd
    })

    await exec.exec('gh release create', [`v${version}`, '--generate-notes'], {
      cwd
    })

    if (!version.endsWith('.0')) {
      return 'success'
    }

    const {
      data: { names: repo_topics }
    } = await octokit.rest.repos.getAllTopics({ owner, repo })

    const enClient = new TwitterApi({
      appKey: env('X_EN_APP_KEY'),
      appSecret: env('X_EN_APP_SECRET'),
      accessToken: env('X_EN_ACCESS_TOKEN'),
      accessSecret: env('X_EN_ACCESS_SECRET')
    })

    const jpClient = new TwitterApi({
      appKey: env('X_JP_APP_KEY'),
      appSecret: env('X_JP_APP_SECRET'),
      accessToken: env('X_JP_ACCESS_TOKEN'),
      accessSecret: env('X_JP_ACCESS_SECRET')
    })

    const topics = [
      ...new Set([...repo_topics, ...(package_json.keywords ?? [])])
    ]
      .filter((x) => x)
      .map((topic) => `#${escape(topic.trim().replaceAll('-', ''))}`)
      .join(' ')

    const releaseLink = `https://github.com/${owner}/${repo}/releases/tag/v${version}`

    await Promise.all([
      enClient.v2.tweet({
        text: `${escape(package_json.name)} v${version} has been released.
${topics}
${releaseLink}`
      }),
      jpClient.v2.tweet({
        text: `${escape(package_json.name)} v${version} をリリースしました。
${topics}
${releaseLink}`
      })
    ])

    return 'success'
  }
