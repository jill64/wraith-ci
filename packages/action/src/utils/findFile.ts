import { readdir } from 'node:fs/promises'

export const findFile = async (filename: string): Promise<string[]> => {
  const all = await readdir('./', {
    withFileTypes: true,
    recursive: true
  })

  const files = all
    .filter(
      (file) =>
        file.isFile() &&
        !file.path.includes('node_modules/') &&
        file.name === filename
    )
    .map((file) => file.path + file.name)

  return files
}
