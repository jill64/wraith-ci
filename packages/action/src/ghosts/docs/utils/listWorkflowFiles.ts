import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

export const listWorkflowFiles = async () => {
  const dirPath = '.github/workflows'
  const dir = await readdir(dirPath, {
    withFileTypes: true,
    recursive: true
  })

  const result = dir
    .filter((dirent) => dirent.isFile())
    .map(async (file) => ({
      name: file.name,
      data: await readFile(path.join(dirPath, file.name), 'utf-8')
    }))

  const list = await Promise.all(result)

  return list
}
