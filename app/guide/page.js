'use client'

import { useState } from 'react'

const GUIDES = [
  {
    id: 'inscription',
    icon: '🎓',
    titre: "S'inscrire à l'université au Mali",
    categorie: 'Inscription',
    etapes: [
      { titre: 'Obtenir vos résultats officiels', desc: 'Récupérez votre relevé de notes ou votre attestation de réussite au BAC auprès de votre centre d\'examen ou à la Direction Nationale des Examens et Concours (DNEC).' },
      { titre: 'Choisir votre établissement et filière', desc: 'Consultez la page Orientation de ce site pour identifier les filières adaptées à votre série. Renseignez-vous sur les conditions d\'admission (concours, dossier, notes minimales).' },
      { titre: 'Constituer votre dossier d\'inscription', desc: 'Documents généralement requis : extrait d\'acte de naissance, certificat de nationalité, attestation de réussite BAC, 4 photos d\'identité, formulaire d\'inscription rempli, reçu de paiement des frais.' },
      { titre: 'Déposer le dossier', desc: 'Déposez votre dossier au secrétariat de l\'établissement dans les délais indiqués. Pour l\'USTTB, le dépôt se fait au service de scolarité de chaque faculté.' },
      { titre: 'Obtenir la carte étudiant', desc: 'Après validation de votre inscription, récupérez votre carte d\'étudiant. Elle est indispensable pour accéder aux services du CENOU et aux examens.' },
    ],
    docs: ['Attestation de réussite au BAC', 'Extrait d\'acte de naissance', 'Certificat de nationalité', '4 photos d\'identité', 'Formulaire d\'inscription (à retirer sur place)', 'Frais d\'inscription (variables selon l\'établissement)'],
    delai: 'Juillet – Octobre (selon les établissements)',
    cout: 'Gratuit dans les établissements publics (frais administratifs minimes)',
    contact: 'Secrétariat de l\'établissement choisi',
  },
  {
    id: 'cenou',
    icon: '🏛️',
    titre: 'Demander une bourse CENOU',
    categorie: 'Bourse & Aides',
    etapes: [
      { titre: 'Vérifier votre éligibilité', desc: 'Utilisez notre test d\'éligibilité CENOU sur ce site. Les critères principaux sont : nationalité malienne, établissement public, revenus familiaux modestes, éloignement du foyer.' },
      { titre: 'Retirer le formulaire de demande', desc: 'Récupérez le formulaire officiel de demande de bourse au siège du CENOU à Bamako (Avenue de l\'OUA, près du stade Omnisports) ou dans les antennes régionales.' },
      { titre: 'Constituer votre dossier complet', desc: 'Rassemblez tous les documents requis. Assurez-vous que les attestations de revenus sont signées et tamponnées par l\'autorité compétente (mairie, employeur).' },
      { titre: 'Déposer le dossier', desc: 'Déposez votre dossier complet au guichet CENOU entre octobre et novembre de votre première année universitaire. Conservez le récépissé de dépôt.' },
      { titre: 'Suivre votre dossier', desc: 'La commission se réunit en général en décembre-janvier. Vous serez informé(e) par votre établissement ou par affichage au CENOU.' },
    ],
    docs: ['Extrait d\'acte de naissance', 'Certificat de nationalité malienne', 'Certificat de scolarité de l\'année en cours', 'Relevé de notes du BAC', 'Attestation de revenus des parents (mairie ou employeur)', 'Certificat de résidence du foyer', '2 photos d\'identité', 'Lettre de demande adressée au Directeur CENOU'],
    delai: 'Octobre – Novembre (chaque année)',
    cout: 'Gratuit',
    contact: 'CENOU — Avenue de l\'OUA, Bamako. Tél : +223 20 21 XX XX',
  },
  {
    id: 'transfert',
    icon: '🔄',
    titre: 'Faire un transfert interuniversitaire',
    categorie: 'Scolarité',
    etapes: [
      { titre: 'Obtenir l\'accord de l\'établissement d\'accueil', desc: 'Prenez contact avec le secrétariat de l\'établissement où vous souhaitez vous transférer. Vérifiez qu\'ils acceptent les transferts dans votre filière et pour votre niveau.' },
      { titre: 'Faire une demande de transfert à votre établissement actuel', desc: 'Rédigez une lettre de demande de transfert adressée au chef d\'établissement. Joignez les raisons du transfert et l\'accord de principe de l\'établissement d\'accueil.' },
      { titre: 'Récupérer votre relevé de notes et certificat de scolarité', desc: 'Ces documents seront transmis à l\'établissement d\'accueil. Assurez-vous d\'être en règle avec les frais de scolarité de votre établissement actuel.' },
      { titre: 'S\'inscrire dans le nouvel établissement', desc: 'Avec les documents reçus, inscrivez-vous formellement dans l\'établissement d\'accueil. Une équivalence de vos UE (unités d\'enseignement) sera réalisée.' },
    ],
    docs: ['Relevé de notes complet', 'Certificat de scolarité', 'Lettre de demande de transfert', 'Accord de l\'établissement d\'accueil (écrit)', 'Quitus financier (attestation de non-dette)'],
    delai: 'Fin d\'année académique (mai-juin) ou début d\'année (septembre)',
    cout: 'Variable selon les établissements',
    contact: 'Secrétariat des deux établissements concernés',
  },
  {
    id: 'equivalence',
    icon: '📜',
    titre: 'Obtenir l\'équivalence d\'un diplôme étranger',
    categorie: 'Diplôme',
    etapes: [
      { titre: 'Rassembler vos diplômes et relevés officiels', desc: 'Obtenez des copies certifiées conformes de vos diplômes étrangers. Si les documents ne sont pas en français, une traduction officielle assermentée est nécessaire.' },
      { titre: 'Déposer une demande à la DGESRS', desc: 'La Direction Générale de l\'Enseignement Supérieur et de la Recherche Scientifique (DGESRS) est l\'autorité compétente pour les équivalences au Mali. Déposez votre dossier à leur siège à Bamako.' },
      { titre: 'Attendre la décision de la commission', desc: 'La commission d\'équivalence étudie votre dossier et statue sur le niveau académique correspondant dans le système malien. Ce processus peut prendre 1 à 3 mois.' },
      { titre: 'Récupérer l\'attestation d\'équivalence', desc: 'Une fois la décision rendue, récupérez votre attestation officielle d\'équivalence. Ce document est nécessaire pour toute inscription dans un établissement malien.' },
    ],
    docs: ['Diplôme original + copie certifiée', 'Traduction officielle (si non francophone)', 'Relevés de notes complets', 'Passeport ou pièce d\'identité', 'Lettre de demande d\'équivalence'],
    delai: '1 à 3 mois',
    cout: 'Frais administratifs (variables)',
    contact: 'DGESRS — Ministère de l\'Enseignement Supérieur, Bamako',
  },
  {
    id: 'carte',
    icon: '🪪',
    titre: 'Obtenir votre carte d\'étudiant',
    categorie: 'Scolarité',
    etapes: [
      { titre: 'Finaliser votre inscription administrative', desc: 'La carte d\'étudiant est délivrée après validation complète de votre dossier d\'inscription. Assurez-vous d\'avoir payé tous les frais requis.' },
      { titre: 'Fournir une photo récente', desc: 'Apportez 2 photos d\'identité récentes (fond blanc ou bleu) au service de scolarité.' },
      { titre: 'Récupérer la carte au secrétariat', desc: 'Dans la plupart des établissements, la carte est remise sous 2 à 4 semaines. Certains établissements l\'envoient par voie d\'affichage ou SMS.' },
    ],
    docs: ['Reçu de paiement des frais d\'inscription', '2 photos d\'identité récentes', 'Pièce d\'identité nationale'],
    delai: '2 à 4 semaines après inscription',
    cout: 'Inclus dans les frais d\'inscription',
    contact: 'Service de scolarité de votre établissement',
  },
  {
    id: 'recours',
    icon: '⚖️',
    titre: 'Recours en cas de contestation de résultat',
    categorie: 'Examens',
    etapes: [
      { titre: 'Délai à respecter', desc: 'Tout recours doit être déposé dans les 5 jours ouvrables suivant la publication officielle des résultats. Passé ce délai, aucune demande ne sera recevable.' },
      { titre: 'Rédiger une lettre de recours', desc: 'Rédigez une lettre formelle adressée au Directeur de la DNEC. Précisez votre numéro de place, votre centre, l\'année, la matière contestée et les motifs du recours.' },
      { titre: 'Déposer le dossier à la DNEC', desc: 'Déposez votre lettre (avec copies de votre convocation et relevé si disponible) à la Direction Nationale des Examens et Concours à Bamako.' },
      { titre: 'Attendre la décision', desc: 'La commission de recours se prononce généralement dans les 15 jours. La décision est définitive.' },
    ],
    docs: ['Lettre de recours rédigée et signée', 'Copie de la convocation au BAC', 'Copie du relevé de notes (si disponible)', 'Pièce d\'identité'],
    delai: '5 jours ouvrables après publication des résultats',
    cout: 'Gratuit',
    contact: 'DNEC — Direction Nationale des Examens et Concours, Bamako',
  },
]

export default function GuidePage() {
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('Tous')

  const categories = ['Tous', ...new Set(GUIDES.map(g => g.categorie))]
  const filtered   = filter === 'Tous' ? GUIDES : GUIDES.filter(g => g.categorie === filter)

  return (
    <>
      <style>{`
        .guide-page { min-height: 80vh; display: flex; flex-direction: column; }
        .guide-hero {
          background: var(--green-800); color: white;
          padding: 48px 24px 72px; text-align: center;
        }
        .guide-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--gold-400); margin-bottom: 12px;
        }
        .guide-title {
          font-family: var(--font-display); font-size: clamp(26px, 4vw, 42px);
          font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 12px;
        }
        .guide-title em { font-style: italic; color: var(--gold-400); }
        .guide-sub { font-size: 15px; color: rgba(255,255,255,0.65); max-width: 420px; margin: 0 auto; }

        .guide-body {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 0 16px 56px; margin-top: -40px;
        }
        .guide-inner { width: 100%; max-width: 680px; }

        /* Filter tabs */
        .filter-tabs {
          display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;
          animation: fadeUp .4s ease both;
        }
        .filter-tab {
          padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500;
          border: 1.5px solid var(--paper-2); background: var(--white); color: var(--ink-2);
          cursor: pointer; transition: all .15s; font-family: var(--font-body);
        }
        .filter-tab:hover  { border-color: var(--green-300); color: var(--green-700); }
        .filter-tab.active { background: var(--green-700); border-color: var(--green-700); color: white; }

        /* Accordion */
        .accordion-list { display: flex; flex-direction: column; gap: 10px; animation: fadeUp .5s ease both; }
        .accordion-item {
          background: var(--white); border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm); overflow: hidden;
          border: 1.5px solid var(--paper-2); transition: border-color .15s;
        }
        .accordion-item.open { border-color: var(--green-200); }
        .accordion-header {
          display: flex; align-items: center; gap: 14px; padding: 18px 20px;
          cursor: pointer; width: 100%; background: none; border: none;
          text-align: left; font-family: var(--font-body); transition: background .15s;
        }
        .accordion-header:hover { background: var(--paper); }
        .accordion-icon { font-size: 24px; flex-shrink: 0; }
        .accordion-info { flex: 1; }
        .accordion-cat  { font-size: 11px; color: var(--ink-4); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; }
        .accordion-titre { font-size: 15px; font-weight: 600; color: var(--ink); }
        .accordion-arrow { color: var(--ink-4); font-size: 14px; flex-shrink: 0; transition: transform .2s; }
        .accordion-item.open .accordion-arrow { transform: rotate(180deg); }

        .accordion-body { padding: 0 20px 20px; border-top: 1px solid var(--paper-2); }

        /* Etapes */
        .etapes-title { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); margin: 16px 0 12px; }
        .etape-item { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--paper-2); }
        .etape-item:last-child { border-bottom: none; }
        .etape-num {
          width: 26px; height: 26px; border-radius: 50%; background: var(--green-700);
          color: white; font-size: 12px; font-weight: 700; display: flex;
          align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
        }
        .etape-content {}
        .etape-titre { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .etape-desc  { font-size: 13px; color: var(--ink-2); line-height: 1.6; }

        /* Meta grid */
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
        .meta-item { padding: 12px 14px; background: var(--paper); border-radius: var(--radius-md); }
        .meta-key { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); margin-bottom: 4px; }
        .meta-val { font-size: 13px; color: var(--ink-2); }

        /* Docs */
        .docs-section { margin-top: 16px; }
        .docs-section-title { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 10px; }
        .docs-items { list-style: none; display: flex; flex-direction: column; gap: 6px; }
        .docs-items li { font-size: 13px; color: var(--ink-2); display: flex; gap: 8px; align-items: flex-start; }

        @media (max-width: 480px) {
          .guide-hero { padding: 36px 20px 64px; }
          .meta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="guide-page">
        <section className="guide-hero">
          <p className="guide-eyebrow">📋 Guide pratique</p>
          <h1 className="guide-title">Toutes vos <em>démarches</em> expliquées</h1>
          <p className="guide-sub">Procédures officielles, documents requis et délais pour chaque étape de votre parcours étudiant.</p>
        </section>

        <div className="guide-body">
          <div className="guide-inner">
            <div className="filter-tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-tab${filter === cat ? ' active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="accordion-list">
              {filtered.map(guide => {
                const isOpen = openId === guide.id
                return (
                  <div key={guide.id} id={guide.id} className={`accordion-item${isOpen ? ' open' : ''}`}>
                    <button className="accordion-header" onClick={() => setOpenId(isOpen ? null : guide.id)}>
                      <span className="accordion-icon">{guide.icon}</span>
                      <div className="accordion-info">
                        <div className="accordion-cat">{guide.categorie}</div>
                        <div className="accordion-titre">{guide.titre}</div>
                      </div>
                      <span className="accordion-arrow">▼</span>
                    </button>

                    {isOpen && (
                      <div className="accordion-body">
                        <p className="etapes-title">Étapes à suivre</p>
                        {guide.etapes.map((etape, i) => (
                          <div key={i} className="etape-item">
                            <div className="etape-num">{i + 1}</div>
                            <div className="etape-content">
                              <div className="etape-titre">{etape.titre}</div>
                              <div className="etape-desc">{etape.desc}</div>
                            </div>
                          </div>
                        ))}

                        <div className="meta-grid">
                          <div className="meta-item">
                            <div className="meta-key">📅 Délai</div>
                            <div className="meta-val">{guide.delai}</div>
                          </div>
                          <div className="meta-item">
                            <div className="meta-key">💰 Coût</div>
                            <div className="meta-val">{guide.cout}</div>
                          </div>
                          <div className="meta-item" style={{ gridColumn: '1 / -1' }}>
                            <div className="meta-key">📞 Contact</div>
                            <div className="meta-val">{guide.contact}</div>
                          </div>
                        </div>

                        <div className="docs-section">
                          <div className="docs-section-title">📄 Documents à préparer</div>
                          <ul className="docs-items">
                            {guide.docs.map((d, i) => (
                              <li key={i}><span>📌</span>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
