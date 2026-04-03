import { redirect } from 'next/navigation'

export default function PremiumCancelPage() {
  redirect('/premium/success?canceled=1')
}
