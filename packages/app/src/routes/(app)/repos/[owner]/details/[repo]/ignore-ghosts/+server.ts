import { run } from '$shared/db/run.js'
import { ok } from '$shared/response/ok.js'
import { error } from '@sveltejs/kit'

const isValidJson = (x: object) =>
  Array.isArray(x) && x.every((x) => typeof x === 'string')

export const PUT = async ({
  locals: { kit, db, github_user },
  params: { owner, repo },
  request
}) => {
  const [{ data: repository }, ghosts] = await Promise.all([
    kit.rest.repos.get({ owner, repo }),
    request.text()
  ])

  const ghosts_json = JSON.parse(ghosts)
  const isValid = isValidJson(ghosts_json)

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
        ignore_ghosts: ghosts,
        updated_at: new Date().toISOString(),
        updated_by: me.id
      })
      .where('github_repo_id', '=', repository.id)
  )

  return ok
}
