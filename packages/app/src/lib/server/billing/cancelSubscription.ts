import { STRIPE_SECRET_KEY } from '$env/static/private'

export const cancelSubscription = async (subscriptionId: string) => {
  const url = `https://api.stripe.com/v1/subscriptions/${subscriptionId}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!response.ok) {
    throw new Error(
      `Failed to cancel subscription. Status: ${response.status} ${response.statusText}`
    )
  }

  return await response.json()
}
