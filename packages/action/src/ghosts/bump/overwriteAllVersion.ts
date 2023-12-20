import { readFile, writeFile } from 'node:fs/promises'
import { findFile } from '../../utils/findFile.js'
import * as core from 'octoflare/action/core'

export const overwriteAllVersion = async (newVersion: string) => {
  const files = await findFile('package.json')

  core.info(`Detected package.json files: ${JSON.stringify(files, null, 2)}`)

  await Promise.allSettled(
    files.map(async (file) => {
      const str = await readFile(file, 'utf-8')

      const json = JSON.parse(str)

      if (!json.version) {
        core.info(`No version found in ${file}`)
        return
      }

      const newJsonStr = JSON.stringify(
        {
          ...json,
          version: newVersion
        },
        null,
        2
      )

      await writeFile(file, newJsonStr)
    })
  )
}
