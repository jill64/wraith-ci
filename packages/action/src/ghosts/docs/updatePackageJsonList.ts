import * as core from 'octoflare/action/core'
import { ActionRepository } from '../../types/ActionRepository.js'
import { findFile } from '../../utils/findFile.js'
import { gitDiff } from '../../utils/gitDiff.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { run } from '../../utils/run.js'
import { updatePackageJson } from './updatePackageJson.js'

export const updatePackageJsonList = async ({
  repository
}: {
  repository: ActionRepository
}) => {
  const { owner } = repository

  const [files, html] = await Promise.all([
    findFile('package.json'),
    fetch(repository.html_url)
      .then((res) => res.text())
      .catch((e) => {
        core.error(e)
        return ''
      })
  ])

  const repoImage =
    html.match(/<meta property="og:image" content="(\S*)"\s*\/>/)?.[1] ?? ''

  const license = repository.license?.spdx_id
    ? { license: repository.license.spdx_id }
    : {}

  const repoLevelConfig = {
    ...license,
    bugs: `${repository.html_url}/issues`,
    author: {
      name: owner.login,
      email: owner.email ?? 'contact@jill64.dev',
      url: owner.html_url,
      image: owner.avatar_url
    },
    repository: {
      type: 'git',
      url: `git+${repository.clone_url}`,
      image: repoImage
    }
  }

  const result = await Promise.all(
    files.map(updatePackageJson({ repository, repoLevelConfig }))
  )

  if (!result.includes(true)) {
    return
  }

  await run('npm run format')

  const diff = await gitDiff()

  if (diff) {
    await pushCommit('chore: synchronize package.json')
  }
}
