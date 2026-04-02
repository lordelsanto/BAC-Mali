'use client'

import { useState, useEffect, useCallback } from 'react'
import Link                                  from 'next/link'
import { getSupabaseClient }                 from '../../lib/supabaseClient'
import { useAuth }                           from '../contexts/AuthContext'

const CATEGORIES = ['Toutes', 'Inscription', 'CENOU / Bourse', 'Orientation', 'Résultats BAC', 'Vie étudiante', 'Autre']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'à l\'instant'
  if (m < 60)  return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30)  return `il y a ${d}j`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

/* ──────────── LISTE DES QUESTIONS ──────────── */
function QuestionList({ onOpen }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [cat, setCat]             = useState('Toutes')
  const supabase = getSupabaseClient()

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('forum_questions')
      .select('id, titre, categorie, created_at, answer_count, is_resolved, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (cat !== 'Toutes') q = q.eq('categorie', cat)
    const { data } = await q
    setQuestions(data ?? [])
    setLoading(false)
  }, [cat])

  useEffect(() => { load() }, [load])

  return (
    <>
      <style>{`
        .qlist-cats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .qlist-cat {
          padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
          border: 1.5px solid var(--paper-2); background: var(--white); color: var(--ink-3);
          cursor: pointer; transition: all .15s; font-family: var(--font-body);
        }
        .qlist-cat:hover  { border-color: var(--green-300); color: var(--green-700); }
        .qlist-cat.active { background: var(--green-700); border-color: var(--green-700); color: white; }
        .q-items { display: flex; flex-direction: column; gap: 10px; }
        .q-item {
          background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--paper-2);
          padding: 18px 20px; cursor: pointer; transition: border-color .15s, box-shadow .15s;
        }
        .q-item:hover { border-color: var(--green-300); box-shadow: var(--shadow-sm); }
        .q-item-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
        .q-cat-badge {
          padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
          background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200);
          white-space: nowrap; flex-shrink: 0;
        }
        .q-cat-badge.resolved { background: var(--gold-50); color: var(--gold-700); border-color: var(--gold-100); }
        .q-titre { font-size: 15px; font-weight: 600; color: var(--ink); line-height: 1.3; flex: 1; }
        .q-meta { display: flex; gap: 14px; font-size: 12px; color: var(--ink-4); flex-wrap: wrap; }
        .q-meta strong { color: var(--ink-3); }
        .loading-msg { text-align: center; padding: 40px; color: var(--ink-3); font-size: 14px; }
        .empty-msg { text-align: center; padding: 40px 20px; color: var(--ink-3); }
        .empty-msg h3 { font-family: var(--font-display); font-size: 18px; color: var(--ink); margin-bottom: 6px; }
      `}</style>
      <div className="qlist-cats">
        {CATEGORIES.map(c => (
          <button key={c} className={`qlist-cat${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {loading ? (
        <div className="loading-msg">Chargement des questions…</div>
      ) : questions.length === 0 ? (
        <div className="empty-msg">
          <h3>Aucune question pour l'instant</h3>
          <p>Soyez le(la) premier(ère) à poser une question !</p>
        </div>
      ) : (
        <div className="q-items">
          {questions.map(q => (
            <div key={q.id} className="q-item" onClick={() => onOpen(q)}>
              <div className="q-item-top">
                <span className={`q-cat-badge${q.is_resolved ? ' resolved' : ''}`}>
                  {q.is_resolved ? '✅ Résolu' : q.categorie}
                </span>
                <span className="q-titre">{q.titre}</span>
              </div>
              <div className="q-meta">
                <span>👤 <strong>{q.profiles?.username ?? 'Anonyme'}</strong></span>
                <span>💬 <strong>{q.answer_count ?? 0}</strong> réponse{q.answer_count !== 1 ? 's' : ''}</span>
                <span>🕐 {timeAgo(q.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ──────────── DÉTAIL QUESTION + RÉPONSES ──────────── */
function QuestionDetail({ question, onBack, user }) {
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody]       = useState('')
  const [posting, setPosting] = useState(false)
  const [postMsg, setPostMsg] = useState('')
  const supabase = getSupabaseClient()

  useEffect(() => {
    supabase
      .from('forum_answers')
      .select('id, body, created_at, likes_count, is_best, profiles(username)')
      .eq('question_id', question.id)
      .order('is_best', { ascending: false })
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: true })
      .then(({ data }) => { setAnswers(data ?? []); setLoading(false) })
  }, [question.id])

  async function handleAnswer(e) {
    e.preventDefault()
    if (!body.trim()) return
    setPosting(true); setPostMsg('')
    const { error } = await supabase.from('forum_answers').insert({
      question_id: question.id,
      body: body.trim(),
      user_id: user.id,
    })
    if (error) { setPostMsg('Erreur : ' + error.message) }
    else {
      setBody('')
      // Reload answers + increment count
      const { data } = await supabase
        .from('forum_answers')
        .select('id, body, created_at, likes_count, is_best, profiles(username)')
        .eq('question_id', question.id)
        .order('is_best', { ascending: false })
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: true })
      setAnswers(data ?? [])
      await supabase.rpc('increment_answer_count', { qid: question.id })
    }
    setPosting(false)
  }

  async function handleLike(answerId) {
    if (!user) return
    const { error } = await supabase.rpc('toggle_answer_like', { aid: answerId, uid: user.id })
    if (!error) {
      const { data } = await supabase
        .from('forum_answers')
        .select('id, body, created_at, likes_count, is_best, profiles(username)')
        .eq('question_id', question.id)
        .order('is_best', { ascending: false })
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: true })
      setAnswers(data ?? [])
    }
  }

  return (
    <>
      <style>{`
        .detail-back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 13px; color: var(--ink-3); background: none; border: none; cursor: pointer; padding: 0; font-family: var(--font-body); transition: color .15s; }
        .detail-back:hover { color: var(--green-700); }
        .detail-card { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 28px; margin-bottom: 16px; }
        .detail-cat-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200); display: inline-block; margin-bottom: 12px; }
        .detail-titre { font-family: var(--font-display); font-size: clamp(18px, 3vw, 24px); font-weight: 500; color: var(--ink); margin-bottom: 14px; line-height: 1.3; }
        .detail-body { font-size: 14px; color: var(--ink-2); line-height: 1.8; white-space: pre-wrap; }
        .detail-meta { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--paper-2); font-size: 12px; color: var(--ink-4); display: flex; gap: 16px; }

        .answers-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3); margin: 20px 0 12px; }
        .answer-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--paper-2); padding: 18px 20px; margin-bottom: 10px; transition: border-color .15s; }
        .answer-card.best { border-color: var(--green-300); background: var(--green-50); }
        .best-label { font-size: 11px; font-weight: 700; color: var(--green-700); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
        .answer-body { font-size: 14px; color: var(--ink-2); line-height: 1.7; white-space: pre-wrap; margin-bottom: 12px; }
        .answer-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .answer-meta { font-size: 12px; color: var(--ink-4); display: flex; gap: 10px; }
        .like-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1.5px solid var(--paper-2); background: var(--paper); color: var(--ink-2); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
        .like-btn:hover { border-color: var(--green-400); color: var(--green-700); background: var(--green-50); }

        .answer-form-card { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 24px; }
        .answer-form-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 14px; }
        .answer-textarea { width: 100%; padding: 12px 14px; font-family: var(--font-body); font-size: 14px; color: var(--ink); background: var(--paper); border: 1.5px solid var(--paper-2); border-radius: var(--radius-md); outline: none; resize: vertical; min-height: 100px; transition: border-color .2s; }
        .answer-textarea:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(46,154,92,0.12); background: var(--white); }
        .btn-answer { margin-top: 10px; padding: 12px 24px; background: var(--green-700); color: white; border: none; border-radius: var(--radius-md); font-family: var(--font-body); font-size: 14px; font-weight: 600; cursor: pointer; transition: background .15s; }
        .btn-answer:hover:not(:disabled) { background: var(--green-800); }
        .btn-answer:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-prompt { padding: 16px 20px; background: var(--gold-50); border: 1px solid var(--gold-100); border-radius: var(--radius-md); font-size: 14px; color: var(--gold-700); }
        .auth-prompt a { color: var(--green-700); font-weight: 600; text-decoration: none; }
        .auth-prompt a:hover { text-decoration: underline; }
        .post-err { font-size: 13px; color: #991B1B; margin-top: 8px; }
      `}</style>

      <button className="detail-back" onClick={onBack}>← Retour aux questions</button>

      <div className="detail-card">
        <span className="detail-cat-badge">{question.categorie}</span>
        <h2 className="detail-titre">{question.titre}</h2>
        <div className="detail-body">{question.body ?? ''}</div>
        <div className="detail-meta">
          <span>👤 {question.profiles?.username ?? 'Anonyme'}</span>
          <span>🕐 {timeAgo(question.created_at)}</span>
        </div>
      </div>

      <div className="answers-title">
        {answers.length} Réponse{answers.length !== 1 ? 's' : ''}
      </div>

      {loading ? (
        <div style={{ color: 'var(--ink-3)', fontSize: 14, padding: '20px 0' }}>Chargement…</div>
      ) : (
        answers.map(a => (
          <div key={a.id} className={`answer-card${a.is_best ? ' best' : ''}`}>
            {a.is_best && <div className="best-label">✅ Meilleure réponse</div>}
            <div className="answer-body">{a.body}</div>
            <div className="answer-footer">
              <div className="answer-meta">
                <span>👤 {a.profiles?.username ?? 'Anonyme'}</span>
                <span>🕐 {timeAgo(a.created_at)}</span>
              </div>
              <button className="like-btn" onClick={() => handleLike(a.id)} disabled={!user}>
                👍 {a.likes_count ?? 0}
              </button>
            </div>
          </div>
        ))
      )}

      <div className="answer-form-card" style={{ marginTop: 16 }}>
        {user ? (
          <>
            <div className="answer-form-title">💬 Votre réponse</div>
            <form onSubmit={handleAnswer}>
              <textarea
                className="answer-textarea"
                placeholder="Partagez votre expérience ou votre conseil…"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
              />
              {postMsg && <div className="post-err">{postMsg}</div>}
              <button className="btn-answer" type="submit" disabled={posting || !body.trim()}>
                {posting ? 'Publication…' : 'Publier ma réponse'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-prompt">
            <Link href="/compte">Connectez-vous</Link> ou <Link href="/compte">créez un compte</Link> pour répondre à cette question.
          </div>
        )}
      </div>
    </>
  )
}

/* ──────────── POSER UNE QUESTION ──────────── */
function AskQuestion({ user, onDone }) {
  const [titre, setTitre]     = useState('')
  const [body, setBody]       = useState('')
  const [cat, setCat]         = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const supabase = getSupabaseClient()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!cat) { setErr('Veuillez choisir une catégorie.'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.from('forum_questions').insert({
      titre: titre.trim(), body: body.trim(), categorie: cat, user_id: user.id,
    })
    if (error) { setErr('Erreur : ' + error.message) }
    else { onDone() }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .ask-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--ink); margin-bottom: 20px; }
        .ask-card { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 28px; }
        .af-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 6px; }
        .af-field { margin-bottom: 18px; }
        .af-input { width: 100%; padding: 12px 14px; font-family: var(--font-body); font-size: 15px; color: var(--ink); background: var(--paper); border: 1.5px solid var(--paper-2); border-radius: var(--radius-md); outline: none; transition: border-color .2s; }
        .af-input:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(46,154,92,0.12); background: var(--white); }
        .af-select { appearance: none; }
        .af-textarea { resize: vertical; min-height: 120px; }
        .btn-post { padding: 14px 28px; background: var(--green-700); color: white; border: none; border-radius: var(--radius-md); font-family: var(--font-body); font-size: 15px; font-weight: 600; cursor: pointer; transition: background .15s; }
        .btn-post:hover:not(:disabled) { background: var(--green-800); }
        .btn-post:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-cancel { padding: 14px 20px; background: var(--paper); color: var(--ink-2); border: 1.5px solid var(--paper-2); border-radius: var(--radius-md); font-family: var(--font-body); font-size: 15px; cursor: pointer; margin-left: 10px; }
        .post-err { font-size: 13px; color: #991B1B; margin-bottom: 12px; }
      `}</style>
      <h2 className="ask-title">Poser une question</h2>
      <div className="ask-card">
        <form onSubmit={handleSubmit}>
          <div className="af-field">
            <div className="af-label">Catégorie</div>
            <select className="af-input af-select" value={cat} onChange={e => setCat(e.target.value)} required>
              <option value="">Choisir une catégorie…</option>
              {CATEGORIES.filter(c => c !== 'Toutes').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="af-field">
            <div className="af-label">Titre de la question</div>
            <input className="af-input" type="text" placeholder="Ex : Comment demander une bourse CENOU ?" value={titre} onChange={e => setTitre(e.target.value)} required maxLength={200} />
          </div>
          <div className="af-field">
            <div className="af-label">Détails (optionnel)</div>
            <textarea className="af-input af-textarea" placeholder="Donnez plus de contexte à votre question…" value={body} onChange={e => setBody(e.target.value)} maxLength={2000} />
          </div>
          {err && <div className="post-err">{err}</div>}
          <div>
            <button className="btn-post" type="submit" disabled={loading}>{loading ? 'Publication…' : 'Publier la question'}</button>
            <button className="btn-cancel" type="button" onClick={onDone}>Annuler</button>
          </div>
        </form>
      </div>
    </>
  )
}

/* ──────────── PAGE PRINCIPALE ──────────── */
export default function ForumPage() {
  const [view, setView]         = useState('list')   // 'list' | 'detail' | 'ask'
  const [activeQ, setActiveQ]   = useState(null)
  const { user, loading }       = useAuth()

  function openQuestion(q) { setActiveQ(q); setView('detail') }
  function backToList()    { setActiveQ(null); setView('list') }

  return (
    <>
      <style>{`
        .forum-page { min-height: 80vh; display: flex; flex-direction: column; }
        .forum-hero {
          background: var(--green-800); color: white;
          padding: 48px 24px 72px; text-align: center;
        }
        .forum-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold-400); margin-bottom: 12px; }
        .forum-title { font-family: var(--font-display); font-size: clamp(26px, 4vw, 42px); font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 12px; }
        .forum-title em { font-style: italic; color: var(--gold-400); }
        .forum-sub { font-size: 15px; color: rgba(255,255,255,0.65); max-width: 420px; margin: 0 auto; }

        .forum-body {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 0 16px 56px; margin-top: -40px;
        }
        .forum-inner { width: 100%; max-width: 680px; }
        .forum-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; animation: fadeUp .4s ease both; }
        .forum-count { font-size: 13px; color: var(--ink-3); }
        .btn-ask { padding: 10px 20px; background: var(--green-700); color: white; border: none; border-radius: var(--radius-md); font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; text-decoration: none; display: inline-block; }
        .btn-ask:hover { background: var(--green-800); }
        .btn-ask-login { background: var(--paper); color: var(--ink-2); border: 1.5px solid var(--paper-2); }
        .btn-ask-login:hover { background: var(--paper-2); }

        @media (max-width: 480px) {
          .forum-hero { padding: 36px 20px 64px; }
        }
      `}</style>

      <div className="forum-page">
        <section className="forum-hero">
          <p className="forum-eyebrow">💬 Communauté étudiante</p>
          <h1 className="forum-title">Forum <em>Q&R</em></h1>
          <p className="forum-sub">Posez vos questions, partagez vos expériences avec d'autres étudiants maliens.</p>
        </section>

        <div className="forum-body">
          <div className="forum-inner">

            {/* LIST */}
            {view === 'list' && (
              <>
                <div className="forum-top">
                  <span className="forum-count">Questions des étudiants</span>
                  {!loading && (
                    user ? (
                      <button className="btn-ask" onClick={() => setView('ask')}>+ Poser une question</button>
                    ) : (
                      <Link href="/compte" className="btn-ask btn-ask-login">Connexion pour poster</Link>
                    )
                  )}
                </div>
                <QuestionList onOpen={openQuestion} />
              </>
            )}

            {/* DETAIL */}
            {view === 'detail' && activeQ && (
              <QuestionDetail question={activeQ} onBack={backToList} user={user} />
            )}

            {/* ASK */}
            {view === 'ask' && user && (
              <AskQuestion user={user} onDone={() => setView('list')} />
            )}

          </div>
        </div>
      </div>
    </>
  )
}
