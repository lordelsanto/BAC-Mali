'use client'

import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'nationalite',
    label: 'Êtes-vous de nationalité malienne ?',
    options: [{ val: 'oui', label: 'Oui' }, { val: 'non', label: 'Non' }],
  },
  {
    id: 'etablissement',
    label: 'Êtes-vous inscrit(e) dans un établissement public d\'enseignement supérieur au Mali ?',
    hint: 'USTTB, IPR/IFRA, ENSUP, IFM, ENI, etc.',
    options: [{ val: 'oui', label: 'Oui, public' }, { val: 'non', label: 'Non, privé ou pas encore inscrit' }],
  },
  {
    id: 'revenu',
    label: 'Revenus mensuels totaux de votre foyer ?',
    hint: 'Revenus nets du père, de la mère ou tuteur légal',
    options: [
      { val: 'bas',    label: 'Moins de 100 000 F CFA / mois' },
      { val: 'moyen',  label: 'Entre 100 000 et 300 000 F CFA / mois' },
      { val: 'eleve',  label: 'Plus de 300 000 F CFA / mois' },
    ],
  },
  {
    id: 'distance',
    label: 'Distance entre votre domicile d\'origine et Bamako ?',
    options: [
      { val: 'proche',  label: 'Moins de 50 km' },
      { val: 'moyen',   label: '50 à 200 km' },
      { val: 'loin',    label: 'Plus de 200 km' },
    ],
  },
  {
    id: 'logement',
    label: 'Disposez-vous d\'un logement à Bamako (famille proche) ?',
    options: [
      { val: 'oui', label: 'Oui, j\'ai un logement chez un proche' },
      { val: 'non', label: 'Non, je dois trouver un logement' },
    ],
  },
  {
    id: 'boursier',
    label: 'Êtes-vous déjà boursier(ère) de l\'État malien ?',
    options: [
      { val: 'oui', label: 'Oui, je perçois déjà une bourse' },
      { val: 'non', label: 'Non' },
    ],
  },
]

function computeResult(answers) {
  if (answers.nationalite === 'non')     return 'ineligible'
  if (answers.etablissement === 'non')   return 'ineligible_prive'
  if (answers.boursier === 'oui')        return 'deja_boursier'
  if (answers.revenu === 'eleve')        return 'ineligible_revenu'

  const score = [
    answers.revenu    === 'bas'    ? 3 : answers.revenu  === 'moyen' ? 1 : 0,
    answers.distance  === 'loin'   ? 2 : answers.distance === 'moyen' ? 1 : 0,
    answers.logement  === 'non'    ? 2 : 0,
  ].reduce((a, b) => a + b, 0)

  if (score >= 5) return 'eligible_prioritaire'
  if (score >= 3) return 'eligible'
  return 'partiel'
}

const RESULTS = {
  ineligible: {
    icon: '🚫', color: '#FEF2F2', border: '#FECACA', textColor: '#991B1B',
    title: 'Non éligible',
    body: 'La bourse CENOU est réservée aux étudiants de nationalité malienne. Renseignez-vous auprès de votre établissement pour d\'autres aides disponibles.',
    actions: [],
  },
  ineligible_prive: {
    icon: '⚠️', color: '#FBF4E0', border: '#F5E6C0', textColor: '#8B6914',
    title: 'Non éligible (établissement privé)',
    body: 'La bourse d\'État est réservée aux étudiants des établissements publics. Si vous êtes en établissement privé agréé, renseignez-vous sur les aides spécifiques proposées par votre école.',
    actions: [],
  },
  deja_boursier: {
    icon: '✅', color: '#EEF8F1', border: '#A8DDB8', textColor: '#145A30',
    title: 'Déjà boursier(ère)',
    body: 'Vous bénéficiez déjà d\'une bourse de l\'État. Pour renouveler votre bourse ou changer de catégorie, contactez directement le CENOU avec votre relevé de notes.',
    actions: ['renouvellement'],
  },
  ineligible_revenu: {
    icon: '💼', color: '#F5F5F5', border: '#E0E0E0', textColor: '#555',
    title: 'Probablement non éligible',
    body: 'Compte tenu du niveau de revenus du foyer, vous ne correspondez pas aux critères de ressources du CENOU. Vous pouvez néanmoins déposer un dossier — la décision finale appartient à la commission.',
    actions: ['dossier'],
  },
  eligible_prioritaire: {
    icon: '🌟', color: '#EEF8F1', border: '#A8DDB8', textColor: '#0D3D22',
    title: 'Probablement éligible — Prioritaire',
    body: 'Votre profil correspond aux critères prioritaires du CENOU. Vous avez de bonnes chances d\'obtenir une bourse complète (hébergement + restauration + allocation mensuelle). Préparez votre dossier dès maintenant.',
    actions: ['dossier', 'documents'],
  },
  eligible: {
    icon: '✅', color: '#EEF8F1', border: '#A8DDB8', textColor: '#145A30',
    title: 'Probablement éligible',
    body: 'Votre profil est compatible avec une aide CENOU. Selon les places disponibles, vous pourrez bénéficier de la restauration et/ou d\'une allocation partielle. Déposez votre dossier dans les délais.',
    actions: ['dossier', 'documents'],
  },
  partiel: {
    icon: '🍽️', color: '#FBF4E0', border: '#F5E6C0', textColor: '#8B6914',
    title: 'Éligible — Restauration seulement',
    body: 'Vous pouvez probablement bénéficier du service de restauration du CENOU à tarif réduit. L\'hébergement et la bourse complète sont attribués en priorité aux situations les plus précaires.',
    actions: ['dossier'],
  },
}

const DOCUMENTS = [
  'Extrait d\'acte de naissance (original)',
  'Certificat de nationalité malienne',
  'Attestation d\'inscription ou certificat de scolarité (année en cours)',
  'Relevé de notes du BAC ou dernier relevé académique',
  'Attestation de revenus du père / de la mère (mairie ou employeur)',
  'Certificat de résidence du foyer familial',
  '2 photos d\'identité récentes',
  'Lettre de demande de bourse adressée au Directeur du CENOU',
]

export default function CenouPage() {
  const [answers, setAnswers] = useState({})
  const [step, setStep]       = useState(0)   // 0 = intro, 1-6 = questions, 7 = result
  const [showDocs, setShowDocs] = useState(false)

  const currentQ  = QUESTIONS[step - 1]
  const totalSteps = QUESTIONS.length
  const result     = step > totalSteps ? computeResult(answers) : null
  const res        = result ? RESULTS[result] : null

  function handleAnswer(val) {
    const newAnswers = { ...answers, [currentQ.id]: val }
    setAnswers(newAnswers)
    if (step < totalSteps) setStep(step + 1)
    else setStep(totalSteps + 1)
  }

  function reset() { setAnswers({}); setStep(0); setShowDocs(false) }

  return (
    <>
      <style>{`
        .cenou-page { min-height: 80vh; display: flex; flex-direction: column; }
        .cenou-hero {
          background: var(--green-800); color: white;
          padding: 48px 24px 72px; text-align: center;
        }
        .cenou-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--gold-400); margin-bottom: 12px;
        }
        .cenou-title {
          font-family: var(--font-display); font-size: clamp(26px, 4vw, 42px);
          font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 12px;
        }
        .cenou-title em { font-style: italic; color: var(--gold-400); }
        .cenou-sub { font-size: 15px; color: rgba(255,255,255,0.65); max-width: 420px; margin: 0 auto; }

        .cenou-body {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 0 16px 56px; margin-top: -40px;
        }
        .cenou-card {
          background: var(--white); border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg); padding: 36px 32px; width: 100%;
          max-width: 560px; animation: fadeUp .5s ease both;
        }

        /* Progress */
        .progress-bar-wrap { margin-bottom: 24px; }
        .progress-label { font-size: 12px; color: var(--ink-3); margin-bottom: 8px; }
        .progress-bar { height: 4px; background: var(--paper-2); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--green-500); transition: width .3s ease; border-radius: 2px; }

        /* Question */
        .q-label { font-family: var(--font-display); font-size: 19px; font-weight: 500; color: var(--ink); margin-bottom: 6px; line-height: 1.35; }
        .q-hint  { font-size: 12px; color: var(--ink-3); margin-bottom: 20px; }
        .options-list { display: flex; flex-direction: column; gap: 10px; }
        .option-btn {
          padding: 15px 18px; border-radius: var(--radius-md); border: 2px solid var(--paper-2);
          background: var(--paper); font-family: var(--font-body); font-size: 14px;
          color: var(--ink); text-align: left; cursor: pointer; transition: all .15s;
        }
        .option-btn:hover { border-color: var(--green-400); background: var(--green-50); }

        /* Intro */
        .intro-icon { font-size: 48px; margin-bottom: 16px; text-align: center; }
        .intro-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--ink); margin-bottom: 10px; }
        .intro-body  { font-size: 14px; color: var(--ink-2); line-height: 1.7; margin-bottom: 8px; }
        .btn-start {
          width: 100%; margin-top: 24px; padding: 15px;
          background: var(--green-700); color: white; border: none;
          border-radius: var(--radius-md); font-family: var(--font-body);
          font-size: 15px; font-weight: 600; cursor: pointer; transition: background .15s;
        }
        .btn-start:hover { background: var(--green-800); }

        /* Result */
        .result-box {
          padding: 24px; border-radius: var(--radius-lg);
          border: 2px solid; margin-bottom: 20px; text-align: center;
        }
        .result-icon { font-size: 40px; margin-bottom: 12px; }
        .result-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; margin-bottom: 8px; }
        .result-body  { font-size: 14px; line-height: 1.7; }

        .docs-toggle {
          width: 100%; padding: 12px; border-radius: var(--radius-md);
          border: 1.5px solid var(--green-200); background: var(--green-50);
          color: var(--green-700); font-family: var(--font-body); font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all .15s; margin-top: 12px;
        }
        .docs-toggle:hover { background: var(--green-100); }
        .docs-list {
          margin-top: 14px; padding: 18px 20px;
          background: var(--paper); border-radius: var(--radius-md); list-style: none;
        }
        .docs-list li {
          font-size: 13px; color: var(--ink-2); padding: 6px 0;
          border-bottom: 1px solid var(--paper-2); display: flex; gap: 8px;
          align-items: flex-start;
        }
        .docs-list li:last-child { border-bottom: none; }
        .btn-reset {
          width: 100%; margin-top: 16px; padding: 12px;
          background: var(--paper); color: var(--ink-2);
          border: 1.5px solid var(--paper-2); border-radius: var(--radius-md);
          font-family: var(--font-body); font-size: 14px; cursor: pointer;
          transition: background .15s;
        }
        .btn-reset:hover { background: var(--paper-2); }

        .disclaimer {
          margin-top: 16px; padding: 12px 16px;
          background: var(--gold-50); border: 1px solid var(--gold-100);
          border-radius: var(--radius-md); font-size: 12px; color: var(--gold-700); line-height: 1.6;
        }

        @media (max-width: 480px) {
          .cenou-card { padding: 24px 18px; }
          .cenou-hero { padding: 36px 20px 64px; }
        }
      `}</style>

      <div className="cenou-page">
        <section className="cenou-hero">
          <p className="cenou-eyebrow">🏛️ Bourse & Aides sociales</p>
          <h1 className="cenou-title">Éligibilité <em>CENOU</em></h1>
          <p className="cenou-sub">Répondez à 6 questions pour savoir si vous êtes probablement éligible à une aide du Centre National des Œuvres Universitaires.</p>
        </section>

        <div className="cenou-body">
          <div className="cenou-card">

            {/* INTRO */}
            {step === 0 && (
              <>
                <div className="intro-icon">🏛️</div>
                <h2 className="intro-title">Qu'est-ce que le CENOU ?</h2>
                <p className="intro-body">
                  Le <strong>Centre National des Œuvres Universitaires (CENOU)</strong> est l'organisme malien qui attribue des aides sociales aux étudiants : bourse mensuelle, hébergement en cité universitaire, et restauration à tarif réduit.
                </p>
                <p className="intro-body">
                  Ce test rapide (6 questions) vous donne une <strong>estimation indicative</strong> de votre éligibilité, avant de constituer votre dossier officiel.
                </p>
                <button className="btn-start" onClick={() => setStep(1)}>
                  Commencer le test →
                </button>
              </>
            )}

            {/* QUESTIONS */}
            {step >= 1 && step <= totalSteps && (
              <>
                <div className="progress-bar-wrap">
                  <div className="progress-label">Question {step} sur {totalSteps}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
                  </div>
                </div>
                <p className="q-label">{currentQ.label}</p>
                {currentQ.hint && <p className="q-hint">💡 {currentQ.hint}</p>}
                <div className="options-list">
                  {currentQ.options.map(o => (
                    <button key={o.val} className="option-btn" onClick={() => handleAnswer(o.val)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* RESULT */}
            {step > totalSteps && res && (
              <>
                <div className="result-box" style={{ background: res.color, borderColor: res.border }}>
                  <div className="result-icon">{res.icon}</div>
                  <div className="result-title" style={{ color: res.textColor }}>{res.title}</div>
                  <div className="result-body" style={{ color: res.textColor }}>{res.body}</div>
                </div>

                {res.actions.includes('documents') && (
                  <>
                    <button className="docs-toggle" onClick={() => setShowDocs(!showDocs)}>
                      {showDocs ? '▲ Masquer les documents requis' : '📄 Voir les documents à préparer'}
                    </button>
                    {showDocs && (
                      <ul className="docs-list">
                        {DOCUMENTS.map((d, i) => (
                          <li key={i}><span>📌</span>{d}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {res.actions.includes('dossier') && (
                  <a
                    href="/guide#cenou"
                    style={{
                      display: 'block', marginTop: 12, padding: '12px 18px',
                      background: 'var(--green-700)', color: 'white', borderRadius: 'var(--radius-md)',
                      textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 600
                    }}
                  >
                    📋 Voir le guide CENOU complet →
                  </a>
                )}

                <div className="disclaimer">
                  ⚠️ Ce résultat est <strong>indicatif et non officiel</strong>. La décision finale appartient à la Commission CENOU. Nous vous encourageons à déposer votre dossier même en cas de doute.
                </div>

                <button className="btn-reset" onClick={reset}>← Refaire le test</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
