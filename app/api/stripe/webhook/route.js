import { NextResponse } from 'next/server'
import { getStripe } from '../../../../lib/stripe'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export const runtime = 'nodejs'

function premiumStatusFromSubscription(status) {
  return ['active', 'trialing', 'past_due'].includes(status)
}

export async function POST(request) {
  const stripe = getStripe()
  const signature = request.headers.get('stripe-signature')
  const body = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    return NextResponse.json({ error: `Webhook signature invalide: ${error.message}` }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.user_id
      if (userId) {
        await supabase.from('profiles').update({
          is_premium: true,
          badge: 'premium',
          stripe_customer_id: session.customer?.toString() || null,
          stripe_subscription_id: session.subscription?.toString() || null,
          premium_since: new Date().toISOString(),
        }).eq('id', userId)
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const userId = subscription.metadata?.user_id
      const isPremium = premiumStatusFromSubscription(subscription.status)

      if (userId) {
        await supabase.from('profiles').update({
          is_premium: isPremium,
          badge: isPremium ? 'premium' : 'nouveau',
          stripe_customer_id: subscription.customer?.toString() || null,
          stripe_subscription_id: subscription.id,
        }).eq('id', userId)
      } else if (subscription.customer) {
        await supabase.from('profiles').update({
          is_premium: isPremium,
          badge: isPremium ? 'premium' : 'nouveau',
          stripe_subscription_id: subscription.id,
        }).eq('stripe_customer_id', subscription.customer.toString())
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Erreur webhook Stripe.' }, { status: 500 })
  }
}
