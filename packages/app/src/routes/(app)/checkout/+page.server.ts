import { STRIPE_SECRET_KEY } from '$env/static/private'
import { getSubscriptionName } from '$lib/server/billing/getSubscriptionName.js'
import { run } from '$shared/db/run.js'
import { error } from '@sveltejs/kit'

const get_subscription_id = async (sessionId: string) => {
  const sessionRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`
      }
    }
  )

  if (!sessionRes.ok) {
    const errorText = await sessionRes.text()
    throw new Error(
      `Failed to retrieve Checkout Session. 
       Status: ${sessionRes.status}, Error: ${errorText}`
    )
  }

  const sessionData = (await sessionRes.json()) as { subscription: string }

  const subscriptionId = sessionData.subscription

  if (typeof subscriptionId !== 'string') {
    throw new Error('Cannot find subscription ID in the session data.')
  }

  return subscriptionId
}

export const load = async ({ url, locals: { db }, parent }) => {
  const checkout_session_id = url.searchParams.get('id')

  if (!checkout_session_id) {
    error(400, 'Invalid request')
  }
  const [{ me }, subscription_id] = await Promise.all([
    parent(),
    get_subscription_id(checkout_session_id)
  ])

  const selected_plan = await getSubscriptionName(subscription_id)

  const plan_cache = selected_plan.toUpperCase().split(' ')[0] as
    | 'FREE'
    | 'STARTER'
    | 'PRO'

  await run(
    db
      .updateTable('user')
      .set({
        plan_cache,
        plan_cached_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: me.id
      })
      .where('id', '=', me.id)
  )

  return {
    selected_plan
  }
}
