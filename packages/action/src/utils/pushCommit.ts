import { exec } from '@actions/exec'

export const pushCommit = async (message: string) => {
  await exec('git config user.name wraith-ci[bot]')
  await exec('git config user.email wraith-ci[bot]@users.noreply.github.com')

  await exec('git add .')
  await exec('git commit', ['-m', message])

  await exec('git pull --rebase')
  await exec('git push origin')
}
