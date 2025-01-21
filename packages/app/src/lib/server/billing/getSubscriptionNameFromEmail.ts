import { getCustomerId } from './getCustomerId'
import { getSubscriptionId } from './getSubscriptionId'
import { getSubscriptionName } from './getSubscriptionName'

export const getSubscriptionNameFromEmail = async (email: string) => {
  const customer_id = await getCustomerId(email)
  const subscription_id = await getSubscriptionId(customer_id)

  if (!subscription_id) {
    return 'Free Plan'
  }

  const subscription_name = await getSubscriptionName(subscription_id)
  return subscription_name
}
