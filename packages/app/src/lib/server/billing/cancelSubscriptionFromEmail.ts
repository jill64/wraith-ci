import { cancelSubscription } from './cancelSubscription'
import { getCustomerId } from './getCustomerId'
import { getSubscriptionId } from './getSubscriptionId'

export const cancelSubscriptionFromEmail = async (email: string) => {
  const customer_id = await getCustomerId(email)
  const subscription_id = await getSubscriptionId(customer_id)

  if (subscription_id) {
    await cancelSubscription(subscription_id)
  }
}
