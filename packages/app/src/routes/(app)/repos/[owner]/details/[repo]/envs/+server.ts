import { ENVS_PUBLIC_KEY } from '$env/static/private'
import { encrypt } from '$lib/server/encrypt.js'
import { run } from '$shared/db/run.js'
import { ok } from '$shared/response/ok.js'

export const PUT = async ({
  locals: { kit, db, github_user },
  params: { owner, repo },
  request
}) => {
  const [{ data: repository }, envs] = await Promise.all([
    kit.repos.get({ owner, repo }),
    request.text()
  ])

  const [encrypted_envs, me] = await Promise.all([
    encrypt(envs, ENVS_PUBLIC_KEY),
    db
      .selectFrom('user')
      .select('id')
      .where('github_user_id', '=', github_user.id)
      .executeTakeFirstOrThrow()
  ])

  await run(
    db
      .updateTable('repo')
      .set({
        envs: encrypted_envs,
        updated_at: new Date().toISOString(),
        updated_by: me.id
      })
      .where('github_repo_id', '=', repository.id)
  )

  return ok
}
