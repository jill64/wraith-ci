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
  const [{ data: repository }, ignore_files, me] = await Promise.all([
    kit.repos.get({ owner, repo }),
    request.text(),
    db
      .selectFrom('user')
      .select('id')
      .where('github_user_id', '=', github_user.id)
      .executeTakeFirstOrThrow()
  ])

  const docs_json = JSON.parse(ignore_files)
  const isValid = isValidJson(docs_json)

  if (!isValid) {
    error(400, 'Invalid JSON')
  }

  await run(
    db
      .updateTable('repo')
      .set({
        ghost_docs_ignore_files: ignore_files,
        updated_at: new Date().toISOString(),
        updated_by: me.id
      })
      .where('github_repo_id', '=', repository.id)
  )

  return ok
}
