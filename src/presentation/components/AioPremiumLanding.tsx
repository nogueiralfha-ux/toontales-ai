import React, { useState } from 'react';
import mockupCelular from '../../assets/mockup_celular_aio.jpg';

interface AioPremiumLandingProps {
  onStartQuiz: () => void;
  onStartLinkAnalysis: () => void;
  onNavigateAdmin?: () => void;
}

export const AioPremiumLanding: React.FC<AioPremiumLandingProps> = ({ onStartQuiz, onStartLinkAnalysis, onNavigateAdmin }) => {
  // Estado para controlar Accordion de FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Estado para controlar o Slider de Depoimentos
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const professions = [
    { title: "Estudante", age: "19 anos", desc: "Aprendeu a criar chatbots e fechou contrato mensal com 3 clínicas do bairro para pagar a faculdade.", icon: "🎓" },
    { title: "Empreendedor", age: "34 anos", desc: "Usou a IA do A.I.O para lançar um micro-SaaS de agendamento e fatura mais de R$ 15 mil recorrentes.", icon: "💼" },
    { title: "Autônomo (Manicure)", age: "31 anos", desc: "Instalou o robô de WhatsApp e agora preenche a agenda da semana em minutos sem perder ligações.", icon: "💅" },
    { title: "Produtor Rural", age: "42 anos", desc: "Automatizou o contato de orçamentos de hortifrúti direto no WhatsApp e reduziu o tempo no telefone.", icon: "🚜" },
    { title: "Profissional Liberal", age: "29 anos", desc: "Criou uma página automatizada de agendamento de consultas médicas e atrai pacientes 24h.", icon: "🩺" },
    { title: "Aposentado", age: "64 anos", desc: "Aprendeu a criar pequenas automações para mercadinhos e fatura uma aposentadoria extra saudável.", icon: "👴" },
  ];

  const features = [
    { title: "Oportunidades Reais", desc: "Análise profunda que diz exatamente qual micro-negócio digital você deve iniciar baseando-se nas suas habilidades locais.", icon: "🔍" },
    { title: "Aprenda do Zero", desc: "Aulas didáticas simples e diretas ao ponto, sem códigos complicados ou terminologias difíceis de computação.", icon: "🎓" },
    { title: "Ferramentas Inteligentes", desc: "Acesso e recomendação das melhores plataformas gratuitas da internet para desenvolver o seu projeto em poucas horas.", icon: "🛠️" },
    { title: "Automações Prontas", desc: "Copy e cole fluxos funcionais de mensagens prontas para enviar aos seus primeiros clientes e fechar contratos.", icon: "⚡" },
    { title: "Agentes de IA", desc: "Inteligência artificial trabalhando ao seu lado para formatar scripts comerciais, calcular custos e orientar a escala.", icon: "🧠" },
    { title: "Modelos de Negócios", desc: "Saiba como cobrar por assinatura (recorrência mensal) e faturar previsivelmente todo início de mês com Pix automático.", icon: "💰" }
  ];

  const faqItems = [
    { q: "Preciso saber programar para começar?", a: "Absolutamente não. A plataforma A.I.O. é baseada no conceito No-code (Sem Código), onde você constrói ferramentas visuais arrastando blocos e conectando serviços prontos." },
    { q: "Quanto tempo preciso dedicar por dia?", a: "Você pode progredir no seu próprio ritmo. Recomendamos dedicar entre 30 minutos a 1 hora por dia para ver os primeiros resultados de renda extra em até 3 semanas." },
    { q: "Como vou receber os pagamentos dos clientes?", a: "Ensinamos você a usar ferramentas de cobrança digital gratuitas como Asaas ou Mercado Pago. Seus clientes pagam por Pix ou Cartão e você recebe recorrentemente." },
    { q: "Funciona mesmo para quem não tem experiência?", a: "Sim! O A.I.O foi desenhado para leigos. Nossas aulas traduzem termos difíceis em analogias simples do dia a dia." }
  ];

  const testimonials = [
    { name: "Mariana Costa", role: "Estudante", text: "Eu não entendia nada de tecnologia. O A.I.O me mostrou como criar um robô de WhatsApp para a clínica de estética da minha tia. Hoje eu ganho R$ 1.500 extras por mês cuidando dessa única automação!", rating: 5 },
    { name: "Carlos Eduardo", role: "Aposentado", text: "Com a ajuda da biblioteca simples do A.I.O., aprendi a configurar planilhas inteligentes para comércios do bairro. Uma excelente renda complementar para a minha aposentadoria.", rating: 5 },
    { name: "Beatriz M. Silva", role: "Manicure", text: "Antes eu perdia clientes porque estava atendendo e não podia responder no WhatsApp. O robô que o A.I.O me ensinou a configurar faz os agendamentos sozinho enquanto trabalho!", rating: 5 }
  ];

  return (
    <div style={{ backgroundColor: '#08142D', color: '#FFFFFF', fontFamily: "'Inter', sans-serif", minHeight: '100vh', scrollBehavior: 'smooth' }}>
      
      {/* MENU / NAVBAR PREMIUM */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(8, 20, 45, 0.8)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #6A3DF0, #00C8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(106, 61, 240, 0.4)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" style={{ color: 'white' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1px' }}>A.I.O</span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#00C8FF', fontWeight: 800 }}>BUSINESS ENGINE</span>
          </div>
        </div>

        {/* Links de Navegação */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }} className="desktop-only">
          <a href="#inicio" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Início</a>
          <a href="#como-funciona" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Como Funciona</a>
          <a href="#oportunidades" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Oportunidades</a>
          <a href="#ferramentas" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Ferramentas</a>
          <a href="#depoimentos" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Depoimentos</a>
          <a href="#faq" style={{ color: '#A0AEC0', textDecoration: 'none' }}>FAQ</a>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary-aio" onClick={onStartLinkAnalysis} style={{ fontSize: '0.8rem', padding: '0.6rem 1rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
            Analisar por Link 🔗
          </button>
          <button className="btn-primary-aio" onClick={onStartQuiz} style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
            COMEÇAR AGORA
          </button>
        </div>
      </nav>

      {/* SEÇÃO HERO */}
      <section id="inicio" style={{ padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb orb-primary" style={{ top: '-10%', left: '30%', opacity: 0.15 }} />
        
        {/* Banner de Imagens de Pessoas Reais e Felizes */}
        <div style={{ maxWidth: '340px', margin: '0 auto 3rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', border: '1px solid rgba(106, 61, 240, 0.2)' }}>
          <img 
            src={mockupCelular} 
            alt="Mockup do smartphone do A.I.O" 
            style={{ width: '100%', display: 'block', height: 'auto' }}
          />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(106, 61, 240, 0.1)', border: '1px solid rgba(106, 61, 240, 0.3)', borderRadius: '30px', padding: '0.5rem 1.25rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00C8FF', textTransform: 'uppercase', letterSpacing: '1px' }}>Nova Era da Renda Digital</span>
        </div>

        <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
          Como fazer renda extra <br />
          <span style={{ background: 'linear-gradient(90deg, #00C8FF, #6A3DF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>com a Internet?</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#CBD5E0', maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Descubra oportunidades reais utilizando Inteligência Artificial, automação e ferramentas digitais para transformar conhecimento e tempo livre em renda recorrente.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button className="btn-primary-aio" onClick={onStartQuiz} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            QUERO COMEÇAR AGORA 🚀
          </button>
          <button 
            className="btn-secondary-aio" 
            onClick={() => {
              const el = document.getElementById('como-funciona');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            style={{ padding: '1rem 2rem', fontSize: '1rem' }}
          >
            VER COMO FUNCIONA 🔗
          </button>
        </div>

        {/* Bullet points de confiança */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', color: '#A0AEC0', fontSize: '0.9rem', fontWeight: 700 }}>
          <span>✓ Para iniciantes</span>
          <span>✓ Sem experiência</span>
          <span>✓ No seu ritmo</span>
          <span>✓ 100% online</span>
          <span>✓ Comunidade exclusiva</span>
        </div>
      </section>

      {/* SEÇÃO 2: CHAMADA E GRIDS DE PROFISSÕES */}
      <section id="oportunidades" style={{ padding: '6rem 2rem', backgroundColor: '#0B1B3D', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>A Internet abriu portas.</h2>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFD54A', marginBottom: '1.5rem' }}>VOCÊ VAI ENTRAR?</h3>
          <p style={{ fontSize: '1.1rem', color: '#A0AEC0', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
            Independentemente da sua idade, profissão ou experiência, existe uma oportunidade esperando por você. Mapeamos o seu caminho.
          </p>
        </div>

        {/* Grid de Cards de Profissões */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Card Destaque: Engenharia Reversa por Link */}
          <div 
            className="dashboard-card shadow-premium" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(106, 61, 240, 0.15) 0%, rgba(8, 20, 45, 0.4) 100%)', 
              border: '1px solid rgba(106, 61, 240, 0.3)', 
              padding: '1.75rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', color: '#00C8FF' }}>Pesquisa por Link (Engenharia Reversa)</h4>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E0', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Já viu uma página, produto físico ou serviço e pensou: "Quero criar algo semelhante"? Cole a URL e nós te damos o passo a passo.
              </p>
            </div>
            <button className="btn-action-trigger" onClick={onStartLinkAnalysis} style={{ width: '100%' }}>
              Analisar Concorrente ⚡
            </button>
          </div>

          {professions.map((prof, idx) => (
            <div 
              key={idx} 
              className="dashboard-card shadow-premium" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                transition: 'all 0.3s ease',
                padding: '1.75rem',
                borderRadius: '16px'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{prof.icon}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{prof.title}</h4>
                <span style={{ fontSize: '0.8rem', color: '#00C8FF', fontWeight: 700 }}>{prof.age}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#A0AEC0', lineHeight: 1.5, margin: 0 }}>{prof.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: O QUE ENCONTRA NO A.I.O */}
      <section id="ferramentas" style={{ padding: '6rem 2rem', position: 'relative' }}>
        <div className="glow-orb orb-secondary" style={{ bottom: '10%', right: '10%', opacity: 0.1 }} />
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ color: '#6A3DF0', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Recursos e Tecnologia</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem' }}>O que você encontra no A.I.O</h2>
        </div>

        {/* Grid de Cards Grandes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="dashboard-card shadow-premium" 
              style={{ 
                background: 'linear-gradient(180deg, rgba(8, 20, 45, 0.4) 0%, rgba(106, 61, 240, 0.02) 100%)', 
                border: '1px solid rgba(106, 61, 240, 0.15)',
                padding: '2.25rem',
                borderRadius: '20px'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feat.icon}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>{feat.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#CBD5E0', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 4: TIMELINE (COMO FUNCIONA) */}
      <section id="como-funciona" style={{ padding: '6rem 2rem', backgroundColor: '#0B1B3D' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ color: '#00C8FF', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Caminho de Validação</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem' }}>Como Funciona</h2>
        </div>

        {/* Timeline Visual */}
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {[
            { step: "Passo 1", title: "Escolha uma oportunidade.", desc: "Use o quiz interativo para descobrir o melhor projeto de renda extra com base no seu orçamento." },
            { step: "Passo 2", title: "Aprenda no seu ritmo.", desc: "Estude o material didático ilustrado e assista aos tutoriais de configuração de ferramentas gratuitas." },
            { step: "Passo 3", title: "Coloque em prática.", desc: "Copie os scripts de abordagem comercial prontos e monte seu primeiro robô demonstrativo." },
            { step: "Passo 4", title: "Gere renda recorrente.", desc: "Apresente o robô funcionando para comerciantes locais e feche assinaturas mensais." },
            { step: "Passo 5", title: "Escale o negócio.", desc: "Expanda para mais clientes e contrate micro-agentes para gerenciar a rotina operacional." }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6A3DF0, #00C8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 0 15px rgba(0, 200, 255, 0.3)' }}>
                  {idx + 1}
                </div>
                {idx < 4 && <div style={{ width: '2px', flex: 1, background: 'linear-gradient(180deg, #6A3DF0, transparent)', marginTop: '0.5rem' }} />}
              </div>
              <div style={{ paddingBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#00C8FF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.step}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.25rem 0 0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#CBD5E0', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 5: VÍDEO DE APRESENTAÇÃO / MOCKUP */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ color: '#FFD54A', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Assista ao Vídeo</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '3rem' }}>Acelere seus Resultados</h2>
          
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', background: '#0F1E42', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(8, 20, 45, 0.4) 0%, rgba(106, 61, 240, 0.2) 100%)', zIndex: 1 }} />
            
            <button 
              onClick={onStartQuiz}
              style={{ 
                zIndex: 2, 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: '#FFD54A', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(255, 213, 74, 0.4)',
                transform: 'scale(1)',
                transition: 'transform 0.2s',
                marginBottom: '1.5rem'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" style={{ color: '#08142D', marginLeft: '4px' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <h3 style={{ zIndex: 2, fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Apresentação Geral da Plataforma</h3>
            <p style={{ zIndex: 2, color: '#A0AEC0', fontSize: '0.95rem', maxWidth: '460px', margin: 0 }}>Clique no play para conhecer o A.I.O. por dentro e iniciar o mapeamento.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: NÚMEROS / CONTADORES */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#0B1B3D', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#00C8FF', margin: 0 }}>+150</h3>
            <p style={{ color: '#CBD5E0', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 700 }}>Guias de Execução</p>
          </div>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#6A3DF0', margin: 0 }}>+300</h3>
            <p style={{ color: '#CBD5E0', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 700 }}>Ideias de Negócios</p>
          </div>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#FFD54A', margin: 0 }}>+80</h3>
            <p style={{ color: '#CBD5E0', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 700 }}>Ferramentas de IA</p>
          </div>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 900, color: '#00C8FF', margin: 0 }}>+50</h3>
            <p style={{ color: '#CBD5E0', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 700 }}>Automações Prontas</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: DEPOIMENTOS SLIDER */}
      <section id="depoimentos" style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ color: '#6A3DF0', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Casos de Sucesso</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '3.5rem' }}>Depoimentos de Parceiros</h2>
          
          <div className="dashboard-card shadow-premium" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem 2rem', borderRadius: '24px', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic', color: '#CBD5E0', marginBottom: '2rem' }}>
              "{testimonials[currentTestimonial].text}"
            </p>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{testimonials[currentTestimonial].name}</h4>
              <span style={{ fontSize: '0.85rem', color: '#00C8FF', fontWeight: 700 }}>{testimonials[currentTestimonial].role}</span>
              <div style={{ color: '#FFD54A', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {"★".repeat(testimonials[currentTestimonial].rating)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {testimonials.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  border: 'none', 
                  background: currentTestimonial === idx ? '#00C8FF' : 'rgba(255,255,255,0.1)', 
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: PERGUNTAS FREQUENTES ACCORDION */}
      <section id="faq" style={{ padding: '6rem 2rem', backgroundColor: '#0B1B3D' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#00C8FF', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Restou Alguma Dúvida?</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem' }}>Perguntas Frequentes</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  borderRadius: '12px', 
                  overflow: 'hidden' 
                }}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  style={{ 
                    width: '100%', 
                    padding: '1.25rem 1.5rem', 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    textAlign: 'left', 
                    fontWeight: 800, 
                    fontSize: '1.05rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{ color: '#00C8FF', fontSize: '1.2rem' }}>{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 1.5rem 1.25rem', color: '#CBD5E0', fontSize: '0.95rem', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '1rem' }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8.5: PLANOS & INVESTIMENTO */}
      <section id="planos" style={{ padding: '6rem 2rem', backgroundColor: '#08142D', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ color: '#FFD54A', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Planos & Investimento</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1rem' }}>Escolha o Ideal para Você</h2>
          <p style={{ color: '#CBD5E0', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
            Acesso ilimitado à plataforma para encontrar oportunidades ou o setup completo feito pela nossa equipe.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Plano Mensal */}
          <div className="dashboard-card shadow-premium" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#A0AEC0', marginBottom: '1rem' }}>PLANO MENSAL</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>R$ 19,90<span style={{ fontSize: '1rem', color: '#A0AEC0' }}>/mês</span></div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E0', marginBottom: '2rem' }}>Ideal para quem quer fazer testes rápidos e encontrar sua primeira ideia de negócio.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', textAlign: 'left', color: '#CBD5E0' }}>
                <li>✓ Buscas e análises de links ilimitadas</li>
                <li>✓ Acesso completo à Universidade A.I.O.</li>
                <li>✓ Leitura do e-book oficial de 6 páginas</li>
                <li>✓ Suporte via e-mail</li>
              </ul>
            </div>
            <a href="https://www.asaas.com/c/tfg3h1wqsmwhr85x" target="_blank" rel="noopener noreferrer" className="btn-secondary-aio" style={{ textDecoration: 'none', width: '100%', display: 'block', padding: '0.85rem' }}>Assinar Mensal 💳</a>
          </div>

          {/* Plano Anual - Destaque */}
          <div className="dashboard-card shadow-premium" style={{ background: 'linear-gradient(135deg, rgba(106, 61, 240, 0.2) 0%, rgba(0, 200, 255, 0.05) 100%)', border: '2px solid #6A3DF0', padding: '2.5rem 2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center', position: 'relative', transform: 'scale(1.03)' }}>
            <span style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#FFD54A', color: '#08142D', padding: '0.25rem 1rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.5px' }}>MAIS POPULAR - 50% OFF</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00C8FF', marginBottom: '1rem', marginTop: '0.5rem' }}>PLANO ANUAL</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>R$ 99,00<span style={{ fontSize: '1rem', color: '#A0AEC0' }}>/ano</span></div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E0', marginBottom: '2rem' }}>O melhor custo-benefício. Garanta acesso anual pelo preço de poucos meses.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', textAlign: 'left', color: '#CBD5E0' }}>
                <li>✓ Tudo do plano mensal</li>
                <li>✓ Economia equivalente a R$ 8,25/mês</li>
                <li>✓ Acesso prioritário a novas ferramentas de IA</li>
                <li>✓ Selo de Membro Fundador</li>
              </ul>
            </div>
            <a href="https://www.asaas.com/c/l3ycqomp82wl989y" target="_blank" rel="noopener noreferrer" className="btn-primary-aio" style={{ textDecoration: 'none', width: '100%', display: 'block', padding: '0.85rem' }}>Assinar Anual 💎</a>
          </div>

          {/* Plano Setup Completo */}
          <div className="dashboard-card shadow-premium" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFD54A', marginBottom: '1rem' }}>A.I.O. SETUP LOCAL</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>R$ 299,00<span style={{ fontSize: '1rem', color: '#A0AEC0' }}> Setup</span></div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E0', marginBottom: '2rem' }}>Nós fazemos por você. Configuramos toda a automação e robô de WhatsApp do seu negócio.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', textAlign: 'left', color: '#CBD5E0' }}>
                <li>✓ Criação das contas (Tally/Make)</li>
                <li>✓ Integração completa de Webhooks</li>
                <li>✓ Fluxo de mensagens pré-configurado</li>
                <li>✓ Suporte VIP de 30 dias via WhatsApp</li>
                <li><strong style={{ color: '#00C8FF' }}>+ R$ 49,90/mês</strong> de manutenção</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="https://www.asaas.com/c/ymew1qnox9hjx0xq" target="_blank" rel="noopener noreferrer" className="btn-primary-aio" style={{ textDecoration: 'none', width: '100%', display: 'block', padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>Contratar Setup (R$ 299) 💳</a>
              <a href="https://www.asaas.com/c/pv6sfo71g580gwld" target="_blank" rel="noopener noreferrer" className="btn-secondary-aio" style={{ textDecoration: 'none', width: '100%', display: 'block', padding: '0.75rem 0.5rem', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.1)' }}>Contratar Mensalidade (R$ 49,90) 🔄</a>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9: CTA FINAL */}
      <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative' }}>
        <div className="glow-orb orb-primary" style={{ bottom: '-20%', left: '40%', opacity: 0.1 }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(106, 61, 240, 0.25) 0%, rgba(0, 200, 255, 0.05) 100%)', border: '1px solid rgba(106, 61, 240, 0.4)', padding: '4rem 2rem', borderRadius: '32px', boxShadow: '0 20px 55px rgba(106, 61, 240, 0.15)' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>Sua próxima fonte de renda <br />pode começar hoje.</h2>
          <p style={{ color: '#CBD5E0', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.5 }}>
            Faça a sua consulta agora mesmo e descubra ideias sob medida para a sua rotina livre.
          </p>
          <button className="btn-primary-aio" onClick={onStartQuiz} style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>
            COMEÇAR AGORA 🚀
          </button>
        </div>
      </section>

      {/* RODAPÉ / FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 2rem 2rem', backgroundColor: '#050D1E', color: '#A0AEC0', fontSize: '0.9rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '1rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#6A3DF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>A.I.O</span>
            </div>
            <p style={{ lineHeight: 1.5, fontSize: '0.85rem' }}>Agente Inteligente de Oportunidades. Democratizando o acesso à renda digital com tecnologia simples.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Links Rápidos</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#inicio" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Início</a></li>
              <li><a href="#como-funciona" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Como Funciona</a></li>
              <li><a href="#oportunidades" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Oportunidades</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Políticas</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#privacidade" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Privacidade</a></li>
              <li><a href="#termos" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Termos de Uso</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Newsletter</h4>
            <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Cadastre seu e-mail para receber ideias de micro-SaaS em primeira mão.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Seu e-mail..." style={{ background: '#08142D', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', flex: 1 }} />
              <button className="btn-primary-aio" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Enviar</button>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '2rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <p>© 2026 A.I.O. Todos os direitos reservados. Software Factory.</p>
          <button 
            onClick={() => {
              if (onNavigateAdmin) onNavigateAdmin();
            }} 
            style={{ color: '#00C8FF', background: 'none', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            Área Administrativa 🔒
          </button>
        </div>
      </footer>

    </div>
  );
};
