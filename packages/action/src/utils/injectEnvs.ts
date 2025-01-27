import { decrypt } from '$shared/decrypt.js'
import { WraithPayload } from '$shared/ghost/types/WraithPayload.js'
import * as core from '@actions/core'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from 'node:process'
import { findFile } from './findFile.js'
import { preRun } from './preRun.js'
import { Run } from './run.js'

export const injectEnvs = async ({
  encrypted_envs,
  encrypted_npm_token
}: WraithPayload): Promise<Run> => {
  if (!encrypted_envs) {
    return preRun({})
  }

  const text = await decrypt(encrypted_envs, env.ENVS_PRIVATE_KEY!)
  const npm_token = encrypted_npm_token
    ? await decrypt(encrypted_npm_token, env.NPM_TOKEN_PRIVATE_KEY!)
    : ''

  core.setSecret(npm_token)

  const json = {
    ...JSON.parse(text),
    NODE_AUTH_TOKEN: npm_token
  }

  Object.values(json).forEach((value) => {
    core.setSecret(value as string)
  })

  const path_list = await findFile('package.json')

  const gitIgnorePaths = await findFile('.gitignore')

  await Promise.all(
    gitIgnorePaths.map(async (path_to_gitignore) => {
      const text = await readFile(path_to_gitignore, 'utf-8')
      const lines = text.split('\n')
      if (!lines.includes('.env')) {
        await writeFile(path_to_gitignore, [...lines, '.env'].join('\n'))
      }
    })
  )

  await Promise.all(
    path_list.map(async (path_to_json) => {
      await writeFile(
        path.join(path_to_json.replace('package.json', ''), '.env'),
        Object.entries(json)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n')
      )
    })
  )

  return preRun(json)
}
