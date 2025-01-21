import { STRIPE_SECRET_KEY } from '$env/static/private'

interface StripeCustomer {
  id: string
  email: string | null
}

interface StripeListResponse<T> {
  data: T[]
  has_more: boolean
}

export const getCustomerId = async (email: string) => {
  const customerUrl = new URL('https://api.stripe.com/v1/customers')
  customerUrl.searchParams.append('email', email)

  const customerResponse = await fetch(customerUrl.toString(), {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!customerResponse.ok) {
    const errorText = await customerResponse.text()
    throw new Error(`Failed to get customer: ${errorText}`)
  }

  const customerData: StripeListResponse<StripeCustomer> =
    await customerResponse.json()

  return customerData.data[0]?.id
}
