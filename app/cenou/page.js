'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabaseClient } from '../../lib/supabaseClient'
import { cleanText, computeCenouScore } from '../../lib/content-utils'

function groupByCategory(rows) {
  return rows.reduce((acc, row) => {
    const key = cleanText(row.categorie)
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {})
}

// ─── Variants ────────────────────────────────────────────────
const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
}
const cardSpring = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 24 } },
}
const resultSpring = {
  hidden: { opacity: 0, height: 0, scale: 0.97 },
  show:   { opacity: 1, height: 'auto', scale: 1, transition: { type: 'spring', stiffness: 260, damping: 26 } },
  exit:   { opacity: 0, height: 0, transition: { duration: 0.2 } },
}
const breakdownStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const breakdownItem = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3 } },
}
const sideStagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
const sideBlock = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function CenouPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rules, setRules] = useState([])
  const [answers, setAnswers] = useState({
    nationalite: 'oui',
    statutEtudiant: 'oui',
    moyenneBac: '',
    dureeLycee: '3',
    genre: 'masculin',
    orphelin: 'non',
    serieBac: '',
    aideSociale: 'non',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadRules() {
      setLoading(true); setError('')
      try {
        const client = getSupabaseClient()
        if (!client) throw new Error('Supabase non configuré. Vérifiez les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans Vercel.')
        const { data, error: queryError } = await client.from('cenou_rules').select('*').order('id', { ascending: true })
        if (queryError) throw queryError
        if (!cancelled) setRules(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Impossible de charger les règles CENOU.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadRules()
    return () => { cancelled = true }
  }, [])

  const grouped = useMemo(() => groupByCategory(rules), [rules])
  const requiredConditions    = grouped.condition_generale || []
  const scoringRules          = grouped.bareme || []
  const bonusRules            = grouped.bonification || []
  const specialAidRules       = grouped.aide_sociale || []
  const seriesExamples        = useMemo(() => (grouped.serie_concernee || []).map(row => cleanText(row.condition)).filter(Boolean), [grouped])
  const documents             = grouped.piece || []
  const conditionalDocuments  = grouped.piece_conditionnelle || []
  const procedureRules        = grouped.procedure || []
  const resultRules           = grouped.resultat || []
  const ambiguityRules        = grouped.ambiguite || []

  const result = useMemo(() => {
    if (!submitted) return null
    return computeCenouScore({
      isMalian: answers.nationalite === 'oui',
      isRegularStudent: answers.statutEtudiant === 'oui',
      moyenneBac: answers.moyenneBac,
      dureeLycee: answers.dureeLycee,
      genre: answers.genre,
      isOrphan: answers.orphelin === 'oui',
      serieBac: answers.serieBac,
      knownScientificSeries: seriesExamples,
    })
  }, [answers, submitted, seriesExamples])

  function updateField(key, value) { setAnswers(prev => ({ ...prev, [key]: value })) }
  function handleSubmit(event) { event.preventDefault(); setSubmitted(true) }
  function resetForm() {
    setSubmitted(false)
    setAnswers({ nationalite: 'oui', statutEtudiant: 'oui', moyenneBac: '', dureeLycee: '3', genre: 'masculin', orphelin: 'non', serieBac: '', aideSociale: 'non' })
  }

  const canCompute = answers.moyenneBac !== '' && answers.serieBac !== ''

  return (
    <>
      <style>{`
        .cenou-page { min-height: 80vh; display: flex; flex-direction: column; }
        .cenou-hero { background: var(--green-800); color: white; padding: 48px 24px 72px; text-align: center; }
        .cenou-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold-400); margin-bottom: 12px; }
        .cenou-title { font-family: var(--font-display); font-size: clamp(26px, 4vw, 42px); font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 12px; }
        .cenou-title em { font-style: italic; color: var(--gold-400); }
        .cenou-sub { font-size: 15px; color: rgba(255,255,255,0.65); max-width: 520px; margin: 0 auto; }
        .cenou-body { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0 16px 56px; margin-top: -40px; }
        .cenou-card { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 32px; width: 100%; max-width: 920px; }
        .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 20px; }
        .section-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--ink); margin-bottom: 8px; }
        .section-desc { font-size: 14px; color: var(--ink-3); line-height: 1.6; margin-bottom: 20px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 12px; font-weight: 700; color: var(--ink-3); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
        .field input, .field select { width: 100%; padding: 13px 14px; border-radius: 12px; border: 1.5px solid var(--paper-2); background: var(--paper); font-size: 14px; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .field input:focus, .field select:focus { border-color: var(--green-400); background: var(--white); box-shadow: 0 0 0 3px rgba(46,154,92,0.1); }
        .radio-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .radio-pill { padding: 10px 14px; border-radius: 999px; border: 1.5px solid var(--paper-2); background: var(--paper); font-size: 13px; cursor: pointer; transition: all .15s; color: var(--ink-2); }
        .radio-pill.active { background: var(--green-50); border-color: var(--green-400); color: var(--green-700); }
        .btn-submit, .btn-reset { width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: background .15s, border-color .15s; }
        .btn-submit { background: var(--green-700); color: white; border: none; }
        .btn-submit:hover:not(:disabled) { background: var(--green-800); }
        .btn-submit:disabled { opacity: .45; cursor: not-allowed; }
        .btn-reset { margin-top: 10px; background: var(--paper); border: 1.5px solid var(--paper-2); color: var(--ink-2); }
        .side-block { background: var(--paper); border: 1px solid var(--paper-2); border-radius: 16px; padding: 18px; margin-bottom: 14px; }
        .side-block h3 { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
        .plain-list { padding-left: 18px; }
        .plain-list li { margin-bottom: 8px; font-size: 13px; color: var(--ink-2); line-height: 1.55; }
        .result-box { margin-top: 18px; padding: 20px; border-radius: 16px; border: 1.5px solid var(--paper-2); background: var(--white); overflow: hidden; }
        .result-title { font-family: var(--font-display); font-size: 20px; font-weight: 500; color: var(--ink); margin-bottom: 8px; }
        .score-pill { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 999px; background: var(--green-50); border: 1px solid var(--green-200); color: var(--green-700); font-size: 13px; font-weight: 700; margin-bottom: 12px; }
        .result-text { font-size: 14px; color: var(--ink-2); line-height: 1.7; }
        .breakdown { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
        .breakdown-item { padding: 12px 14px; border-radius: 14px; background: var(--paper); border: 1px solid var(--paper-2); }
        .breakdown-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
        .breakdown-label { font-size: 13px; font-weight: 700; color: var(--ink); }
        .breakdown-points { font-size: 12px; font-weight: 700; color: var(--green-700); }
        .breakdown-value { font-size: 12px; color: var(--ink-3); }
        .note-box { margin-top: 14px; padding: 14px 16px; border-radius: 14px; background: var(--gold-50); border: 1px solid var(--gold-100); font-size: 13px; color: var(--gold-700); line-height: 1.65; }
        .state-box { background: var(--white); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 28px; width: 100%; max-width: 760px; text-align: center; }
        @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .cenou-card { padding: 24px 18px; } .cenou-hero { padding: 36px 20px 64px; } }
      `}</style>

      <div className="cenou-page">
        {/* ─── Hero ─── */}
        <motion.section
          className="cenou-hero"
          variants={heroStagger}
          initial="hidden"
          animate="show"
        >
          <motion.p className="cenou-eyebrow" variants={heroItem}>🏛️ Test CENOU</motion.p>
          <motion.h1 className="cenou-title" variants={heroItem}>Éligibilité <em>CENOU / Bourse</em></motion.h1>
          <motion.p className="cenou-sub" variants={heroItem}>
            Le calcul ci-dessous utilise les critères importés depuis votre table <strong>cenou_rules</strong> : conditions générales, barème, bonifications et pièces à fournir.
          </motion.p>
        </motion.section>

        <div className="cenou-body">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                className="state-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="section-title">Chargement…</h2>
                <p className="section-desc">Récupération des règles CENOU depuis Supabase.</p>
              </motion.div>
            )}

            {/* Error */}
            {!loading && error && (
              <motion.div
                key="error"
                className="state-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="section-title">Impossible de charger les règles</h2>
                <p className="section-desc">{error}</p>
              </motion.div>
            )}

            {/* Main content */}
            {!loading && !error && (
              <motion.div
                key="content"
                className="cenou-card"
                variants={cardSpring}
                initial="hidden"
                animate="show"
              >
                <div className="grid">
                  {/* ─── Form column ─── */}
                  <div>
                    <h2 className="section-title">Calculer votre score</h2>
                    <p className="section-desc">Le site ne déduit pas de seuil inventé. Il calcule le total de points à partir du barème officiel fourni et signale seulement si les conditions générales sont remplies.</p>

                    <form onSubmit={handleSubmit}>
                      <div className="field"><label>Nationalité malienne</label><div className="radio-list">{['oui','non'].map(value => <motion.button type="button" key={value} className={`radio-pill${answers.nationalite === value ? ' active' : ''}`} onClick={() => updateField('nationalite', value)} whileTap={{ scale: 0.93 }}>{value === 'oui' ? 'Oui' : 'Non'}</motion.button>)}</div></div>
                      <div className="field"><label>Étudiant régulier</label><div className="radio-list">{[{value:'oui',label:'Oui, institution publique / partenaire'},{value:'non',label:'Non'}].map(option => <motion.button type="button" key={option.value} className={`radio-pill${answers.statutEtudiant === option.value ? ' active' : ''}`} onClick={() => updateField('statutEtudiant', option.value)} whileTap={{ scale: 0.93 }}>{option.label}</motion.button>)}</div></div>
                      <div className="field"><label>Moyenne au baccalauréat</label><input type="number" min="0" max="20" step="0.01" value={answers.moyenneBac} onChange={event => updateField('moyenneBac', event.target.value)} placeholder="Ex : 12.75" /></div>
                      <div className="field"><label>Durée des études au lycée</label><div className="radio-list">{['3','4','5'].map(value => <motion.button type="button" key={value} className={`radio-pill${answers.dureeLycee === value ? ' active' : ''}`} onClick={() => updateField('dureeLycee', value)} whileTap={{ scale: 0.93 }}>{value} ans</motion.button>)}</div></div>
                      <div className="field"><label>Genre</label><div className="radio-list">{[{value:'masculin',label:'Masculin'},{value:'feminin',label:'Féminin'}].map(option => <motion.button type="button" key={option.value} className={`radio-pill${answers.genre === option.value ? ' active' : ''}`} onClick={() => updateField('genre', option.value)} whileTap={{ scale: 0.93 }}>{option.label}</motion.button>)}</div></div>
                      <div className="field"><label>Situation sociale</label><div className="radio-list">{[{value:'non',label:'Non orphelin(e)'},{value:'oui',label:'Orphelin(e) de père ou de mère'}].map(option => <motion.button type="button" key={option.value} className={`radio-pill${answers.orphelin === option.value ? ' active' : ''}`} onClick={() => updateField('orphelin', option.value)} whileTap={{ scale: 0.93 }}>{option.label}</motion.button>)}</div></div>
                      <div className="field"><label>Série du baccalauréat</label><select value={answers.serieBac} onChange={event => updateField('serieBac', event.target.value)}><option value="">Sélectionner une série</option>{seriesExamples.map(item => <option key={item} value={item}>{item}</option>)}<option value="AUTRE_SERIE">Autre série</option></select></div>
                      <div className="field"><label>Besoin d'aide sociale particulière</label><div className="radio-list">{[{value:'non',label:'Non'},{value:'oui',label:'Oui (handicap, maladie grave, centre d\'accueil)'}].map(option => <motion.button type="button" key={option.value} className={`radio-pill${answers.aideSociale === option.value ? ' active' : ''}`} onClick={() => updateField('aideSociale', option.value)} whileTap={{ scale: 0.93 }}>{option.label}</motion.button>)}</div></div>

                      <motion.button
                        className="btn-submit"
                        type="submit"
                        disabled={!canCompute}
                        whileTap={{ scale: 0.97 }}
                        whileHover={canCompute ? { scale: 1.01 } : {}}
                      >
                        Calculer mon score
                      </motion.button>
                      {submitted && (
                        <motion.button
                          className="btn-reset"
                          type="button"
                          onClick={resetForm}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Réinitialiser
                        </motion.button>
                      )}
                    </form>

                    {/* ─── Result box ─── */}
                    <AnimatePresence>
                      {result && (
                        <motion.div
                          className="result-box"
                          variants={resultSpring}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                        >
                          <div className="result-title">Résultat du test</div>
                          {result.isEligibleToApply ? (
                            <>
                              <motion.div
                                className="score-pill"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                              >
                                Score calculé : {result.total} point(s)
                              </motion.div>
                              <div className="result-text">Vous remplissez les <strong>conditions générales</strong> de dépôt et le site calcule un total de points à partir du barème fourni.</div>
                            </>
                          ) : (
                            <div className="result-text">Vous ne remplissez pas les conditions générales minimales pour déposer une demande d'allocation CENOU.</div>
                          )}

                          {!!result.breakdown.length && (
                            <motion.div
                              className="breakdown"
                              variants={breakdownStagger}
                              initial="hidden"
                              animate="show"
                            >
                              {result.breakdown.map((item, index) => (
                                <motion.div key={index} className="breakdown-item" variants={breakdownItem}>
                                  <div className="breakdown-head">
                                    <div className="breakdown-label">{item.label}</div>
                                    <div className="breakdown-points">+{item.points} pt(s)</div>
                                  </div>
                                  <div className="breakdown-value">{item.value}</div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}

                          {(answers.aideSociale === 'oui' || ambiguityRules.length > 0) && (
                            <motion.div
                              className="note-box"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {answers.aideSociale === 'oui' && specialAidRules[0]?.condition && <div><strong>Aide sociale :</strong> {cleanText(specialAidRules[0].condition)}.</div>}
                              {ambiguityRules.map(rule => <div key={rule.id} style={{ marginTop: 8 }}>{cleanText(rule.condition)}</div>)}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ─── Side column ─── */}
                  <motion.div
                    variants={sideStagger}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div className="side-block" variants={sideBlock}>
                      <h3>Conditions générales</h3>
                      <ul className="plain-list">{requiredConditions.map(rule => <li key={rule.id}>{cleanText(rule.condition)}</li>)}</ul>
                    </motion.div>
                    <motion.div className="side-block" variants={sideBlock}>
                      <h3>Barème et bonifications</h3>
                      <ul className="plain-list">
                        {scoringRules.map(rule => <li key={rule.id}><strong>{cleanText(rule.critere)} :</strong> {cleanText(rule.condition)} → {cleanText(rule.points)} point(s)</li>)}
                        {bonusRules.map(rule => <li key={rule.id}><strong>{cleanText(rule.critere)} :</strong> {cleanText(rule.condition)} → {cleanText(rule.points)} point(s)</li>)}
                      </ul>
                    </motion.div>
                    <motion.div className="side-block" variants={sideBlock}>
                      <h3>Pièces à fournir</h3>
                      <ul className="plain-list">
                        {documents.map(rule => <li key={rule.id}>{cleanText(rule.condition)}</li>)}
                        {conditionalDocuments.map(rule => <li key={rule.id}>{cleanText(rule.condition)}</li>)}
                      </ul>
                    </motion.div>
                    <motion.div className="side-block" variants={sideBlock}>
                      <h3>Procédure / sortie</h3>
                      <ul className="plain-list">
                        {procedureRules.map(rule => <li key={rule.id}>{cleanText(rule.condition)}</li>)}
                        {resultRules.map(rule => <li key={rule.id}>{cleanText(rule.condition)}</li>)}
                      </ul>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
