import { STRIPE_SECRET_KEY } from '$env/static/private'

export const getSubscriptionName = async (
  subscriptionId: string
): Promise<'Free Plan' | 'Starter Plan' | 'Pro Plan'> => {
  const subUrl = new URL(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`
  )

  subUrl.searchParams.append('expand[]', 'items.data.price.product')

  const subscriptionRes = await fetch(subUrl, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`
    }
  })

  if (!subscriptionRes.ok) {
    const errorText = await subscriptionRes.text()
    throw new Error(
      `Failed to retrieve Subscription. 
         Status: ${subscriptionRes.status}, Error: ${errorText}`
    )
  }

  const subscriptionData = await subscriptionRes.json()

  const subscriptionName =
    // @ts-expect-error TODO: Fix this
    subscriptionData.items?.data?.[0]?.price?.product?.name

  if (!subscriptionName) {
    throw new Error('Cannot find subscription name in the subscription data.')
  }

  return subscriptionName
}
