import { decrypt } from '$shared/decrypt.js'
import core from '@actions/core'
import { exec } from '@actions/exec'
import { writeFile } from 'node:fs/promises'
import { env } from 'node:process'

export const injectEnvs = async (encrypted_envs?: string) => {
  if (!encrypted_envs) {
    return
  }

  const text = await decrypt(encrypted_envs, env.ENVS_PRIVATE_KEY!)

  const json = JSON.parse(text)

  core.info(`Injecting envs: ${JSON.stringify(json, null, 2)}`)

  await Promise.all([
    ...Object.entries(json).map(([key, value]) => {
      exec(`export ${key}=${value}`)
    }),
    writeFile(
      '.env',
      Object.entries(json)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
    )
  ])
}
