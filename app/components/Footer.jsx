export default function Footer() {
  return (
    <>
      <style>{`
        .site-footer {
          padding: 28px 24px;
          text-align: center;
          font-size: 12px;
          color: var(--ink-4);
          border-top: 1px solid var(--paper-2);
          background: var(--white);
          margin-top: auto;
        }
        .site-footer a { color: var(--green-600); text-decoration: none; }
        .site-footer a:hover { text-decoration: underline; }
        .footer-links {
          display: flex; justify-content: center; gap: 20px;
          flex-wrap: wrap; margin-bottom: 10px;
        }
      `}</style>
      <footer className="site-footer">
        <div className="footer-links">
          <a href="/" >Résultats BAC</a>
          <a href="/orientation">Orientation</a>
          <a href="/cenou">CENOU</a>
          <a href="/guide">Guide</a>
          <a href="/forum">Forum</a>
        </div>
        <p>Données officielles — Ministère de l&apos;Éducation Nationale du Mali &bull; Session de juin 2025</p>
        <p style={{ marginTop: 6 }}>
          <a href="https://t.me/lordelsanto" target="_blank" rel="noopener noreferrer">
            Construit par LEVISCO EL SANTO — Contact
          </a>
        </p>
      </footer>
    </>
  )
}
