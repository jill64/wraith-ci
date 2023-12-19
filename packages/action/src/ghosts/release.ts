import { Ghost } from '@/action/types/Ghost.js'
import exec from '@actions/exec'
import { TwitterApi } from 'twitter-api-v2'
import { array, optional, scanner, string } from 'typescanner'
import { getPackageJson } from '../utils/getPackageJson.js'
import { run } from '../utils/run.js'

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

export const release: Ghost = async ({ payload, octokit }) => {
  const package_json = await getPackageJson()

  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!isValidJson(package_json)) {
    return {
      status: 'skipped',
      detail: 'No version found in package.json'
    }
  }

  const version = package_json.version.trim()

  const publishedVersion = await run('npm view . version').then(({ stdout }) =>
    stdout.trim()
  )

  if (version === publishedVersion) {
    return {
      status: 'skipped',
      detail: 'No version changes'
    }
  }

  await exec.exec('npm publish')
  await exec.exec(`gh release create v${version} --generate-notes`)

  if (!version.endsWith('.0')) {
    return 'success'
  }

  const repo_topics = await octokit.rest.repos
    .getAllTopics({
      owner: payload.owner,
      repo: payload.repo
    })
    .then(({ data: { names } }) => names)

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

  const releaseLink = `https://github.com/${payload.owner}/${payload.repo}/releases/tag/v${version}`

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
