import { Ghost } from '@/action/types/Ghost.js'
import exec from '@actions/exec'
import { TwitterApi } from 'twitter-api-v2'
import { run } from '../utils/run.js'

const env = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env ${key}`)
  }
  return value
}

const escape = (str: string) => str.replaceAll('@', '').replaceAll('#', '')

export const release: Ghost = async ({ payload, octokit }) => {
  const [version, publishedVersion] = await Promise.all([
    run('jq -r .version package.json').then(({ stdout }) => stdout.trim()),
    run('npm view . version').then(({ stdout }) => stdout.trim())
  ])

  if (version === publishedVersion) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No Version Changes',
        summary: 'No version changes'
      }
    }
  }

  await exec.exec('npm publish')
  await exec.exec(`gh release create v${version} --generate-notes`)

  const [packageName, repo_topics, keywords] = await Promise.all([
    run('npm view . name').then(({ stdout }) => stdout.trim()),
    octokit.rest.repos
      .getAllTopics({
        owner: payload.owner,
        repo: payload.repo
      })
      .then(({ data: { names } }) => names),
    run('jq -r .keywords[] package.json').then(({ stdout, exitCode }) =>
      exitCode === 0 ? stdout.split('\n') : []
    )
  ])

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

  const topics = [...new Set([...repo_topics, ...keywords])]
    .filter((x) => x)
    .map((topic) => `#${escape(topic.trim().replaceAll('-', ''))}`)
    .join(' ')

  const releaseLink = `https://github.com/${payload.owner}/${payload.repo}/releases/tag/v${version}`

  await Promise.all([
    enClient.v2.tweet({
      text: `${escape(packageName)} v${version} has been released.
${topics}
${releaseLink}`
    }),
    jpClient.v2.tweet({
      text: `${escape(packageName)} v${version} をリリースしました。
${topics}
${releaseLink}`
    })
  ])

  return 'success'
}
