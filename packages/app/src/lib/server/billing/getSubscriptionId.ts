import { STRIPE_SECRET_KEY } from '$env/static/private'

interface StripeSubscription {
  id: string
  status: string
}

interface StripeListResponse<T> {
  data: T[]
  has_more: boolean
}

export const getSubscriptionId = async (customer_id: string) => {
  const subscriptionUrl = new URL('https://api.stripe.com/v1/subscriptions')
  subscriptionUrl.searchParams.append('customer', customer_id)

  const subscriptionResponse = await fetch(subscriptionUrl.toString(), {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!subscriptionResponse.ok) {
    const errorText = await subscriptionResponse.text()
    console.error(`Failed to get subscription: ${errorText}`)
    return null
  }

  const subscriptionData: StripeListResponse<StripeSubscription> =
    await subscriptionResponse.json()

  return subscriptionData.data[0]?.id
}
