import { getSubscriptionNameFromEmail } from '$lib/server/billing/getSubscriptionNameFromEmail.js'
import { run } from '$shared/db/run.js'
import dayjs from 'dayjs'

export const load = async ({ locals }) => {
  const { db, oauth_user } = locals

  const createUser = async () => {
    await run(
      db.insertInto('user').values({
        oauth_id: oauth_user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 0,
        updated_by: 0,
        plan_cache: 'FREE',
        plan_cached_at: new Date().toISOString()
      })
    )

    const me = await db
      .selectFrom('user')
      .selectAll()
      .where('oauth_id', '=', oauth_user.id)
      .executeTakeFirstOrThrow()

    return me
  }

  const me =
    (await db
      .selectFrom('user')
      .selectAll()
      .where('user.oauth_id', '=', oauth_user.id)
      .executeTakeFirst()) ?? (await createUser())

  if (
    dayjs().diff(dayjs(me.plan_cached_at), 'minute') > 1 ||
    dayjs().diff(dayjs(me.created_at), 'minute') < 1
  ) {
    const plan_name = await getSubscriptionNameFromEmail(oauth_user.email)

    const plan_cache = plan_name.toUpperCase().split(' ')[0] as
      | 'FREE'
      | 'STARTER'
      | 'PRO'

    await run(
      db
        .updateTable('user')
        .set({
          plan_cache,
          plan_cached_at: new Date().toISOString()
        })
        .where('id', '=', me.id)
    )
  }

  return {
    me,
    oauth_user
  }
}
