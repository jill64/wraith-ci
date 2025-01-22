import { readFile } from 'node:fs/promises'

export const getPackageJson = async (): Promise<unknown> => {
  try {
    const packageJson = await readFile('package.json', 'utf-8')
    return JSON.parse(packageJson)
  } catch {
    return null
  }
}
