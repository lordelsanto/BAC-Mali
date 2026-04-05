'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CENTRES = [
  'BAMAKO RIVE DROITE', 'BAMAKO RIVE GAUCHE', 'KATI', 'KITA', 'KAYES',
  'KOULIKORO', 'BANDIAGARA', 'BOUGOUNI', 'SIKASSO', 'SEGOU', 'SAN',
  'KOUTIALA', 'KALABANCORO', 'MOPTI', 'DOUENTZA', 'TOMBOUCTOU', 'BASSIKOUNOU',
]

const ANNEES = [2026, 2025, 2024, 2023, 2022, 2021]

const MENTION_COLOR = {
  'EXCELLENT':  { bg: '#0D3D22', text: '#A8DDB8', label: 'Excellent' },
  'TRES-BIEN':  { bg: '#145A30', text: '#A8DDB8', label: 'Très bien' },
  'BIEN':       { bg: '#1B6B3A', text: '#D4EFDb', label: 'Bien' },
  'ASSEZ-BIEN': { bg: '#8B6914', text: '#F5E6C0', label: 'Assez bien' },
  'PASSABLE':   { bg: '#3A3D36', text: '#D4D6CF', label: 'Passable' },
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.25 } },
}

const heroStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
}

const springCard = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit:   { opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.22 } },
}

const resultReveal = {
  hidden: { opacity: 0, scale: 0.92, y: 28 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26, delay: 0.05 } },
}

const statsStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const statItem = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

const rowStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
}

const rowItem = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export default function Home() {
  const [numero, setNumero]   = useState('')
  const [annee, setAnnee]     = useState('2026')
  const [centre, setCentre]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const [admisCount, setAdmisCount]     = useState(null)
  const [admisAnnee, setAdmisAnnee]     = useState(null)
  const [admisLoading, setAdmisLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) { setAdmisCount(data.count); setAdmisAnnee(data.annee) }
      })
      .catch(() => {})
      .finally(() => setAdmisLoading(false))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!numero.trim() || !centre) return
    setLoading(true); setResult(null); setError('')
    try {
      const params = new URLSearchParams({ numero: numero.trim(), annee, centre })
      const res    = await fetch(`/api/recherche?${params}`)
      const data   = await res.json()
      if (!res.ok) { setError(data.error || 'Une erreur est survenue.') }
      else { setResult(data) }
    } catch {
      setError('Impossible de contacter le serveur. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() { setResult(null); setError(''); setNumero('') }

  const mention      = result?.candidat?.mention
  const mentionStyle = MENTION_COLOR[mention] || MENTION_COLOR['PASSABLE']

  return (
    <>
      <style>{`
        .page { min-height: 100vh; display: flex; flex-direction: column; }

        /* ─── Hero ─── */
        .hero {
          background: var(--green-800); color: var(--white);
          padding: 56px 24px 80px; text-align: center;
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(46,154,92,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(201,151,43,0.10) 0%, transparent 40%);
          pointer-events: none;
        }
        .hero-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--gold-400); margin-bottom: 14px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .hero-eyebrow::before, .hero-eyebrow::after {
          content: ''; width: 24px; height: 1px;
          background: var(--gold-400); opacity: 0.6;
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 400; line-height: 1.1;
          letter-spacing: -0.02em; margin-bottom: 16px;
        }
        .hero-title em { font-style: italic; color: var(--gold-400); }
        .hero-sub {
          font-size: 16px; color: rgba(255,255,255,0.65);
          max-width: 420px; margin: 0 auto; font-weight: 300; line-height: 1.6;
        }

        /* ─── Card container ─── */
        .card-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 0 16px 48px; margin-top: -40px;
        }

        /* ─── Search card ─── */
        .search-card {
          background: var(--white); border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg); padding: 36px 32px 32px;
          width: 100%; max-width: 520px;
        }
        .card-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink-3); margin-bottom: 6px;
        }
        .card-field { margin-bottom: 18px; }
        .card-input {
          width: 100%; padding: 13px 16px;
          font-family: var(--font-body); font-size: 15px;
          color: var(--ink); background: var(--paper);
          border: 1.5px solid var(--paper-2); border-radius: var(--radius-md);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .card-input:focus {
          border-color: var(--green-500);
          box-shadow: 0 0 0 3px rgba(46, 154, 92, 0.12);
          background: var(--white);
        }
        .card-input::placeholder { color: var(--ink-4); }
        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .btn-search {
          width: 100%; padding: 15px; font-family: var(--font-body);
          font-size: 15px; font-weight: 600; color: var(--white);
          background: var(--green-700); border: none;
          border-radius: var(--radius-md); cursor: pointer;
          transition: background 0.2s;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 6px; letter-spacing: 0.01em;
        }
        .btn-search:hover:not(:disabled)  { background: var(--green-800); }
        .btn-search:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* ─── Error ─── */
        .error-box {
          margin-top: 20px; padding: 14px 18px;
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: var(--radius-md); color: #991B1B; font-size: 14px;
        }

        /* ─── Not found ─── */
        .not-found {
          margin-top: 20px; padding: 28px; background: var(--gold-50);
          border: 1px solid var(--gold-100); border-radius: var(--radius-lg);
          text-align: center;
        }
        .not-found-icon {
          width: 48px; height: 48px; background: var(--gold-100);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 14px; font-size: 22px;
        }
        .not-found h3 {
          font-family: var(--font-display); font-size: 19px;
          font-weight: 500; color: var(--gold-700); margin-bottom: 8px;
        }
        .not-found p { font-size: 13px; color: var(--gold-700); line-height: 1.6; opacity: 0.8; }

        /* ─── Result card ─── */
        .result-card {
          margin-top: 20px; background: var(--white);
          border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);
          overflow: hidden; width: 100%; max-width: 520px;
        }
        .result-header {
          padding: 28px 32px 24px; display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          border-bottom: 1px solid var(--paper-2);
        }
        .result-name {
          font-family: var(--font-display);
          font-size: clamp(20px, 4vw, 26px); font-weight: 500;
          color: var(--ink); line-height: 1.2; letter-spacing: -0.01em;
        }
        .result-numero { font-size: 12px; color: var(--ink-3); margin-top: 5px; font-weight: 300; }
        .admis-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 100px;
          background: var(--green-50); border: 1.5px solid var(--green-200);
          white-space: nowrap; flex-shrink: 0;
        }
        .admis-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--green-500); animation: pulse-ring 2s infinite; flex-shrink: 0;
        }
        .admis-text {
          font-size: 13px; font-weight: 600; color: var(--green-700);
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .result-body { padding: 24px 32px; }
        .result-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 0; border-bottom: 1px solid var(--paper-2); gap: 16px;
        }
        .result-row:last-child { border-bottom: none; }
        .result-key {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--ink-3); flex-shrink: 0;
        }
        .result-val { font-size: 15px; font-weight: 500; color: var(--ink); text-align: right; }
        .mention-badge {
          display: inline-block; padding: 5px 14px; border-radius: 100px;
          font-size: 13px; font-weight: 600; letter-spacing: 0.02em;
        }
        .result-footer {
          padding: 20px 32px; background: var(--paper);
          border-top: 1px solid var(--paper-2); display: flex; gap: 10px;
        }
        .btn-share {
          flex: 1; padding: 11px; font-family: var(--font-body); font-size: 13px;
          font-weight: 600; background: var(--white); color: var(--ink-2);
          border: 1.5px solid var(--paper-2); border-radius: var(--radius-md);
          cursor: pointer; transition: background .15s, border-color .15s;
        }
        .btn-share:hover { background: var(--paper-2); border-color: var(--ink-4); }
        .btn-new {
          flex: 1; padding: 11px; font-family: var(--font-body); font-size: 13px;
          font-weight: 600; background: var(--green-700); color: var(--white);
          border: none; border-radius: var(--radius-md); cursor: pointer;
          transition: background .15s;
        }
        .btn-new:hover { background: var(--green-800); }

        /* ─── CTA orientation ─── */
        .cta-orientation {
          margin-top: 16px; width: 100%; max-width: 520px;
          background: linear-gradient(135deg, var(--green-50), #FBF4E0);
          border: 1px solid var(--green-100); border-radius: var(--radius-lg);
          padding: 20px 24px; display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
          text-decoration: none;
        }
        .cta-orientation:hover { border-color: var(--green-200); }
        .cta-text { font-size: 14px; color: var(--green-800); font-weight: 500; }
        .cta-text strong { display: block; font-size: 15px; margin-bottom: 2px; }
        .cta-arrow { font-size: 20px; flex-shrink: 0; }

        /* ─── Stats strip ─── */
        .stats-strip {
          width: 100%; max-width: 520px; margin-top: 28px;
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .stat-box {
          background: var(--white); border-radius: var(--radius-lg);
          padding: 18px 14px; text-align: center; box-shadow: var(--shadow-sm);
        }
        .stat-num {
          font-family: var(--font-display); font-size: 26px;
          font-weight: 400; color: var(--green-700); line-height: 1; margin-bottom: 5px;
        }
        .stat-num.loading { color: var(--ink-4); animation: pulse-fade 1.2s ease-in-out infinite; }
        .stat-label {
          font-size: 11px; font-weight: 500; color: var(--ink-3);
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        @keyframes pulse-fade { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 480px) {
          .hero { padding: 44px 20px 70px; }
          .search-card { padding: 28px 20px 24px; border-radius: var(--radius-lg); }
          .result-card { border-radius: var(--radius-lg); }
          .result-header, .result-body, .result-footer { padding-left: 20px; padding-right: 20px; }
          .row-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        {/* ─── Hero ─── */}
        <motion.section
          className="hero"
          variants={heroStagger}
          initial="hidden"
          animate="show"
        >
          <motion.p className="hero-eyebrow" variants={heroItem}>Vérification officielle</motion.p>
          <motion.h1 className="hero-title" variants={heroItem}>
            Consultez vos<br />
            résultats du <em>Baccalauréat</em>
          </motion.h1>
          <motion.p className="hero-sub" variants={heroItem}>
            Entrez votre numéro de place pour accéder à vos résultats officiels de la session de juin.
          </motion.p>
        </motion.section>

        {/* ─── Card zone ─── */}
        <main className="card-wrap">
          <AnimatePresence mode="wait">

            {/* Search form */}
            {!result && (
              <motion.div
                key="search"
                className="search-card"
                variants={springCard}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <form onSubmit={handleSearch}>
                  <div className="card-field">
                    <div className="card-label">Numéro de place</div>
                    <input
                      className="card-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex : 2415"
                      value={numero}
                      onChange={e => setNumero(e.target.value.replace(/\D/g, ''))}
                      maxLength={8}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="row-2">
                    <div className="card-field">
                      <div className="card-label">Année</div>
                      <select className="card-input" value={annee} onChange={e => setAnnee(e.target.value)} required>
                        {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="card-field">
                      <div className="card-label">Centre</div>
                      <select className="card-input" value={centre} onChange={e => setCentre(e.target.value)} required>
                        <option value="">Choisir…</option>
                        {CENTRES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <motion.button
                    className="btn-search"
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {loading ? <><div className="spinner" /> Recherche en cours…</> : 'Vérifier mes résultats'}
                  </motion.button>
                </form>
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="error-box"
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Not found */}
            {result && !result.found && (
              <motion.div
                key="notfound"
                className="search-card"
                variants={springCard}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <div className="not-found">
                  <div className="not-found-icon">?</div>
                  <h3>Candidat introuvable</h3>
                  <p>Aucun résultat pour le numéro <strong>{numero}</strong> au centre de <strong>{centre}</strong> en <strong>{annee}</strong>.</p>
                  <p style={{ marginTop: 10 }}>Vérifie ton numéro de place sur ta convocation, et assure-toi d'avoir sélectionné le bon centre et la bonne année.</p>
                </div>
                <motion.button
                  className="btn-search"
                  onClick={handleReset}
                  style={{ marginTop: 20 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Faire une nouvelle recherche
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Found — résultat admis */}
          <AnimatePresence>
            {result && result.found && (
              <>
                <motion.div
                  key="result"
                  className="result-card"
                  variants={resultReveal}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="result-header">
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                    >
                      <div className="result-name">{result.candidat.prenoms} {result.candidat.nom}</div>
                      <div className="result-numero">N° de place : {numero} &bull; {result.candidat.centre}</div>
                    </motion.div>
                    <motion.div
                      className="admis-pill"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25, type: 'spring', stiffness: 350, damping: 20 }}
                    >
                      <div className="admis-dot" />
                      <span className="admis-text">Admis</span>
                    </motion.div>
                  </div>

                  <motion.div
                    className="result-body"
                    variants={rowStagger}
                    initial="hidden"
                    animate="show"
                  >
                    {[
                      { key: 'Série',   val: result.candidat.serie },
                      { key: 'Mention', val: null, badge: true },
                      { key: 'Session', val: `Juin ${result.candidat.annee}` },
                      { key: 'Centre',  val: result.candidat.centre, small: true },
                    ].map(row => (
                      <motion.div className="result-row" key={row.key} variants={rowItem}>
                        <span className="result-key">{row.key}</span>
                        {row.badge
                          ? <span className="mention-badge" style={{ background: mentionStyle.bg, color: mentionStyle.text }}>{mentionStyle.label}</span>
                          : <span className="result-val" style={row.small ? { fontSize: 13 } : {}}>{row.val}</span>
                        }
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="result-footer">
                    <button className="btn-share" onClick={() => {
                      const msg = `J'ai obtenu mon BAC ${result.candidat.annee} avec la mention "${mentionStyle.label}" ! 🎓 Mali`
                      navigator.share
                        ? navigator.share({ title: 'Résultat BAC', text: msg })
                        : navigator.clipboard.writeText(msg)
                    }}>Partager</button>
                    <button className="btn-new" onClick={handleReset}>Nouvelle recherche</button>
                  </div>
                </motion.div>

                <motion.a
                  href="/orientation"
                  className="cta-orientation"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <div className="cta-text">
                    <strong>🧭 Et maintenant ?</strong>
                    Découvrez les filières adaptées à votre série {result.candidat.serie}
                  </div>
                  <span className="cta-arrow">→</span>
                </motion.a>
              </>
            )}
          </AnimatePresence>

          {/* Stats strip */}
          <AnimatePresence>
            {!result && (
              <motion.div
                key="stats"
                className="stats-strip"
                variants={statsStagger}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                <motion.div className="stat-box" variants={statItem}>
                  {admisLoading
                    ? <div className="stat-num loading">…</div>
                    : <div className="stat-num">{admisCount !== null ? admisCount.toLocaleString('fr-FR') : '—'}</div>
                  }
                  <div className="stat-label">Admis {admisAnnee ?? ''}</div>
                </motion.div>
                <motion.div className="stat-box" variants={statItem}>
                  <div className="stat-num">6</div>
                  <div className="stat-label">Séries</div>
                </motion.div>
                <motion.div className="stat-box" variants={statItem}>
                  <div className="stat-num">2021</div>
                  <div className="stat-label">Depuis</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}
