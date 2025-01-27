import { decrypt } from '$shared/decrypt.js'
import * as core from '@actions/core'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from 'node:process'
import { findFile } from './findFile.js'
import { preRun } from './preRun.js'
import { Run } from './run.js'

export const injectEnvs = async (encrypted_envs?: string): Promise<Run> => {
  if (!encrypted_envs) {
    return preRun({})
  }

  const text = await decrypt(encrypted_envs, env.ENVS_PRIVATE_KEY!)

  const json = JSON.parse(text)

  Object.values(json).forEach((value) => {
    core.setSecret(value as string)
  })

  const path_list = await findFile('package.json')

  const gitIgnorePaths = await findFile('.gitignore')

  await Promise.all(
    gitIgnorePaths.map(async (path_to_gitignore) => {
      const text = await readFile(path_to_gitignore)
      const lines = text.toString().split('\n')
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
