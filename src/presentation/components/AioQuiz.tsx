import React, { useState } from 'react';

export interface QuizData {
  objective: string;
  capital: number;
  time: string;
  skills: string[];
  interests: string[];
}

interface AioQuizProps {
  onFinishQuiz: (data: QuizData) => void;
  onBack: () => void;
}

export const AioQuiz: React.FC<AioQuizProps> = ({ onFinishQuiz, onBack }) => {
  const [step, setStep] = useState(0); // Iniciamos no passo 0 (instruções)
  const [objective, setObjective] = useState('');
  const [capital, setCapital] = useState(500);
  const [time, setTime] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Habilidades descritas de forma ultra didática para fácil compreensão
  const skillOptions = [
    { id: 'beauty', label: 'Beleza & Estética (Manicure, Maquiagem, Cabelo, Designer de Sobrancelhas)' },
    { id: 'construction', label: 'Serviços Manuais & Reformas (Pedreiro, Pintor, Eletricista, Encanador)' },
    { id: 'commerce', label: 'Comércio & Varejo (Atendente de Mercado, Atendimento de Balcão, Caixa)' },
    { id: 'general_services', label: 'Serviços Gerais & Suporte (Limpeza de Ambientes, Servente, Entregador, Auxiliar)' },
    { id: 'nocode', label: 'Criação de Sites simples (Fazer páginas de vendas ou formulários sem saber programar)' },
    { id: 'design', label: 'Visual & Fotos (Criar posts bonitos no Canva ou portfólio usando apenas o celular)' },
    { id: 'writing', label: 'Escrever mensagens e anúncios (Boa comunicação por texto para atrair pessoas)' },
    { id: 'sales', label: 'Vendas e Lidar com Pessoas (Conversar bem por WhatsApp ou pessoalmente e fechar acordos)' }
  ];

  // Interesses traduzidos em linguagem do dia a dia
  const interestOptions = [
    { id: 'health', label: 'Saúde, Estética & Bem-estar (Clínicas, Salões de Beleza, Academias)' },
    { id: 'finance', label: 'Finanças & Negócios Locais (Ajudar pequenos comércios da minha região)' },
    { id: 'productivity', label: 'Sistemas & Aplicativos (Criar soluções por assinatura recorrente)' },
    { id: 'education', label: 'Ensinar Pessoas (Criar guias práticos, cursos simples ou mentorias)' },
    { id: 'marketing', label: 'Internet & E-commerce (Venda de produtos físicos ou digitais)' },
    { id: 'services', label: 'Prestar Serviços online (Fazer tarefas digitais para empresas e receber por trabalho)' }
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      onFinishQuiz({
        objective,
        capital,
        time,
        skills: selectedSkills,
        interests: selectedInterests
      });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Porcentagem de progresso calculando a partir da etapa zero
  const progressPercent = step === 0 ? 0 : (step / 5) * 100;

  return (
    <div className="quiz-container">
      <div className="glow-orb orb-primary" />
      
      <header className="quiz-header">
        <button className="btn-back" onClick={handlePrev}>
          ← Voltar
        </button>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="quiz-step-indicator">{step === 0 ? "Instruções" : `Passo ${step} de 5`}</span>
      </header>

      <main className="quiz-card-content">
        {step === 0 && (
          <div className="quiz-step-view" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 200, 255, 0.1)', border: '1px solid rgba(0, 200, 255, 0.3)', borderRadius: '30px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00C8FF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚀 Preparação Para O Mapeamento</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>Como obter o diagnóstico perfeito?</h2>
            <p className="step-desc" style={{ maxWidth: '580px', margin: '0 auto 2.5rem' }}>
              Nosso sistema vai cruzar suas respostas com centenas de modelos de negócios para criar a solução ideal. Para que suas pesquisas saiam corretas, siga as orientações:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>⏰</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: '#00C8FF' }}>1. Tempo Real Disponível</h4>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E0', lineHeight: 1.4, margin: 0 }}>Seja sincero nas horas livres diárias. É melhor dedicar 1 hora focada com consistência do que planejar 8 horas que você não conseguirá cumprir.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>💰</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: '#6A3DF0' }}>2. Orçamento Sincero</h4>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E0', lineHeight: 1.4, margin: 0 }}>Se você não tem dinheiro para investir agora, marque R$ 0. O A.I.O. recomendará caminhos 100% grátis com divulgação boca a boca.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🎯</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFD54A' }}>3. Suas Habilidades Contam</h4>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E0', lineHeight: 1.4, margin: 0 }}>Não tenha vergonha. Habilidades físicas (como pintura ou manicure) têm muito valor comercial na internet através de robôs de mensagens rápidos.</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="quiz-step-view">
            <h2>Qual o seu principal objetivo hoje no meio digital?</h2>
            <p className="step-desc">Selecione a opção que melhor descreve seu momento ou ambição atual.</p>
            <div className="option-grid">
              {[
                { id: 'extra', title: 'Renda Extra no tempo livre', desc: 'Quero faturar um dinheiro extra por mês sem precisar sair do meu trabalho atual.' },
                { id: 'transition', title: 'Trabalhar 100% pela Internet', desc: 'Quero migrar de carreira para ter flexibilidade de horários e trabalhar de qualquer lugar.' },
                { id: 'business', title: 'Fundar uma Plataforma/SaaS', desc: 'Quero criar um produto digital de assinatura mensal para ter ganhos que crescem de forma automática.' },
                { id: 'agency', title: 'Prestar Serviços Individuais', desc: 'Quero usar o que já sei fazer para atender clientes que me paguem por serviço executado.' }
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`quiz-option-btn ${objective === opt.id ? 'active' : ''}`}
                  onClick={() => setObjective(opt.id)}
                >
                  <h3>{opt.title}</h3>
                  <p>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="quiz-step-view">
            <h2>Quanto de dinheiro você tem disponível para iniciar o projeto?</h2>
            <p className="step-desc">O orçamento inicial define se começaremos de forma orgânica (grátis) ou contratando ferramentas.</p>
            <div className="slider-wrapper">
              <span className="slider-value">
                {capital === 0 ? 'R$ 0 (Começo 100% Grátis)' : capital === 2000 ? 'R$ 2.000+' : `R$ ${capital}`}
              </span>
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={capital}
                onChange={e => setCapital(Number(e.target.value))}
                className="quiz-range-slider"
              />
              <div className="slider-labels">
                <span>R$ 0 (Divulgação Orgânica)</span>
                <span>R$ 2.000 ou mais</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="quiz-step-view">
            <h2>Quanto tempo livre por dia você pode dedicar ao projeto?</h2>
            <p className="step-desc">Seja realista. A consistência no dia a dia é mais importante do que a intensidade.</p>
            <div className="option-grid">
              {[
                { id: 'part-1', title: 'Pouco tempo (1 a 2 horas/dia)', desc: 'Para quem estuda, trabalha fora e quer começar devagar.' },
                { id: 'part-4', title: 'Tempo Parcial (3 a 4 horas/dia)', desc: 'Foco focado após o expediente principal para ter tração média.' },
                { id: 'full', title: 'Tempo Integral (8 horas ou mais)', desc: 'Dedicação exclusiva ao novo projeto para obter resultados rápidos.' }
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`quiz-option-btn ${time === opt.id ? 'active' : ''}`}
                  onClick={() => setTime(opt.id)}
                >
                  <h3>{opt.title}</h3>
                  <p>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="quiz-step-view">
            <h2>Quais habilidades você já tem ou gostaria de usar?</h2>
            <p className="step-desc">Escolha as opções que representam o que você faz no dia a dia ou tem facilidade de aprender.</p>
            <div className="option-checkbox-grid">
              {skillOptions.map(skill => (
                <button
                  key={skill.id}
                  className={`quiz-checkbox-btn ${selectedSkills.includes(skill.id) ? 'active' : ''}`}
                  onClick={() => toggleSkill(skill.id)}
                >
                  <span className="checkbox-indicator">{selectedSkills.includes(skill.id) ? '✓' : ''}</span>
                  {skill.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="quiz-step-view">
            <h2>Em quais setores do mercado você se sentiria mais confortável trabalhando?</h2>
            <p className="step-desc">Você trabalhará melhor se o nicho for de seu agrado pessoal ou familiar.</p>
            <div className="option-checkbox-grid">
              {interestOptions.map(interest => (
                <button
                  key={interest.id}
                  className={`quiz-checkbox-btn ${selectedInterests.includes(interest.id) ? 'active' : ''}`}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <span className="checkbox-indicator">{selectedInterests.includes(interest.id) ? '✓' : ''}</span>
                  {interest.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="quiz-footer-actions">
        <button
          className="btn-next-aio"
          onClick={handleNext}
          disabled={
            (step === 1 && !objective) ||
            (step === 3 && !time) ||
            (step === 4 && selectedSkills.length === 0) ||
            (step === 5 && selectedInterests.length === 0)
          }
        >
          {step === 0 ? 'Entendi, Iniciar Mapeamento →' : step === 5 ? 'Analisar e Criar Meu Projeto →' : 'Próxima Etapa →'}
        </button>
      </footer>
    </div>
  );
};
