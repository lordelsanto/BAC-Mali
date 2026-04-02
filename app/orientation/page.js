'use client'

import { useState } from 'react'

const SERIES = [
  { id: 'L',   label: 'Série L',   desc: 'Lettres et Sciences Humaines' },
  { id: 'S',   label: 'Série S',   desc: 'Sciences exactes et naturelles' },
  { id: 'TSE', label: 'Série TSE', desc: 'Techniques et Sciences de l\'Environnement' },
  { id: 'STI', label: 'Série STI', desc: 'Sciences et Techniques Industrielles' },
  { id: 'G',   label: 'Série G',   desc: 'Gestion et Commerce' },
]

const FILIERES = {
  L: [
    { nom: 'Droit', ecole: 'FSJP – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Avocat, Magistrat, Notaire, Juriste d\'entreprise', match: 95 },
    { nom: 'Lettres Modernes', ecole: 'FLASH – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Enseignant, Traducteur, Journaliste littéraire', match: 90 },
    { nom: 'Sciences Sociales', ecole: 'FLASH – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Sociologue, Travailleur social, ONG', match: 85 },
    { nom: 'Journalisme & Communication', ecole: 'CFTRI, Bamako / ESIAU', duree: '3 ans (Licence)', debouches: 'Journaliste, Attaché de presse, Community manager', match: 80 },
    { nom: 'Sciences Politiques', ecole: 'FSJP – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Diplomate, Conseiller politique, Chercheur', match: 75 },
  ],
  S: [
    { nom: 'Médecine', ecole: 'FMOS – USTTB, Bamako', duree: '7 ans', debouches: 'Médecin généraliste, Spécialiste, Chercheur médical', match: 95 },
    { nom: 'Pharmacie', ecole: 'FAPH – USTTB, Bamako', duree: '6 ans', debouches: 'Pharmacien, Industrie pharmaceutique', match: 90 },
    { nom: 'Informatique', ecole: 'FST – USTTB / SUP\'INFO Mali', duree: '3 ans (Licence)', debouches: 'Développeur, Ingénieur systèmes, Data analyst', match: 88 },
    { nom: 'Mathématiques & Physique', ecole: 'FST – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Enseignant, Ingénieur, Chercheur', match: 82 },
    { nom: 'Biologie', ecole: 'FST – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Biologiste, Labo médical, Enseignant', match: 80 },
    { nom: 'Odontostomatologie', ecole: 'FMOS – USTTB, Bamako', duree: '6 ans', debouches: 'Chirurgien-dentiste, Cabinet privé', match: 78 },
  ],
  TSE: [
    { nom: 'Agriculture / Agronomie', ecole: 'IPR/IFRA – Katibougou', duree: '3 ans (Licence)', debouches: 'Agronome, Conseiller agricole, ONG développement', match: 95 },
    { nom: 'Génie Rural', ecole: 'IPR/IFRA – Katibougou', duree: '3 ans (Licence)', debouches: 'Ingénieur rural, Hydraulique, Aménagement', match: 88 },
    { nom: 'Sciences de l\'Environnement', ecole: 'FST – USTTB / IPR', duree: '3 ans (Licence)', debouches: 'Écologue, Gestionnaire de ressources naturelles', match: 85 },
    { nom: 'Géographie', ecole: 'FLASH – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Géographe, Urbaniste, Cartographe SIG', match: 80 },
  ],
  STI: [
    { nom: 'Génie Civil', ecole: 'ENI – USTTB, Bamako', duree: '3 ans (Licence / IUT)', debouches: 'Ingénieur BTP, Conducteur de travaux, Urbanisme', match: 95 },
    { nom: 'Électronique & Électrotechnique', ecole: 'ENI – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Électricien industriel, Technicien réseaux', match: 90 },
    { nom: 'Informatique Industrielle', ecole: 'FST – USTTB / SUP\'INFO Mali', duree: '3 ans (Licence)', debouches: 'Développeur, Administrateur systèmes', match: 85 },
    { nom: 'Génie Mécanique', ecole: 'ENI – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Mécanicien industriel, Maintenance', match: 80 },
  ],
  G: [
    { nom: 'Gestion & Comptabilité', ecole: 'FSEG – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Comptable, Contrôleur de gestion, Expert-comptable', match: 95 },
    { nom: 'Commerce International', ecole: 'FSEG – USTTB, Bamako', duree: '3 ans (Licence)', debouches: 'Commercial, Import-export, Douanes', match: 90 },
    { nom: 'Banque & Finance', ecole: 'FSEG – USTTB / IB Mali', duree: '3 ans (Licence)', debouches: 'Banquier, Analyste financier, Assurance', match: 88 },
    { nom: 'Marketing & Communication', ecole: 'FSEG – USTTB / ESG Mali', duree: '3 ans (Licence)', debouches: 'Marketeur, Chef de produit, Digital marketing', match: 82 },
  ],
}

const MATCH_COLOR = m =>
  m >= 90 ? { bg: '#EEF8F1', border: '#A8DDB8', text: '#145A30', label: 'Excellent match' }
  : m >= 80 ? { bg: '#FBF4E0', border: '#F5E6C0', text: '#8B6914', label: 'Bon match' }
  : { bg: '#F5F5F5', border: '#E0E0E0', text: '#555', label: 'Possible' }

export default function OrientationPage() {
  const [step, setStep]   = useState(1)
  const [serie, setSerie] = useState(null)

  const filieres = serie ? FILIERES[serie] : []

  return (
    <>
      <style>{`
        .ori-page { min-height: 80vh; display: flex; flex-direction: column; }
        .ori-hero {
          background: var(--green-800); color: white;
          padding: 48px 24px 72px; text-align: center; position: relative;
        }
        .ori-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 30% 60%, rgba(46,154,92,0.15) 0%, transparent 55%);
          pointer-events: none;
        }
        .ori-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--gold-400); margin-bottom: 12px;
        }
        .ori-title {
          font-family: var(--font-display); font-size: clamp(28px, 4vw, 44px);
          font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 12px;
        }
        .ori-title em { font-style: italic; color: var(--gold-400); }
        .ori-sub { font-size: 15px; color: rgba(255,255,255,0.65); max-width: 400px; margin: 0 auto; }

        .ori-body {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 0 16px 56px; margin-top: -40px;
        }

        /* Steps indicator */
        .steps-wrap {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px; animation: fadeUp .4s ease both;
        }
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600;
          border: 2px solid var(--paper-2); color: var(--ink-3);
          background: var(--white); transition: all .2s;
        }
        .step-dot.done { background: var(--green-700); border-color: var(--green-700); color: white; }
        .step-dot.active { border-color: var(--green-500); color: var(--green-700); }
        .step-line { width: 40px; height: 2px; background: var(--paper-2); }
        .step-line.done { background: var(--green-500); }

        /* Cards */
        .card {
          background: var(--white); border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg); padding: 32px; width: 100%; max-width: 600px;
          animation: fadeUp .5s ease both;
        }
        .card-title {
          font-family: var(--font-display); font-size: 22px; font-weight: 500;
          color: var(--ink); margin-bottom: 6px;
        }
        .card-desc { font-size: 14px; color: var(--ink-3); margin-bottom: 24px; }

        /* Serie grid */
        .serie-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .serie-btn {
          padding: 18px 16px; border-radius: var(--radius-lg);
          border: 2px solid var(--paper-2); background: var(--paper);
          cursor: pointer; text-align: left; transition: all .15s;
          font-family: var(--font-body);
        }
        .serie-btn:hover { border-color: var(--green-300); background: var(--green-50); }
        .serie-btn.selected { border-color: var(--green-500); background: var(--green-50); }
        .serie-label { font-size: 16px; font-weight: 700; color: var(--green-700); }
        .serie-desc  { font-size: 12px; color: var(--ink-3); margin-top: 4px; line-height: 1.4; }

        .btn-next {
          width: 100%; margin-top: 24px; padding: 15px;
          background: var(--green-700); color: white; border: none;
          border-radius: var(--radius-md); font-family: var(--font-body);
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .btn-next:hover:not(:disabled) { background: var(--green-800); }
        .btn-next:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Results */
        .results-header { margin-bottom: 16px; }
        .results-serie-tag {
          display: inline-block; padding: 4px 12px; border-radius: 100px;
          background: var(--green-50); border: 1px solid var(--green-200);
          font-size: 12px; font-weight: 600; color: var(--green-700);
          letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;
        }

        .filiere-list { display: flex; flex-direction: column; gap: 12px; }
        .filiere-card {
          padding: 18px 20px; border-radius: var(--radius-lg);
          border: 1.5px solid var(--paper-2); background: var(--white);
          transition: border-color .15s, box-shadow .15s;
        }
        .filiere-card:hover { border-color: var(--green-300); box-shadow: var(--shadow-sm); }
        .filiere-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .filiere-nom { font-size: 16px; font-weight: 600; color: var(--ink); }
        .filiere-ecole { font-size: 12px; color: var(--ink-3); margin-top: 3px; }
        .match-badge {
          padding: 4px 10px; border-radius: 100px; font-size: 11px;
          font-weight: 700; white-space: nowrap; flex-shrink: 0; border: 1.5px solid;
        }
        .filiere-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .filiere-meta-item { font-size: 12px; color: var(--ink-3); display: flex; align-items: center; gap: 5px; }
        .filiere-meta-item strong { color: var(--ink-2); font-weight: 500; }

        .btn-reset {
          width: 100%; margin-top: 20px; padding: 12px;
          background: var(--paper); color: var(--ink-2); border: 1.5px solid var(--paper-2);
          border-radius: var(--radius-md); font-family: var(--font-body);
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: background .15s;
        }
        .btn-reset:hover { background: var(--paper-2); }

        .info-box {
          margin-top: 16px; padding: 14px 18px;
          background: var(--gold-50); border: 1px solid var(--gold-100);
          border-radius: var(--radius-md); font-size: 13px; color: var(--gold-700); line-height: 1.6;
        }

        @media (max-width: 480px) {
          .serie-grid { grid-template-columns: 1fr; }
          .card { padding: 24px 18px; }
          .ori-hero { padding: 36px 20px 64px; }
        }
      `}</style>

      <div className="ori-page">
        <section className="ori-hero">
          <p className="ori-eyebrow">🧭 Module d'orientation</p>
          <h1 className="ori-title">Quelle filière après le <em>Baccalauréat</em> ?</h1>
          <p className="ori-sub">Découvrez les meilleures filières adaptées à votre série.</p>
        </section>

        <div className="ori-body">
          {/* Steps indicator */}
          <div className="steps-wrap">
            <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>1</div>
            <div className={`step-line ${step > 1 ? 'done' : ''}`} />
            <div className={`step-dot ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>2</div>
          </div>

          {/* Step 1 — Choisir la série */}
          {step === 1 && (
            <div className="card">
              <h2 className="card-title">Votre série du BAC</h2>
              <p className="card-desc">Sélectionnez la série que vous avez passée pour voir les filières recommandées.</p>
              <div className="serie-grid">
                {SERIES.map(s => (
                  <button
                    key={s.id}
                    className={`serie-btn${serie === s.id ? ' selected' : ''}`}
                    onClick={() => setSerie(s.id)}
                  >
                    <div className="serie-label">{s.label}</div>
                    <div className="serie-desc">{s.desc}</div>
                  </button>
                ))}
              </div>
              <button
                className="btn-next"
                disabled={!serie}
                onClick={() => setStep(2)}
              >
                Voir mes filières →
              </button>
            </div>
          )}

          {/* Step 2 — Résultats */}
          {step === 2 && (
            <div className="card">
              <div className="results-header">
                <span className="results-serie-tag">Série {serie}</span>
                <h2 className="card-title">Filières recommandées</h2>
                <p className="card-desc">Ces filières sont ouvertes aux titulaires du BAC {serie} au Mali.</p>
              </div>

              <div className="filiere-list">
                {filieres.map(f => {
                  const style = MATCH_COLOR(f.match)
                  return (
                    <div key={f.nom} className="filiere-card">
                      <div className="filiere-top">
                        <div>
                          <div className="filiere-nom">{f.nom}</div>
                          <div className="filiere-ecole">📍 {f.ecole}</div>
                        </div>
                        <span
                          className="match-badge"
                          style={{ background: style.bg, borderColor: style.border, color: style.text }}
                        >
                          {style.label}
                        </span>
                      </div>
                      <div className="filiere-meta">
                        <div className="filiere-meta-item">⏱️ <strong>{f.duree}</strong></div>
                        <div className="filiere-meta-item">💼 {f.debouches}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="info-box">
                💡 Ces informations sont indicatives. Consultez directement les établissements pour les conditions d'admission et les frais d'inscription officiels.
              </div>

              <button className="btn-reset" onClick={() => { setStep(1); setSerie(null) }}>
                ← Changer de série
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
