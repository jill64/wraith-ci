import { run } from './run.js'

export const gitClone = async (url: string, ref: string) => {
  await run(`git clone --depth 1 -b ${ref} ${url}`)
}
