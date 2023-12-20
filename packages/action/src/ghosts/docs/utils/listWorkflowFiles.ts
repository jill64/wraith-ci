import { attempt } from '@jill64/attempt'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

export const listWorkflowFiles = async () => {
  const dirPath = path.join(process.cwd(), '.github/workflows')

  const dir = await attempt(
    () =>
      readdir(dirPath, {
        withFileTypes: true,
        recursive: true
      }),
    []
  )

  const result = dir
    .filter((dirent) => dirent.isFile())
    .map(async (file) => {
      const filepath = path.join(dirPath, file.name)
      const data = await readFile(filepath, 'utf-8')

      return {
        name: file.name,
        data
      }
    })

  const list = await Promise.all(result)

  return list
}
