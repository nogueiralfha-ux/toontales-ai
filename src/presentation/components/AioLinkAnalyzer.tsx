import React, { useState } from 'react';

export interface LinkAnalysisData {
  url: string;
  category: string;
  notes: string;
}

interface AioLinkAnalyzerProps {
  onAnalyzeLink: (data: LinkAnalysisData) => void;
  onBack: () => void;
}

export const AioLinkAnalyzer: React.FC<AioLinkAnalyzerProps> = ({ onAnalyzeLink, onBack }) => {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && category) {
      onAnalyzeLink({ url, category, notes });
    }
  };

  return (
    <div className="quiz-container">
      <div className="glow-orb orb-primary" />
      
      <header className="quiz-header">
        <button className="btn-back" onClick={onBack}>
          ← Voltar
        </button>
        <span className="quiz-step-indicator" style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>
          🔗 ANALISADOR DE CONCORRENTES
        </span>
      </header>

      <main className="quiz-card-content">
        <div className="quiz-step-view">
          <h2>Cole a URL do Produto ou Serviço de Referência</h2>
          <p className="step-desc">
            Analisaremos o modelo de negócios dele e recomendaremos formas de criar a sua própria versão com diferenciais competitivos.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'white', fontWeight: 700 }}>URL do Concorrente (Site, Loja, Página de Vendas ou Rede Social):</label>
              <input
                type="url"
                required
                placeholder="https://exemplo.com/produto-ou-servico"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'white', fontWeight: 700 }}>Que tipo de produto/serviço é esse?</label>
              <div className="option-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {[
                  { id: 'digital', title: '💻 Produto Digital', desc: 'SaaS, software, curso, ebook, planilha, comunidade.' },
                  { id: 'physical', title: '📦 Produto Físico', desc: 'E-commerce, garrafas, eletrônicos, cosméticos.' },
                  { id: 'service', title: '🛠️ Serviço / Agência', desc: 'Clínicas, consultoria, advocacia, reformas locais.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quiz-option-btn ${category === opt.id ? 'active' : ''}`}
                    onClick={() => setCategory(opt.id)}
                    style={{ padding: '1rem' }}
                  >
                    <h3 style={{ fontSize: '0.95rem' }}>{opt.title}</h3>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'white', fontWeight: 700 }}>O que você acha que poderia ser melhor nele? (Opcional):</label>
              <textarea
                placeholder="Exemplo: Acho que o preço é muito caro, ou o frete demora, ou é difícil de usar pelo celular..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.95rem',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary-aio"
              disabled={!url || !category}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                marginTop: '1rem'
              }}
            >
              Analisar e Criar Alternativa ⚡
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
