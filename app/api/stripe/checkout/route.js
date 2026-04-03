import { NextResponse } from 'next/server'
import { getStripe } from '../../../../lib/stripe'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!bearerToken) {
      return NextResponse.json({ error: 'Session utilisateur manquante.' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data: userData, error: userError } = await supabase.auth.getUser(bearerToken)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié.' }, { status: 401 })
    }

    const user = userData.user
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${siteUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/premium/cancel`,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Impossible de créer la session Stripe.' }, { status: 500 })
  }
}
