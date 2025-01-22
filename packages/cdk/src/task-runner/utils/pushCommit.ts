import { run } from './run.js'

export const pushCommit = async (message: string, repo: string) => {
  await run('git config user.name wraith-ci[bot]', repo)
  await run(
    'git config user.email wraith-ci[bot]@users.noreply.github.com',
    repo
  )

  await run('git add .', repo)
  await run(`git commit -m ${message}`, repo)

  await run('git pull --rebase', repo)
  await run('git push origin', repo)
}
