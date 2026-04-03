'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '../../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'

const CATEGORIES = ['Orientation', 'Cours', 'Examen', 'Université', 'Bourse', 'Conseils', 'Autres']

const CAT_DESCRIPTIONS = {
  Orientation: 'Filières, débouchés, choix d\'études',
  Cours:       'Questions sur les matières et programmes',
  Examen:      'Préparation, résultats, rattrapages',
  Université:  'Inscription, campus, administration',
  Bourse:      'CENOU, bourses étrangères, aides',
  Conseils:    'Conseils de vie étudiante',
  Autres:      'Tout ce qui ne rentre pas ailleurs',
}

export default function NouveauPostPage() {
  const router        = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase      = getSupabaseClient()

  const [titre, setTitre]   = useState('')
  const [body, setBody]     = useState('')
  const [cat, setCat]       = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]       = useState('')
  const [step, setStep]     = useState(1) // 1 = cat, 2 = form

  // Redirect si non connecté
  useEffect(() => {
    if (!authLoading && !user) router.replace('/compte')
  }, [user, authLoading])

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    if (!cat)           { setErr('Choisissez une catégorie.'); return }
    if (titre.length < 10) { setErr('Le titre doit faire au moins 10 caractères.'); return }
    if (body.length < 20)  { setErr('La description doit faire au moins 20 caractères.'); return }

    setLoading(true)

    // Anti-spam
    const { data: canPost } = await supabase.rpc('can_create_post')
    if (!canPost) {
      setErr('Vous avez déjà posté récemment. Attendez 2 minutes.')
      setLoading(false); return
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({ titre: titre.trim(), body: body.trim(), categorie: cat, user_id: user.id })
      .select('id')
      .single()

    if (error) {
      setErr('Erreur : ' + error.message)
      setLoading(false); return
    }

    router.push(`/forum/${data.id}`)
  }

  if (authLoading) return null

  /* ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        /* ══ NOUVEAU POST ══ */
        .np-page {
          min-height: 80vh; background: var(--paper);
          display: flex; flex-direction: column;
        }

        .np-hero {
          background: linear-gradient(140deg, var(--green-900), var(--green-700));
          padding: 40px 24px 72px; text-align: center; color: white;
        }
        .np-hero-eye { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-400); margin-bottom: 8px; }
        .np-hero-title { font-family: var(--font-display); font-size: clamp(22px, 4vw, 36px); font-weight: 400; letter-spacing: -.02em; }
        .np-hero-title em { font-style: italic; color: var(--gold-400); }

        .np-body { max-width: 680px; margin: -40px auto 0; padding: 0 16px 72px; width: 100%; }

        .np-back { display: inline-flex; align-items: center; gap: 5px; margin-bottom: 14px; font-size: 13px; color: var(--ink-3); text-decoration: none; transition: color .15s; }
        .np-back:hover { color: var(--green-700); }

        .np-card {
          background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);
          padding: 32px; overflow: hidden;
        }
        @media (max-width: 600px) { .np-card { padding: 22px 18px; } }

        /* Step 1 — Catégorie */
        .step-label { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 18px; }
        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
        .cat-option {
          padding: 14px 16px; border-radius: var(--radius-md); border: 1.5px solid var(--paper-2);
          background: var(--paper); cursor: pointer; transition: all .15s; text-align: left;
          font-family: var(--font-body);
        }
        .cat-option:hover { border-color: var(--green-300); background: var(--green-50); }
        .cat-option.selected { border-color: var(--green-500); background: var(--green-50); box-shadow: 0 0 0 3px rgba(46,154,92,.1); }
        .cat-opt-name { font-size: 14px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .cat-opt-desc { font-size: 11px; color: var(--ink-4); line-height: 1.5; }

        .btn-next {
          margin-top: 20px; padding: 13px 28px; background: var(--green-700); color: white; border: none;
          border-radius: var(--radius-md); font-family: var(--font-body); font-size: 15px; font-weight: 600;
          cursor: pointer; transition: background .15s; display: block; width: 100%;
        }
        .btn-next:hover:not(:disabled) { background: var(--green-800); }
        .btn-next:disabled { opacity: .5; cursor: not-allowed; }

        /* Step 2 — Form */
        .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1.5px solid var(--paper-2); }
        .step-back-btn {
          padding: 6px 12px; background: var(--paper); border: 1.5px solid var(--paper-2); border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px; color: var(--ink-3); cursor: pointer; transition: all .15s;
        }
        .step-back-btn:hover { border-color: var(--green-300); color: var(--green-700); }
        .selected-cat-chip {
          padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 700;
          background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200);
        }

        .f-field { margin-bottom: 20px; }
        .f-label { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 7px; display: flex; justify-content: space-between; }
        .f-input {
          width: 100%; padding: 13px 15px; border-radius: var(--radius-md); border: 1.5px solid var(--paper-2);
          background: var(--paper); font-family: var(--font-body); font-size: 15px; color: var(--ink); outline: none;
          transition: all .2s;
        }
        .f-input:focus { border-color: var(--green-500); background: var(--white); box-shadow: 0 0 0 3px rgba(46,154,92,.1); }
        .f-input::placeholder { color: var(--ink-4); font-size: 14px; }
        .f-textarea { resize: vertical; min-height: 130px; font-size: 14px; line-height: 1.7; }

        .f-tips { background: var(--gold-50); border: 1px solid var(--gold-100); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; }
        .f-tips-title { font-size: 12px; font-weight: 700; color: var(--gold-700); margin-bottom: 8px; }
        .f-tips-list { font-size: 12px; color: var(--gold-700); list-style: none; display: flex; flex-direction: column; gap: 4px; }

        .f-submit {
          width: 100%; padding: 15px; background: var(--green-700); color: white; border: none;
          border-radius: var(--radius-md); font-family: var(--font-display); font-size: 16px;
          font-weight: 500; cursor: pointer; transition: background .15s;
        }
        .f-submit:hover:not(:disabled) { background: var(--green-800); }
        .f-submit:disabled { opacity: .6; cursor: not-allowed; }

        .f-err { padding: 12px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md); font-size: 13px; color: #DC2626; margin-bottom: 14px; }

        /* Progress bar */
        .np-progress { height: 3px; background: var(--paper-2); border-radius: 100px; margin-bottom: 24px; overflow: hidden; }
        .np-progress-fill { height: 100%; background: var(--green-500); border-radius: 100px; transition: width .3s ease; }
      `}</style>

      <div className="np-page">
        <div className="np-hero">
          <p className="np-hero-eye">💬 Forum</p>
          <h1 className="np-hero-title">Nouvelle <em>discussion</em></h1>
        </div>

        <div className="np-body">
          <Link href="/forum" className="np-back">← Retour au forum</Link>

          <div className="np-card">
            {/* Progress */}
            <div className="np-progress">
              <div className="np-progress-fill" style={{ width: step === 1 ? '40%' : '100%' }} />
            </div>

            {/* STEP 1: Choisir la catégorie */}
            {step === 1 && (
              <>
                <div className="step-label">Étape 1 / 2 — Choisissez une catégorie</div>
                <div className="cat-grid">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      className={`cat-option${cat === c ? ' selected' : ''}`}
                      onClick={() => setCat(c)}
                      type="button"
                    >
                      <div className="cat-opt-name">
                        {c === 'Orientation' && '🧭'}
                        {c === 'Cours'       && '📚'}
                        {c === 'Examen'      && '📝'}
                        {c === 'Université'  && '🏛️'}
                        {c === 'Bourse'      && '💰'}
                        {c === 'Conseils'    && '💡'}
                        {c === 'Autres'      && '📌'}
                        {c}
                      </div>
                      <div className="cat-opt-desc">{CAT_DESCRIPTIONS[c]}</div>
                    </button>
                  ))}
                </div>
                <button className="btn-next" disabled={!cat} onClick={() => setStep(2)}>
                  Continuer →
                </button>
              </>
            )}

            {/* STEP 2: Formulaire */}
            {step === 2 && (
              <>
                <div className="step-header">
                  <button className="step-back-btn" onClick={() => setStep(1)} type="button">← Retour</button>
                  <span className="selected-cat-chip">
                    {cat === 'Orientation' && '🧭'}
                    {cat === 'Cours'       && '📚'}
                    {cat === 'Examen'      && '📝'}
                    {cat === 'Université'  && '🏛️'}
                    {cat === 'Bourse'      && '💰'}
                    {cat === 'Conseils'    && '💡'}
                    {cat === 'Autres'      && '📌'}
                    {' '}{cat}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Étape 2 / 2</span>
                </div>

                {/* Tips */}
                <div className="f-tips">
                  <div className="f-tips-title">💡 Conseil pour une bonne question</div>
                  <ul className="f-tips-list">
                    <li>• Titre précis : « Comment demander CENOU ? » plutôt que « Aide svp »</li>
                    <li>• Donnez du contexte dans la description</li>
                    <li>• Une seule question par post</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="f-field">
                    <div className="f-label">
                      <span>Titre de la question</span>
                      <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: titre.length < 10 ? '#DC2626' : 'var(--ink-4)' }}>
                        {titre.length}/200
                      </span>
                    </div>
                    <input
                      className="f-input"
                      type="text"
                      placeholder="Ex : Comment faire une demande de bourse CENOU ?"
                      value={titre}
                      onChange={e => setTitre(e.target.value)}
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="f-field">
                    <div className="f-label">
                      <span>Détails (description)</span>
                      <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: body.length < 20 && body.length > 0 ? '#DC2626' : 'var(--ink-4)' }}>
                        {body.length}/5000
                      </span>
                    </div>
                    <textarea
                      className="f-input f-textarea"
                      placeholder="Donnez plus de contexte : votre filière, votre niveau, ce que vous avez déjà essayé…"
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      maxLength={5000}
                      required
                    />
                  </div>

                  {err && <div className="f-err">⚠️ {err}</div>}

                  <button
                    className="f-submit"
                    type="submit"
                    disabled={loading || titre.length < 10 || body.length < 20}
                  >
                    {loading ? '⏳ Publication en cours…' : '🚀 Publier la discussion'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
