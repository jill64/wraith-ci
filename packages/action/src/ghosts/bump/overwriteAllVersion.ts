import { readFile, writeFile } from 'node:fs/promises'
import { findFile } from '../../utils/findFile.js'

export const overwriteAllVersion = async (newVersion: string) => {
  const files = await findFile('package.json')

  console.log('Detected package.json files:', files)

  await Promise.allSettled(
    files.map(async (file) => {
      const str = await readFile(file, 'utf-8')

      const json = JSON.parse(str)

      if (!json.version) {
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
