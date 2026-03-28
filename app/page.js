'use client'

import { useState, useEffect } from 'react'

// ✅ Uniquement les années 2021–2026
const ANNEES = [2026, 2025, 2024, 2023, 2022, 2021]

const CENTRES = [
  'BAMAKO RIVE DROITE',
  'BAMAKO RIVE GAUCHE',
  'BAMAKO NORD',
  'KAYES',
  'KOULIKORO',
  'SIKASSO',
  'SEGOU',
  'MOPTI',
  'TOMBOUCTOU',
  'GAO',
  'KIDAL',
]

const MENTIONS = {
  'TRES BIEN':  { label: 'Très Bien',   color: '#16a34a' },
  'BIEN':       { label: 'Bien',        color: '#2563eb' },
  'ASSEZ-BIEN': { label: 'Assez Bien',  color: '#7c3aed' },
  'ASSEZ BIEN': { label: 'Assez Bien',  color: '#7c3aed' },
  'PASSABLE':   { label: 'Passable',    color: '#d97706' },
  'ADMIS':      { label: 'Admis',       color: '#059669' },
}

export default function Home() {
  const [numero, setNumero]   = useState('')
  const [annee, setAnnee]     = useState('2026')
  const [centre, setCentre]   = useState('')
  const [loading, setLoading] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [erreur, setErreur]   = useState('')

  // Nombre d'admis dynamique depuis Supabase
  const [admisCount, setAdmisCount]   = useState(null)
  const [admisAnnee, setAdmisAnnee]   = useState(null)
  const [admisLoading, setAdmisLoading] = useState(true)
  const [admisErreur, setAdmisErreur] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Réponse invalide')
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setAdmisCount(data.count)
        setAdmisAnnee(data.annee)
      } catch (err) {
        console.error('Impossible de charger les statistiques :', err)
        setAdmisErreur(true)
      } finally {
        setAdmisLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setResultat(null)

    if (!numero.trim()) {
      setErreur('Veuillez entrer un numéro de place.')
      return
    }
    if (!centre) {
      setErreur('Veuillez sélectionner un centre.')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ numero: numero.trim(), annee, centre })
      const res  = await fetch(`/api/recherche?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.error || 'Une erreur est survenue.')
        return
      }
      setResultat(data.resultat)
    } catch {
      setErreur('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const mentionKey = resultat?.mention?.toUpperCase()
  const mentionInfo = mentionKey ? (MENTIONS[mentionKey] || { label: resultat.mention, color: '#6b7280' }) : null
  const isAdmis = resultat?.statut?.toUpperCase() === 'ADMIS'

  return (
    <main>
      {/* ===== HERO ===== */}
      <header className="hero">
        <p className="hero-label">— VÉRIFICATION OFFICIELLE —</p>
        <h1 className="hero-title">
          Consultez vos<br />
          résultats du <em>Baccalauréat</em>
        </h1>
        <p className="hero-sub">
          Entrez votre numéro de place pour accéder à vos<br />
          résultats officiels de la session de juin.
        </p>
      </header>

      {/* ===== FORMULAIRE ===== */}
      <section className="card-wrapper">
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>

            <div className="field">
              <label className="field-label" htmlFor="numero">NUMÉRO DE PLACE</label>
              <input
                id="numero"
                className="field-input"
                type="text"
                placeholder="Ex : 2415"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="annee">ANNÉE</label>
                <select
                  id="annee"
                  className="field-input"
                  value={annee}
                  onChange={(e) => setAnnee(e.target.value)}
                >
                  {ANNEES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="centre">CENTRE</label>
                <select
                  id="centre"
                  className="field-input"
                  value={centre}
                  onChange={(e) => setCentre(e.target.value)}
                >
                  <option value="">Choisir...</option>
                  {CENTRES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {erreur && (
              <p className="error-msg" role="alert">{erreur}</p>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Recherche en cours…' : 'Vérifier mes résultats'}
            </button>
          </form>

          {/* ===== RÉSULTAT ===== */}
          {resultat && (
            <div
              className={`result-card ${isAdmis ? 'result-admis' : 'result-ajourn'}`}
              role="region"
              aria-label="Résultat"
            >
              <div className="result-status">
                <span className={`status-badge ${isAdmis ? 'badge-admis' : 'badge-ajourn'}`}>
                  {isAdmis ? '✓ ADMIS(E)' : '✗ AJOURNÉ(E)'}
                </span>
              </div>
              <p className="result-name">{resultat.prenom} {resultat.nom}</p>
              <div className="result-meta">
                <span className="meta-item">
                  <span className="meta-label">Série</span>
                  <span className="meta-value">{resultat.serie}</span>
                </span>
                {resultat.mention && (
                  <span className="meta-item">
                    <span className="meta-label">Mention</span>
                    <span className="meta-value" style={{ color: mentionInfo?.color, fontWeight: 600 }}>
                      {mentionInfo?.label || resultat.mention}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== STATISTIQUES ===== */}
      <section className="stats-section" aria-label="Statistiques">
        <div className="stats-grid">

          {/* Admis dynamique */}
          <div className="stat-card">
            {admisLoading ? (
              <p className="stat-number stat-loading">…</p>
            ) : admisErreur ? (
              <p className="stat-number stat-error">—</p>
            ) : (
              <p className="stat-number">{admisCount?.toLocaleString('fr-FR') ?? '—'}</p>
            )}
            <p className="stat-label">Admis {admisAnnee ?? ''}</p>
          </div>

          <div className="stat-card">
            <p className="stat-number">6</p>
            <p className="stat-label">Séries</p>
          </div>

          {/* ✅ Depuis 2021 */}
          <div className="stat-card">
            <p className="stat-number">2021</p>
            <p className="stat-label">Depuis</p>
          </div>

        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <p>
          Données officielles — Ministère de l&apos;Éducation Nationale du Mali • Session de juin {admisAnnee ?? ''}
        </p>
        <p>
          Un problème ?{' '}
          <a href="mailto:contact@example.com" className="footer-link">Contacte-nous</a>
        </p>
      </footer>
    </main>
  )
}
