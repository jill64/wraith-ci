import { ENVS_PRIVATE_KEY } from '$env/static/private'
import { decrypt } from '$shared/decrypt.js'
import { run } from '$shared/db/run.js'

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
    .select(['id', 'envs'])
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

  const envs = db_repo?.envs
    ? (JSON.parse(await decrypt(db_repo.envs, ENVS_PRIVATE_KEY)) as Record<
        string,
        string
      >)
    : {}

  return {
    repository,
    envs,
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
