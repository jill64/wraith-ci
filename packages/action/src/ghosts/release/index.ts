import { Ghost } from '@/action/types/Ghost.js'
import exec from '@actions/exec'
import { TwitterApi } from 'twitter-api-v2'
import { findFile } from '../../utils/findFile.js'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { isValidPackageJson } from '../docs/utils/isValidPackageJson.js'
import { npmPublish } from './npmPublish.js'

const env = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env ${key}`)
  }
  return value
}

const escape = (str: string) => str.replaceAll('@', '').replaceAll('#', '')

export const release: Ghost = async ({ payload: { owner, repo }, octokit }) => {
  const files = await findFile('package.json')

  if (files.length === 0) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  await Promise.allSettled(files.map(npmPublish))

  const json = await getPackageJson()
  const rootPackageJson = isValidPackageJson(json) ? json : null
  const version = rootPackageJson?.version

  if (!version) {
    return {
      status: 'skipped',
      detail: 'Not found version in root package.json'
    }
  }

  await exec.exec('gh release create', [`v${version}`, '--generate-notes'])

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

  const topics = repo_topics
    .map((topic) => `#${escape(topic.trim().replaceAll('-', ''))}`)
    .join(' ')

  const releaseLink = `https://github.com/${owner}/${repo}/releases/tag/v${version}`

  const name = escape(files.length > 1 ? repo : rootPackageJson.name ?? repo)

  await Promise.all([
    enClient.v2.tweet({
      text: `${name} v${version} has been released.
${topics}
${releaseLink}`
    }),
    jpClient.v2.tweet({
      text: `${name} v${version} をリリースしました。
${topics}
${releaseLink}`
    })
  ])

  return 'success'
}
