import { ENVS_PUBLIC_KEY } from '$env/static/private'
import { run } from '$shared/db/run.js'
import { encrypt } from '$shared/encrypt.js'
import { ok } from '$shared/response/ok.js'
import { error } from '@sveltejs/kit'

export const PUT = async ({ request, locals: { db, github_user } }) => {
  const [token, me] = await Promise.all([
    request.text(),
    db
      .selectFrom('user')
      .select('id')
      .where('github_user_id', '=', github_user.id)
      .executeTakeFirstOrThrow()
  ])

  if (!token) {
    error(400, 'No token provided')
  }

  await run(
    db
      .updateTable('user')
      .set({
        encrypted_npm_token: await encrypt(token, ENVS_PUBLIC_KEY),
        updated_at: new Date().toISOString(),
        updated_by: me.id
      })
      .where('github_user_id', '=', github_user.id)
  )

  return ok
}
