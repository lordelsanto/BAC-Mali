'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '../../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'

/* ─────────────────────────────────────────
   CONSTANTES & UTILITAIRES
───────────────────────────────────────── */
const CAT_COLORS = {
  Orientation: '#2563EB', Cours: '#7C3AED', Examen: '#DC2626',
  Université: '#0891B2', Bourse: '#D97706', Conseils: '#059669', Autres: '#6B7280'
}

const BADGE_CFG = {
  nouveau:    { label: 'Nouveau',    icon: '🌱', color: '#6B7280' },
  actif:      { label: 'Actif',      icon: '⚡', color: '#2563EB' },
  tres_actif: { label: 'Très Actif', icon: '🔥', color: '#D97706' },
  expert:     { label: 'Expert',     icon: '🏆', color: '#059669' },
  premium:    { label: 'Premium',    icon: '⭐', color: '#7C3AED' },
}

const INDENT_COLORS = ['#1B6B3A', '#2563EB', '#7C3AED', '#D97706', '#059669']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'à l\'instant'
  if (m < 60)  return `il y a ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `il y a ${h}h`
  const d = Math.floor(h / 24)
  return d < 30 ? `il y a ${d}j` : new Date(dateStr).toLocaleDateString('fr-FR')
}

function avatarUrl(username) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username ?? 'U')}&backgroundColor=145a30&textColor=ffffff&fontSize=38`
}

/* Construit l'arbre de commentaires depuis un tableau plat */
function buildTree(flatList) {
  const map = {}
  const roots = []
  flatList.forEach(c => { map[c.id] = { ...c, children: [] } })
  flatList.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id])
    } else {
      roots.push(map[c.id])
    }
  })
  return roots
}

/* ─────────────────────────────────────────
   COMPOSANTS PARTAGÉS
───────────────────────────────────────── */
function BadgeChip({ badge }) {
  const cfg = BADGE_CFG[badge] ?? BADGE_CFG.nouveau
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 100, fontSize: 10, fontWeight: 700,
      background: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}40`
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

/* ─────────────────────────────────────────
   BOUTONS DE VOTE
───────────────────────────────────────── */
function VoteButtons({ score, userVote, onVote, disabled, size = 'md' }) {
  const isSmall = size === 'sm'
  const btnStyle = (active, dir) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: isSmall ? 26 : 32, height: isSmall ? 26 : 32, borderRadius: 8,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    background: active ? (dir === 1 ? 'var(--green-50)' : '#FEF2F2') : 'var(--paper)',
    color: active ? (dir === 1 ? 'var(--green-700)' : '#DC2626') : 'var(--ink-4)',
    fontSize: isSmall ? 13 : 15, transition: 'all .15s',
    opacity: disabled && !active ? 0.5 : 1,
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        style={btnStyle(userVote === 1, 1)}
        onClick={() => !disabled && onVote(1)}
        title="Upvote"
      >▲</button>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 500,
        fontSize: isSmall ? 13 : 15, minWidth: 20, textAlign: 'center',
        color: score > 0 ? 'var(--green-700)' : score < 0 ? '#DC2626' : 'var(--ink-3)'
      }}>{score}</span>
      <button
        style={btnStyle(userVote === -1, -1)}
        onClick={() => !disabled && onVote(-1)}
        title="Downvote"
      >▼</button>
    </div>
  )
}

/* ─────────────────────────────────────────
   NŒUD DE COMMENTAIRE (récursif)
───────────────────────────────────────── */
function CommentNode({ comment, depth, user, supabase, onVoteComment, onCommentAdded, postAuthorId }) {
  const [replying, setReplying]   = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [posting, setPosting]     = useState(false)
  const [postErr, setPostErr]     = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const textareaRef = useRef(null)
  const maxDepth = 5

  async function handleReply(e) {
    e.preventDefault()
    if (!replyBody.trim()) return
    setPosting(true); setPostErr('')

    // Anti-spam
    const { data: canPost } = await supabase.rpc('can_create_comment')
    if (!canPost) {
      setPostErr('Attendez quelques secondes avant de répondre à nouveau.')
      setPosting(false); return
    }

    const { error } = await supabase.from('forum_comments').insert({
      post_id:   comment.post_id,
      user_id:   user.id,
      parent_id: comment.id,
      body:      replyBody.trim(),
      depth:     Math.min(depth + 1, maxDepth),
    })

    if (error) {
      setPostErr('Erreur : ' + error.message)
    } else {
      setReplyBody(''); setReplying(false)
      onCommentAdded()
    }
    setPosting(false)
  }

  // Focus textarea on reply open
  useEffect(() => {
    if (replying && textareaRef.current) textareaRef.current.focus()
  }, [replying])

  const indentColor = INDENT_COLORS[depth % INDENT_COLORS.length]
  const hasReplies = comment.children?.length > 0

  return (
    <div style={{ marginLeft: depth > 0 ? Math.min(depth * 18, 72) : 0 }}>
      <div className={`c-node${comment.is_best ? ' c-best' : ''}`}
           style={{ borderLeftColor: depth > 0 ? indentColor + '50' : 'transparent' }}>
        {/* Header */}
        <div className="c-header">
          <div className="c-author-row">
            <img
              src={comment.avatar_url ?? avatarUrl(comment.username)}
              alt="" className="c-avatar"
            />
            <strong className="c-username">{comment.username ?? 'Anonyme'}</strong>
            {comment.badge && <BadgeChip badge={comment.badge} />}
            {comment.user_id === postAuthorId && (
              <span className="c-op-tag">Auteur</span>
            )}
            {comment.is_best && (
              <span className="c-best-tag">✅ Meilleure réponse</span>
            )}
            <span className="c-time">{timeAgo(comment.created_at)}</span>
          </div>
          {hasReplies && (
            <button className="c-collapse-btn" onClick={() => setCollapsed(p => !p)}>
              {collapsed ? `[+${comment.children.length} réponse${comment.children.length > 1 ? 's' : ''}]` : '[-]'}
            </button>
          )}
        </div>

        {/* Body */}
        {!collapsed && (
          <>
            <p className="c-body">{comment.body}</p>

            {/* Actions */}
            <div className="c-actions">
              <VoteButtons
                score={comment.votes_score}
                userVote={comment._userVote ?? 0}
                onVote={v => onVoteComment(comment.id, v)}
                disabled={!user}
                size="sm"
              />
              {user && depth < maxDepth && (
                <button className="c-action-btn" onClick={() => setReplying(r => !r)}>
                  {replying ? '✕ Annuler' : '↩ Répondre'}
                </button>
              )}
            </div>

            {/* Reply form */}
            {replying && (
              <form className="c-reply-form" onSubmit={handleReply}>
                <textarea
                  ref={textareaRef}
                  className="c-reply-textarea"
                  placeholder={`Répondre à ${comment.username ?? 'ce commentaire'}…`}
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  rows={3}
                  maxLength={2000}
                />
                {postErr && <div className="c-reply-err">{postErr}</div>}
                <div className="c-reply-footer">
                  <span className="c-char-count">{replyBody.length}/2000</span>
                  <button className="c-reply-submit" type="submit" disabled={posting || !replyBody.trim()}>
                    {posting ? 'Envoi…' : 'Publier'}
                  </button>
                </div>
              </form>
            )}

            {/* Enfants (nested) */}
            {hasReplies && comment.children.map(child => (
              <CommentNode
                key={child.id}
                comment={child}
                depth={depth + 1}
                user={user}
                supabase={supabase}
                onVoteComment={onVoteComment}
                onCommentAdded={onCommentAdded}
                postAuthorId={postAuthorId}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────── */
export default function PostDetailPage() {
  const { id }      = useParams()
  const router      = useRouter()
  const { user }    = useAuth()
  const supabase    = getSupabaseClient()

  const [post, setPost]         = useState(null)
  const [comments, setComments] = useState([])
  const [userVotes, setUserVotes] = useState({}) // { target_id: value }
  const [loading, setLoading]   = useState(true)
  const [postScore, setPostScore] = useState(0)
  const [userPostVote, setUserPostVote] = useState(0)

  const [rootBody, setRootBody] = useState('')
  const [posting, setPosting]   = useState(false)
  const [postErr, setPostErr]   = useState('')
  const [postSort, setPostSort] = useState('best') // 'best' | 'recent' | 'top'

  /* ── Chargement du post ── */
  const loadPost = useCallback(async () => {
    const { data, error } = await supabase
      .from('forum_posts_view')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) { router.push('/forum'); return }
    setPost(data)
    setPostScore(data.votes_score)
    // Incrémenter les vues
    supabase.rpc('increment_post_views', { p_post_id: id })
  }, [id])

  /* ── Chargement des commentaires ── */
  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('forum_comments_view')
      .select('id, post_id, parent_id, body, depth, votes_score, is_best, created_at, user_id, username, avatar_url, badge, reputation')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
  }, [id])

  /* ── Votes de l'utilisateur ── */
  const loadUserVotes = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('forum_votes')
      .select('target_id, target_type, value')
      .eq('user_id', user.id)
    const map = {}
    ;(data ?? []).forEach(v => { map[v.target_id] = v.value })
    setUserVotes(map)
    setUserPostVote(map[id] ?? 0)
  }, [user, id])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadPost(), loadComments(), loadUserVotes()]).then(() => setLoading(false))
  }, [id])

  useEffect(() => { loadUserVotes() }, [user])

  /* ── Vote sur le post (optimiste) ── */
  async function handlePostVote(value) {
    if (!user) return
    const prev = userPostVote
    // Optimistic update
    const newVote  = prev === value ? 0 : value
    const delta    = newVote - prev
    setUserPostVote(newVote)
    setPostScore(s => s + delta)

    const { data, error } = await supabase.rpc('vote_on_post', { p_post_id: id, p_value: value })
    if (error || !data?.length) {
      // Rollback
      setUserPostVote(prev)
      setPostScore(s => s - delta)
    } else {
      setPostScore(data[0].new_score)
      setUserPostVote(data[0].user_vote)
    }
  }

  /* ── Vote sur un commentaire (optimiste) ── */
  async function handleCommentVote(commentId, value) {
    if (!user) return
    const prev = userVotes[commentId] ?? 0
    const newVote = prev === value ? 0 : value
    const delta = newVote - prev

    setUserVotes(uv => ({ ...uv, [commentId]: newVote }))
    setComments(cs => cs.map(c => c.id === commentId ? { ...c, votes_score: c.votes_score + delta } : c))

    const { data, error } = await supabase.rpc('vote_on_comment', { p_comment_id: commentId, p_value: value })
    if (error || !data?.length) {
      setUserVotes(uv => ({ ...uv, [commentId]: prev }))
      setComments(cs => cs.map(c => c.id === commentId ? { ...c, votes_score: c.votes_score - delta } : c))
    } else {
      setUserVotes(uv => ({ ...uv, [commentId]: data[0].user_vote }))
      setComments(cs => cs.map(c => c.id === commentId ? { ...c, votes_score: data[0].new_score } : c))
    }
  }

  /* ── Poster un commentaire racine ── */
  async function handleRootComment(e) {
    e.preventDefault()
    if (!rootBody.trim()) return
    setPosting(true); setPostErr('')

    const { data: canPost } = await supabase.rpc('can_create_comment')
    if (!canPost) {
      setPostErr('Attendez quelques secondes avant de poster à nouveau.')
      setPosting(false); return
    }

    const { error } = await supabase.from('forum_comments').insert({
      post_id: id,
      user_id: user.id,
      body:    rootBody.trim(),
      depth:   0,
    })

    if (error) {
      setPostErr('Erreur : ' + error.message)
    } else {
      setRootBody('')
      await loadComments()
      await loadUserVotes()
    }
    setPosting(false)
  }

  /* ── Marquer résolu ── */
  async function toggleResolved() {
    if (!post || post.user_id !== user?.id) return
    const { error } = await supabase
      .from('forum_posts')
      .update({ is_resolved: !post.is_resolved })
      .eq('id', id)
    if (!error) setPost(p => ({ ...p, is_resolved: !p.is_resolved }))
  }

  /* ── Tri des commentaires ── */
  function sortedComments(flat) {
    const copy = [...flat]
    if (postSort === 'top')    return copy.sort((a, b) => b.votes_score - a.votes_score)
    if (postSort === 'recent') return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    // 'best': meilleure réponse d'abord, puis score
    return copy.sort((a, b) => {
      if (a.is_best && !b.is_best) return -1
      if (!a.is_best && b.is_best) return  1
      return b.votes_score - a.votes_score
    })
  }

  /* ── Ajout commentaire après reply nested ── */
  async function onCommentAdded() {
    await loadComments()
    await loadUserVotes()
  }

  /* ── Enrichir les commentaires avec userVotes ── */
  const enrichedComments = comments.map(c => ({ ...c, _userVote: userVotes[c.id] ?? 0 }))
  const commentTree = buildTree(sortedComments(enrichedComments))
  const rootComments = commentTree.filter(c => !c.parent_id)

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontFamily: 'var(--font-body)' }}>
      Chargement…
    </div>
  )

  if (!post) return null

  const catColor = CAT_COLORS[post.categorie] ?? '#6B7280'

  /* ─────────── RENDER ─────────── */
  return (
    <>
      <style>{`
        /* ══ POST DETAIL ══ */
        .pd-wrap { max-width: 860px; margin: 0 auto; padding: 28px 16px 72px; }
        .pd-back {
          display: inline-flex; align-items: center; gap: 6px; margin-bottom: 18px;
          font-size: 13px; color: var(--ink-3); background: none; border: none;
          cursor: pointer; padding: 0; font-family: var(--font-body); transition: color .15s;
          text-decoration: none;
        }
        .pd-back:hover { color: var(--green-700); }

        /* Post card */
        .pd-post {
          background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);
          padding: 28px 32px; margin-bottom: 20px;
        }
        @media (max-width: 600px) { .pd-post { padding: 20px 18px; } }

        .pd-post-top { display: flex; align-items: flex-start; gap: 20px; }
        .pd-vote-col { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 4px; }
        .pd-post-body-col { flex: 1; min-width: 0; }

        .pd-tags { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
        .pd-cat-badge {
          padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600;
          background: ${catColor}14; color: ${catColor}; border: 1px solid ${catColor}28;
        }
        .pd-resolved-badge {
          padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600;
          background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0;
        }
        .pd-titre { font-family: var(--font-display); font-size: clamp(20px, 3.5vw, 28px); font-weight: 500; color: var(--ink); line-height: 1.25; margin-bottom: 16px; }
        .pd-text { font-size: 15px; color: var(--ink-2); line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
        .pd-meta { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--paper-2); }
        .pd-author { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--ink-3); }
        .pd-author strong { color: var(--ink); font-weight: 600; }
        .pd-author-avatar { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid var(--paper-2); }
        .pd-rep { font-size: 12px; color: var(--ink-4); }
        .pd-actions-row { display: flex; gap: 10px; align-items: center; margin-left: auto; }
        .pd-action-btn {
          padding: 6px 12px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
          background: var(--paper); border: 1.5px solid var(--paper-2); color: var(--ink-3);
          cursor: pointer; font-family: var(--font-body); transition: all .15s;
        }
        .pd-action-btn:hover { border-color: var(--green-300); color: var(--green-700); }
        .pd-action-btn.resolve { background: #D1FAE5; color: #065F46; border-color: #A7F3D0; }

        /* Comments section */
        .comments-section { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); padding: 24px 28px; }
        @media (max-width: 600px) { .comments-section { padding: 18px 16px; } }

        .cs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
        .cs-title { font-size: 15px; font-weight: 700; color: var(--ink); }
        .cs-sort { display: flex; gap: 4px; }
        .cs-sort-btn {
          padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600;
          background: var(--paper); border: 1.5px solid var(--paper-2); color: var(--ink-4);
          cursor: pointer; font-family: var(--font-body); transition: all .15s;
        }
        .cs-sort-btn:hover, .cs-sort-btn.active { background: var(--green-50); border-color: var(--green-300); color: var(--green-700); }

        /* Comment form */
        .root-comment-form { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1.5px solid var(--paper-2); }
        .rcf-label { font-size: 13px; font-weight: 600; color: var(--ink-2); margin-bottom: 8px; }
        .rcf-textarea {
          width: 100%; padding: 12px 14px; border-radius: var(--radius-md); min-height: 90px;
          border: 1.5px solid var(--paper-2); background: var(--paper); resize: vertical;
          font-family: var(--font-body); font-size: 14px; color: var(--ink); outline: none;
          transition: all .2s;
        }
        .rcf-textarea:focus { border-color: var(--green-500); background: var(--white); box-shadow: 0 0 0 3px rgba(46,154,92,.1); }
        .rcf-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .rcf-count { font-size: 11px; color: var(--ink-4); }
        .rcf-submit {
          padding: 10px 22px; background: var(--green-700); color: white; border: none;
          border-radius: var(--radius-md); font-family: var(--font-body); font-size: 14px;
          font-weight: 600; cursor: pointer; transition: background .15s;
        }
        .rcf-submit:hover:not(:disabled) { background: var(--green-800); }
        .rcf-submit:disabled { opacity: .6; cursor: not-allowed; }
        .rcf-err { font-size: 12px; color: #DC2626; margin-top: 6px; }
        .auth-hint { padding: 14px 18px; background: var(--gold-50); border: 1px solid var(--gold-100); border-radius: var(--radius-md); font-size: 14px; color: var(--gold-700); }
        .auth-hint a { color: var(--green-700); font-weight: 600; text-decoration: none; }

        /* Comment nodes */
        .c-node {
          padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 8px;
          background: var(--paper); border-left: 3px solid transparent;
          transition: background .15s;
        }
        .c-node:hover { background: var(--white); }
        .c-node.c-best { background: #ECFDF5; border-left-color: var(--green-500) !important; }

        .c-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
        .c-author-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .c-avatar { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--paper-2); }
        .c-username { font-size: 13px; font-weight: 700; color: var(--ink-2); }
        .c-time { font-size: 11px; color: var(--ink-4); }
        .c-op-tag { padding: 1px 6px; border-radius: 100px; font-size: 10px; font-weight: 700; background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200); }
        .c-best-tag { padding: 1px 7px; border-radius: 100px; font-size: 10px; font-weight: 700; background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
        .c-collapse-btn { font-size: 11px; color: var(--ink-4); background: none; border: none; cursor: pointer; padding: 0; font-family: var(--font-body); white-space: nowrap; }
        .c-collapse-btn:hover { color: var(--green-700); }

        .c-body { font-size: 14px; color: var(--ink-2); line-height: 1.7; white-space: pre-wrap; word-break: break-word; margin-bottom: 10px; }

        .c-actions { display: flex; align-items: center; gap: 10px; }
        .c-action-btn {
          padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
          background: none; border: 1px solid var(--paper-2); color: var(--ink-4);
          cursor: pointer; font-family: var(--font-body); transition: all .15s;
        }
        .c-action-btn:hover { border-color: var(--green-300); color: var(--green-700); background: var(--green-50); }

        .c-reply-form { margin-top: 10px; }
        .c-reply-textarea {
          width: 100%; padding: 10px 12px; border-radius: var(--radius-md); min-height: 72px;
          border: 1.5px solid var(--paper-2); background: var(--white); resize: vertical;
          font-family: var(--font-body); font-size: 13px; color: var(--ink); outline: none;
          transition: all .2s;
        }
        .c-reply-textarea:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(46,154,92,.1); }
        .c-reply-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
        .c-char-count { font-size: 11px; color: var(--ink-4); }
        .c-reply-submit {
          padding: 7px 18px; background: var(--green-700); color: white; border: none;
          border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 13px;
          font-weight: 600; cursor: pointer; transition: background .15s;
        }
        .c-reply-submit:hover:not(:disabled) { background: var(--green-800); }
        .c-reply-submit:disabled { opacity: .6; cursor: not-allowed; }
        .c-reply-err { font-size: 12px; color: #DC2626; margin-top: 4px; }

        .no-comments { text-align: center; padding: 36px 20px; color: var(--ink-3); font-size: 14px; }
      `}</style>

      <div className="pd-wrap">
        {/* Back */}
        <Link href="/forum" className="pd-back">← Retour au forum</Link>

        {/* ── Post ── */}
        <div className="pd-post">
          <div className="pd-post-top">
            {/* Vote col */}
            <div className="pd-vote-col">
              <VoteButtons
                score={postScore}
                userVote={userPostVote}
                onVote={handlePostVote}
                disabled={!user}
              />
            </div>

            {/* Content */}
            <div className="pd-post-body-col">
              <div className="pd-tags">
                <span className="pd-cat-badge">{post.categorie}</span>
                {post.is_resolved && <span className="pd-resolved-badge">✅ Résolu</span>}
              </div>
              <h1 className="pd-titre">{post.titre}</h1>
              <p className="pd-text">{post.body}</p>

              <div className="pd-meta">
                <div className="pd-author">
                  <img
                    src={post.avatar_url ?? avatarUrl(post.username)}
                    alt="" className="pd-author-avatar"
                  />
                  <strong>{post.username ?? 'Anonyme'}</strong>
                  {post.badge && <BadgeChip badge={post.badge} />}
                </div>
                <span className="pd-rep">🏆 {post.reputation ?? 0} pts</span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>🕐 {timeAgo(post.created_at)}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>👁 {post.views_count ?? 0} vues</span>

                {user?.id === post.user_id && (
                  <div className="pd-actions-row">
                    <button
                      className={`pd-action-btn${post.is_resolved ? ' resolve' : ''}`}
                      onClick={toggleResolved}
                    >
                      {post.is_resolved ? '✅ Résolu' : '○ Marquer résolu'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Commentaires ── */}
        <div className="comments-section">
          <div className="cs-header">
            <span className="cs-title">💬 {comments.length} réponse{comments.length !== 1 ? 's' : ''}</span>
            <div className="cs-sort">
              {[
                { key: 'best',   label: '⭐ Meilleurs' },
                { key: 'top',    label: '🔥 Top' },
                { key: 'recent', label: '🕐 Récents' },
              ].map(s => (
                <button
                  key={s.key}
                  className={`cs-sort-btn${postSort === s.key ? ' active' : ''}`}
                  onClick={() => setPostSort(s.key)}
                >{s.label}</button>
              ))}
            </div>
          </div>

          {/* Form */}
          {user ? (
            <div className="root-comment-form">
              <div className="rcf-label">✍️ Votre réponse</div>
              <form onSubmit={handleRootComment}>
                <textarea
                  className="rcf-textarea"
                  placeholder="Partagez votre expérience ou votre conseil…"
                  value={rootBody}
                  onChange={e => setRootBody(e.target.value)}
                  maxLength={2000}
                />
                {postErr && <div className="rcf-err">{postErr}</div>}
                <div className="rcf-footer">
                  <span className="rcf-count">{rootBody.length}/2000</span>
                  <button className="rcf-submit" type="submit" disabled={posting || !rootBody.trim()}>
                    {posting ? 'Publication…' : 'Publier la réponse'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="auth-hint" style={{ marginBottom: 20 }}>
              <Link href="/compte">Connectez-vous</Link> ou <Link href="/compte">créez un compte</Link> pour répondre.
            </div>
          )}

          {/* Tree */}
          {rootComments.length === 0 ? (
            <div className="no-comments">Aucune réponse pour l'instant. Soyez le premier !</div>
          ) : (
            rootComments.map(c => (
              <CommentNode
                key={c.id}
                comment={c}
                depth={0}
                user={user}
                supabase={supabase}
                onVoteComment={handleCommentVote}
                onCommentAdded={onCommentAdded}
                postAuthorId={post.user_id}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
