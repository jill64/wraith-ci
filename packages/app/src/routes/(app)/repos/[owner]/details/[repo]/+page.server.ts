import { ENVS_PRIVATE_KEY } from '$env/static/private'
import { run } from '$shared/db/run.js'
import { decrypt } from '$shared/decrypt.js'
import type { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig.js'
import { attempt } from '@jill64/attempt'

export const load = async ({
  locals: { kit, db, github_user },
  params: { repo, owner }
}) => {
  const { data: repository } = await kit.rest.repos.get({
    owner,
    repo
  })

  const [me, db_repo] = await Promise.all([
    db
      .selectFrom('user')
      .select('id')
      .where('github_user_id', '=', github_user.id)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom('repo')
      .select([
        'id',
        'encrypted_envs',
        'ignore_ghosts',
        'ghost_bump_config',
        'ghost_merge_ignores',
        'ghost_docs_ignore_files'
      ])
      .where('github_repo_id', '=', repository.id)
      .executeTakeFirst()
  ])

  if (!db_repo) {
    await run(
      db.insertInto('repo').values({
        github_repo_id: repository.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: me.id,
        updated_by: me.id
      })
    )
  }

  const envs = await attempt(
    async () =>
      db_repo?.encrypted_envs
        ? JSON.parse(await decrypt(db_repo.encrypted_envs, ENVS_PRIVATE_KEY))
        : ({} as Record<string, string>),
    {}
  )

  const ignore_ghosts = attempt(
    () =>
      db_repo?.ignore_ghosts
        ? (JSON.parse(db_repo.ignore_ghosts) as string[])
        : [],
    []
  )

  const ghost_bump_configs = attempt(
    () =>
      db_repo?.ghost_bump_config
        ? (JSON.parse(db_repo.ghost_bump_config) as GhostBumpConfig)
        : {},
    {}
  )

  const ghost_merge_ignores = attempt(
    () =>
      db_repo?.ghost_merge_ignores
        ? (JSON.parse(db_repo.ghost_merge_ignores) as string[])
        : [],
    []
  )

  const ghost_docs_ignore_files = attempt(
    () =>
      db_repo?.ghost_docs_ignore_files
        ? (JSON.parse(db_repo.ghost_docs_ignore_files) as string[])
        : [],
    []
  )

  return {
    repository,
    envs,
    ignore_ghosts,
    ghost_bump_configs,
    ghost_merge_ignores,
    ghost_docs_ignore_files,
    title: {
      en: `${repo} - Repository`,
      ja: `${repo} - リポジトリ`
    },
    description: {
      en: `Repository ${repo}`,
      ja: `リポジトリ ${repo}`
    }
  }
}
