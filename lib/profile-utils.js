import { getSupabaseClient } from './supabaseClient'

export function buildDisplayName(profile, user) {
  const first = profile?.first_name?.trim() ?? ''
  const last = profile?.last_name?.trim() ?? ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (profile?.username?.trim()) return profile.username.trim()
  return user?.email?.split('@')[0] ?? 'Utilisateur'
}

export function getInitials(profile, user) {
  const name = buildDisplayName(profile, user)
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}

export async function uploadAvatar(userId, file) {
  const supabase = getSupabaseClient()
  const ext = file.name?.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export async function uploadVoiceMessage(userId, file) {
  const supabase = getSupabaseClient()
  const path = `${userId}/${Date.now()}.webm`

  const { error: uploadError } = await supabase.storage
    .from('voice-messages')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'audio/webm',
    })

  if (uploadError) throw uploadError
  return path
}

export async function getSignedVoiceUrl(path, expiresIn = 3600) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage
    .from('voice-messages')
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  return data?.signedUrl ?? ''
}
