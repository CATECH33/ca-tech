import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Blog.css'

const TOPICS = [
  {
    title: 'Intelligence Artificielle',
    desc: "Agents IA, RAG, LLM fine-tuning — comment implémenter l'IA dans votre organisation.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V5a4 4 0 018 0v3" /></svg>,
  },
  {
    title: 'Automatisation',
    desc: 'N8N, Make, scripts sur mesure — workflows qui vous font gagner des heures chaque semaine.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  },
  {
    title: 'Croissance digitale',
    desc: 'SEO, conversion, acquisition — les stratégies qui génèrent des résultats mesurables.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    title: "Retours d'expérience",
    desc: 'Études de cas réelles — ce qui a fonctionné, les chiffres, les leçons apprises.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
]

export default function Blog() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <>
      <section className="blog-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="blog-hero-tag">Ressources &amp; Insights</div>
          <h1>Le blog <em>CA-TECH</em></h1>
          <p>Conseils pratiques sur l'IA, l'automatisation et la croissance digitale — pour les dirigeants qui veulent garder un temps d'avance.</p>
          <Link to="/contact" className="btn-nav" style={{ display: 'inline-block', textDecoration: 'none' }}>Parler à un expert →</Link>
        </div>
      </section>

      <div className="blog-main">
        <div className="blog-coming">
          <div className="blog-coming-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h2>Les premiers articles arrivent bientôt</h2>
          <p>Nos experts préparent du contenu actionnable sur l'IA, l'automatisation et les stratégies de croissance. Inscrivez-vous pour être notifié.</p>

          <div className="blog-newsletter">
            <h3>Restez informé</h3>
            <p>Recevez nos articles dès leur publication — pas de spam, uniquement de la valeur.</p>
            {subscribed ? (
              <p style={{ color: '#10B981', fontWeight: 700 }}>✓ Vous êtes inscrit !</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="votre@email.fr"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button type="submit">S'inscrire</button>
              </form>
            )}
          </div>
        </div>

        <div className="blog-topics">
          {TOPICS.map(({ title, desc, icon }) => (
            <div key={title} className="blog-topic">
              <div className="blog-topic-icon">{icon}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
