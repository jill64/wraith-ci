import { ENVS_PRIVATE_KEY } from '$env/static/private'
import { run } from '$shared/db/run.js'
import { decrypt } from '$shared/decrypt.js'

type GhostBumpConfig = {
  major?: string
  minor?: string
  patch?: string
  skip?: string
  cumulative_update?: string
}

export const load = async ({
  locals: { kit, db, github_user },
  params: { repo, owner }
}) => {
  const { data: repository } = await kit.rest.repos.get({
    owner,
    repo
  })

  const db_repo = await db
    .selectFrom('repo')
    .select(['id', 'encrypted_envs', 'ignore_ghosts', 'ghost_bump_config'])
    .where('github_repo_id', '=', repository.id)
    .executeTakeFirst()

  const me = await db
    .selectFrom('user')
    .select('id')
    .where('github_user_id', '=', github_user.id)
    .executeTakeFirstOrThrow()

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

  const envs = db_repo?.encrypted_envs
    ? (JSON.parse(
        await decrypt(db_repo.encrypted_envs, ENVS_PRIVATE_KEY)
      ) as Record<string, string>)
    : {}

  const ignore_ghosts = db_repo?.ignore_ghosts
    ? (JSON.parse(db_repo.ignore_ghosts) as string[])
    : []

  const ghost_bump_configs = db_repo?.ghost_bump_config
    ? (JSON.parse(db_repo.ghost_bump_config) as GhostBumpConfig)
    : {}

  return {
    repository,
    envs,
    ignore_ghosts,
    ghost_bump_configs,
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
