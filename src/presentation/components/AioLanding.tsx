import React from 'react';
import bannerPerfis from '../../assets/perfis_renda_extra.jpg';

interface AioLandingProps {
  onStartQuiz: () => void;
  onStartLinkAnalysis: () => void;
}

export const AioLanding: React.FC<AioLandingProps> = ({ onStartQuiz, onStartLinkAnalysis }) => {
  return (
    <div className="landing-container">
      {/* Background Glows */}
      <div className="glow-orb orb-primary" />
      <div className="glow-orb orb-secondary" />

      <header className="landing-header">
        <div className="logo-brand">
          <div className="logo-icon-aio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="brand-name">A.I.O.</h1>
            <span className="brand-tagline">Agente Inteligente de Oportunidades</span>
          </div>
        </div>
        <div className="header-status">
          <span className="badge-live">● ENGINE ONLINE</span>
        </div>
      </header>

      <main className="landing-hero" style={{ paddingBottom: '3rem' }}>
        {/* Banner de Apresentação com Imagens de Pessoas de Várias Idades e Sexos */}
        <div style={{ maxWidth: '780px', margin: '0 auto 2.5rem', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', border: '1px solid hsl(var(--border))' }}>
          <img 
            src={bannerPerfis} 
            alt="Pessoas de várias idades, sexos e profissões" 
            style={{ width: '100%', display: 'block', height: 'auto' }}
          />
        </div>

        <div className="hero-badge">
          <span>Oportunidades Reais para Qualquer Pessoa</span>
        </div>
        <h2 className="hero-title" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: '1.2' }}>
          Como fazer renda extra <br />
          <span>com a internet?</span>
        </h2>
        <p className="hero-subtitle">
          Não importa sua idade, sexo ou profissão (pedreiro, manicure, estudante, aposentado). Nós ajudamos você a descobrir ideias de negócios simples e automações práticas para colocar no ar rapidamente.
        </p>

        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <button className="btn-primary-aio" onClick={onStartQuiz}>
            Descobrir Minha Oportunidade
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          
          <button className="btn-secondary-aio" onClick={onStartLinkAnalysis}>
            Analisar Produto/Serviço Existente 🔗
          </button>
        </div>

        <section className="hero-features" style={{ marginTop: '4rem' }}>
          <div className="feature-card-aio">
            <div className="feature-icon">🔍</div>
            <h3>Para Todos</h3>
            <p>Seja você manicure, pedreiro, jovem estudante ou aposentado.</p>
          </div>
          <div className="feature-card-aio">
            <div className="feature-icon">🔗</div>
            <h3>Sem Segredos</h3>
            <p>Copie e cole o link de um produto e descubra como fazer igual.</p>
          </div>
          <div className="feature-card-aio">
            <div className="feature-icon">⚡</div>
            <h3>Rápido e Simples</h3>
            <p>Passo a passo acionável com tutoriais e ferramentas gratuitas.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 A.I.O. Software Factory. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
