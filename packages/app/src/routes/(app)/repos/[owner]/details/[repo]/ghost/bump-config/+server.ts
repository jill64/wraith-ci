import { run } from '$shared/db/run.js'
import { ok } from '$shared/response/ok.js'
import { error } from '@sveltejs/kit'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  major: string,
  minor: string,
  patch: string,
  skip: string
})

export const PUT = async ({
  locals: { kit, db, github_user },
  params: { owner, repo },
  request
}) => {
  const [{ data: repository }, ghost_bump_config] = await Promise.all([
    kit.repos.get({ owner, repo }),
    request.text()
  ])

  const config_json = JSON.parse(ghost_bump_config)
  const isValid = isValidJson(config_json)

  if (!isValid) {
    error(400, 'Invalid JSON')
  }

  const me = await db
    .selectFrom('user')
    .select('id')
    .where('github_user_id', '=', github_user.id)
    .executeTakeFirstOrThrow()

  await run(
    db
      .updateTable('repo')
      .set({
        ghost_bump_config,
        updated_at: new Date().toISOString(),
        updated_by: me.id
      })
      .where('github_repo_id', '=', repository.id)
  )

  return ok
}
