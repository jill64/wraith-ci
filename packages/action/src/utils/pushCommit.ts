import { Run } from './run.js'

export const pushCommit = async (message: string, run: Run) => {
  await run('git config user.name wraith-ci[bot]')
  await run('git config user.email wraith-ci[bot]@users.noreply.github.com')

  await run('git add .')
  await run(`git commit -m "${message}"`)

  await run('git pull --rebase')
  await run('git push origin')
}
