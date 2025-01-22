import { readdir } from 'node:fs/promises'
import path from 'node:path'

export const findFile = async (filename: string): Promise<string[]> => {
  const all = await readdir(process.cwd(), {
    withFileTypes: true,
    recursive: true
  })

  const files = all
    .filter(
      (file) =>
        file.isFile() &&
        !file.parentPath.includes('node_modules/') &&
        file.name === filename
    )
    .map((file) => path.join(file.path, file.name))

  console.info(`[search "${filename}"]: ${JSON.stringify(files, null, 2)}}`)

  return files
}
