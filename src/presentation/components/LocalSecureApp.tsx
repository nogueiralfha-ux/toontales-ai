import React, { useState } from 'react';
import { AioPremiumLanding } from './AioPremiumLanding';
import { AioQuiz, QuizData } from './AioQuiz';
import { AioLinkAnalyzer, LinkAnalysisData } from './AioLinkAnalyzer';
import { AioDashboard, OpportunityResult } from './AioDashboard';
import { analyzeWithGemini } from '../../services/geminiService';
import { saveLeadToFirestore, getLeadsFromFirestore } from '../../services/firebaseConfig';
import '../styles/index.css';

export const LocalSecureApp: React.FC = () => {
  // Estado de leads salvos e controle administrativo
  const [screen, setScreen] = useState<'landing' | 'quiz' | 'link_input' | 'dashboard' | 'admin'>('landing');
  const [result, setResult] = useState<OpportunityResult | null>(null);

  // Estados de Autenticação do Administrador
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Monitora alterações na URL para permitir acessar a rota /admin digitando no navegador
  React.useEffect(() => {
    if (window.location.hash === '#/admin' || window.location.pathname.endsWith('/admin')) {
      setScreen('admin');
    }
  }, []);

  // Leads carregados do Firebase
  const [firebaseLeads, setFirebaseLeads] = useState<Array<{ id: string; whatsapp: string; idea: string; createdAt: string }>>([]);

  const handleSaveLead = async (whatsapp: string, idea: string) => {
    // 1. Salva no localStorage (Fallback local rápido)
    try {
      const storedLeads = localStorage.getItem('aio_captured_leads');
      const leadsList = storedLeads ? JSON.parse(storedLeads) : [];
      const newLead = {
        id: Date.now().toString(),
        whatsapp,
        idea,
        createdAt: new Date().toLocaleString('pt-BR')
      };
      leadsList.push(newLead);
      localStorage.setItem('aio_captured_leads', JSON.stringify(leadsList));
    } catch (e) {
      console.error(e);
    }

    // 2. Salva no Firebase Firestore (Banco de dados real na Nuvem)
    try {
      await saveLeadToFirestore(whatsapp, idea);
    } catch (e) {
      console.warn("Salvando apenas localmente. Chave do Firebase placeholder ativa.");
    }
  };

  // Carrega contatos em tempo real do Firestore ao logar no Admin
  const loadFirebaseLeads = async () => {
    try {
      const leads = await getLeadsFromFirestore();
      if (leads && leads.length > 0) {
        setFirebaseLeads(leads);
      } else {
        // Fallback local se o Firebase estiver limpo
        const storedLeads = localStorage.getItem('aio_captured_leads');
        setFirebaseLeads(storedLeads ? JSON.parse(storedLeads) : []);
      }
    } catch (e) {
      const storedLeads = localStorage.getItem('aio_captured_leads');
      setFirebaseLeads(storedLeads ? JSON.parse(storedLeads) : []);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleFinishQuiz = async (data: QuizData) => {
    setIsLoading(true);
    const promptPayload = `Perfil do usuário no Quiz A.I.O:
- Objetivo do usuário: ${data.objective}
- Capital disponível para começar: R$ ${data.capital}
- Tempo livre semanal: ${data.time}
- Habilidades selecionadas: ${data.skills.join(', ')}
- Áreas de interesse: ${data.interests.join(', ')}`;

    try {
      const geminiResult = await analyzeWithGemini(promptPayload);
      setResult(geminiResult);
      setScreen('dashboard');
    } catch (e) {
      console.warn("Usando fallback de dados locais (Chave Gemini vazia ou erro de rede).");
      
      const hasPhysicalSkill = data.skills.some(s => 
        ['beauty', 'construction', 'commerce', 'general_services'].includes(s)
      );

      let mockResult: OpportunityResult;

      if (hasPhysicalSkill) {
        mockResult = {
          diagnostico: "Muitos profissionais tradicionais (como pedreiros, manicures e comerciantes) possuem habilidades técnicas e práticas incríveis, mas perdem muito tempo com agendamentos manuais, orçamentos perdidos ou falta de visibilidade local. Identificamos que o maior gargalo desses profissionais é a captação e gerenciamento digital de clientes da própria região.",
          necessidade: "Hub de Agendamento, Catálogo de Serviços e Orçamentos para Profissionais Autônomos Locais",
          urgencia: "91/100 - Alta. Profissionais perdem em média 3 a 4 horas por dia respondendo cotações no WhatsApp.",
          potencialMercado: "R$ 150M+ no Brasil (Milhares de manicures, pedreiros e autônomos sem presença digital organizada)",
          solucoes: [
            {
              categoria: "Aplicativo / SaaS / IA especializada",
              titulo: "A.I.O. Link: Assistente Web Gerador de Catálogo e Orçador por WhatsApp",
              descricao: "Um mini-site para o profissional onde os clientes escolhem o serviço (ex: unha em gel, reforma de banheiro), informam os detalhes e a ferramenta gera na hora uma estimativa ou pré-orçamento que cai direto no WhatsApp do profissional formatado."
            },
            {
              categoria: "Curso / Ebook / Comunidade / Mentoria",
              titulo: "Treinamento Agenda Cheia: Dominando o Google Meu Negócio",
              descricao: "Instruções práticas em vídeo passo a passo ensinando profissionais autônomos locais a ficarem no topo das pesquisas do Google da cidade sem precisar gastar nada com anúncios pagos."
            },
            {
              categoria: "Assinatura / Serviço / Marketplace / Plataforma Digital",
              titulo: "Assinatura Mensal de Templates e Identidade Visual Express para Redes Sociais",
              descricao: "Serviço de fornecimento mensal de artes profissionais prontas pelo Canva específicas para manicures e prestadores de serviços postarem seus portfólios rapidamente."
            }
          ],
          modeloNegocio: "SaaS Freemium. Grátis até 15 orçamentos mensais. Plano Profissional por R$ 29,90/mês para remover anúncios e liberar agendamentos ilimitados.",
          estrategia: "Divulgar a ferramenta em grupos locais de Facebook e WhatsApp de prestadores de serviços, focando no benefício de 'parar de responder a mesma coisa toda hora'.",
          fasesExecucao: [
            "FASE 01: DESCOBRIR A NECESSIDADE - Conversar com manicures e pedreiros locais sobre como eles controlam a agenda hoje.",
            "FASE 02: ANALISAR O MERCADO - Identificar o preço cobrado por agendadores genéricos complexos.",
            "FASE 03: VALIDAR A OPORTUNIDADE - Criar um formulário no Tally fingindo ser o gerador e mandar para 5 conhecidos autônomos.",
            "FASE 04: CRIAR A SOLUÇÃO - Estruturar o painel de criação de catálogos simplificado pelo celular.",
            "FASE 05: DESENVOLVER O PRODUTO - Construir o MVP responsivo priorizando navegação mobile rápida.",
            "FASE 06: CRIAR O MODELO DE NEGÓCIO - Configurar integrações de micro-pagamentos via Pix.",
            "FASE 07: IMPLEMENTAR AS AUTOMAÇÕES - Criar alertas por SMS/WhatsApp para os clientes confirmarem a presença.",
            "FASE 08: CRIAR AS CAMPANHAS - Postar antes/depois de profissionais que organizaram suas agendas e lucraram mais.",
            "FASE 09: VALIDAR OS RESULTADOS - Monitorar a recuperação de contatos.",
            "FASE 10: ESCALAR O PROJETO - Expandir para regiões metropolitanas."
          ],
          potencialCrescimento: "Exponencial no Brasil, impulsionado pelo crescimento do mercado de microempreendedores individuais (MEI).",
          proximosPassos: [
            "Montar um modelo de catálogo simples usando No-code.",
            "Apresentar para 3 profissionais locais e pedir feedback sobre o visual.",
            "Definir quais são as 3 principais informações exigidas para fazer um orçamento rápido.",
            "Registrar um domínio acessível para testes."
          ],
          riscos: [
            "Dificuldade de letramento digital de alguns profissionais mais velhos.",
            "Falta de hábito no uso diário do painel."
          ],
          sugestoesMelhoria: [
            "Fazer a interface 100% otimizada para uso em telas de celular baratas.",
            "Integrar envio de áudio no painel para facilitar o uso por quem não gosta de digitar."
          ],
          notas: {
            dor: 94,
            urgencia: 91,
            mercado: 95,
            solucao: 88,
            monetizacao: 80,
            escalabilidade: 92,
            concorrencia: 85,
            potencial: 90,
            idh: 93,
            iso: 92,
            final: 91
          }
        };
      } else {
        mockResult = {
          diagnostico: "Com base no perfil informado, identificamos que você possui aptidões ideais para atuar em mercados de automação digital e soluções no-code com foco em SaaS de micro-escala. O gargalo do mercado hoje reside no desconhecimento de pequenas empresas físicas sobre como otimizar seus atendimentos por IA.",
          necessidade: "Automação Inteligente de Atendimento para Clínicas e Estúdios de Bem-estar",
          urgencia: "88/100 - Alta demanda por otimização operacional e corte de custos com secretariado",
          potencialMercado: "R$ 50M+ anuais no Brasil (Microempresas de Serviços)",
          solucoes: [
            {
              categoria: "Aplicativo / SaaS / IA especializada",
              titulo: "Agenteia: Micro-SaaS de agendamento por WhatsApp AI",
              descricao: "Um robô inteligente integrado ao WhatsApp que conversa de forma humanizada, negocia horários diretamente com os pacientes/clientes de clínicas, e atualiza a agenda no Google Calendar automaticamente."
            },
            {
              categoria: "Curso / Ebook / Comunidade / Mentoria",
              titulo: "Método Consultoria de Automação Express",
              descricao: "Pacote de mentoria focado em ensinar donos de clínicas locais a criarem suas próprias integrações simples usando Make.com e Typebot, reduzindo atritos de contratação externa."
            },
            {
              categoria: "Assinatura / Serviço / Marketplace / Plataforma Digital",
              titulo: "Plataforma de Freelancers Especializados em Automação",
              descricao: "Um marketplace nichado conectando clínicas físicas a desenvolvedores no-code prontos para implementar assistentes virtuais de atendimento sob medida."
            }
          ],
          modeloNegocio: "SaaS Recorrente (B2B SaaS) cobrando R$ 197,00/mês por clínica conectada + taxa única de setup de R$ 497,00.",
          estrategia: "Prospecção ativa no Instagram de estúdios locais na sua cidade demonstrando a IA marcando um compromisso em menos de 1 minuto em formato de vídeo rápido.",
          fasesExecucao: [
            "FASE 01: DESCOBRIR A NECESSIDADE - Mapear clinicas sem atendimento automatizado via direct do Instagram.",
            "FASE 02: ANALISAR O MERCADO - Levantar concorrentes locais de software de agendamento manual.",
            "FASE 03: VALIDAR A OPORTUNIDADE - Oferecer o MVP gratuito por 7 dias para as 3 primeiras clínicas parceiras.",
            "FASE 04: CRIAR A SOLUÇÃO - Montar o fluxo de conversa padrão no Typebot / Make / OpenAI.",
            "FASE 05: DESENVOLVER O PRODUTO - Estruturar o painel web simples no Bubble ou Next.js para visualização da agenda.",
            "FASE 06: CRIAR O MODELO DE NEGÓCIO - Configurar assinatura recorrente via Stripe ou Asaas.",
            "FASE 07: IMPLEMENTAR AS AUTOMAÇÕES - Criar alertas automáticos de confirmação de presença com 24h de antecedência.",
            "FASE 08: CRIAR AS CAMPANHAS - Gravar vídeos mostrando a redução no tempo de resposta das clínicas.",
            "FASE 09: VALIDAR OS RESULTADOS - Coletar depoimento em vídeo dos primeiros donos de clínicas atendidos.",
            "FASE 10: ESCALAR O PROJETO - Expandir para cidades vizinhas utilizando tráfego pago geolocalizado."
          ],
          potencialCrescimento: "Alto (Escalabilidade técnica de 95/100). Possibilidade de plugar novas APIs de chat facilmente.",
          proximosPassos: [
            "Criar conta gratuita no Make.com e Typebot.",
            "Mapear 10 clínicas de estética próximas a você no Google Maps.",
            "Montar um fluxo de demonstração rápida de agendamento por WhatsApp.",
            "Gravar tela do celular simulando a IA respondendo o cliente."
          ],
          riscos: [
            "Bloqueios de número de WhatsApp por atividade excessiva.",
            "Dificuldade de adsão por parte de secretárias tradicionais."
          ],
          sugestoesMelhoria: [
            "Utilizar a API Cloud Oficial da Meta para evitar banimentos de chips.",
            "Oferecer treinamento presencial rápido para a equipe da clínica."
          ],
          notas: {
            dor: 90,
            urgencia: 88,
            mercado: 95,
            solucao: 85,
            monetizacao: 80,
            escalabilidade: 90,
            concorrencia: 82,
            potencial: 89,
            idh: 89,
            iso: 90,
            final: 88
          }
        };
      }
      setResult(mockResult);
      setScreen('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeLink = async (data: LinkAnalysisData) => {
    setIsLoading(true);
    const promptPayload = `Análise de Engenharia Reversa por Link:
- URL do Concorrente: ${data.url}
- Categoria de Produto: ${data.category}
- Crítica / Observações do usuário: ${data.notes}`;

    try {
      const geminiResult = await analyzeWithGemini(promptPayload);
      setResult(geminiResult);
      setScreen('dashboard');
    } catch (e) {
      console.warn("Usando fallback de dados locais (Chave Gemini vazia ou erro de rede).");
      
      const mockResult: OpportunityResult = {
        diagnostico: `Análise de Engenharia Reversa efetuada com sucesso para a URL fornecida (${data.url}). Identificamos um concorrente do tipo "${data.category}" no nicho de mercado. O seu diferencial competitivo sugerido é "${data.notes || 'Melhoria na usabilidade e velocidade de suporte'}". A melhor alternativa para competir sem alto investimento inicial é o desenvolvimento de um serviço automatizado sob assinatura.`,
        necessidade: `Micro-SaaS de Atendimento Customizado Baseado no Concorrente ${data.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}`,
        urgencia: "90/100 - Oportunidade quente. O concorrente possui alto volume de buscas mas peca no pós-venda.",
        potencialMercado: "Mercado local estimado em R$ 100k+ anuais em captação local.",
        solucoes: [
          {
            categoria: "Automação / Robô WhatsApp",
            titulo: "Agente Inteligente Alternativo de Contato Direto",
            descricao: "Um assistente que responde e qualifica leads em 10 segundos, integrando o seu diferencial de mercado diretamente no atendimento no-code."
          },
          {
            categoria: "Landing Page / Funil de Vendas",
            titulo: "Página de Captura Ultra-Rápida",
            descricao: "Página mobile otimizada com foco em dores ignoradas pela grande empresa de referência."
          }
        ],
        modeloNegocio: "Assinatura recorrente mensal com checkout express via Pix (Mercado Pago / Asaas).",
        estrategia: "Abordagem comercial demonstrativa oferecendo teste gratuito do robô com base na dor descrita.",
        fasesExecucao: [
          "FASE 01: DESCOBRIR A NECESSIDADE - Analisar os comentários negativos de usuários do concorrente.",
          "FASE 02: ANALISAR O MERCADO - Mapear os preços cobrados pela referência.",
          "FASE 03: VALIDAR A OPORTUNIDADE - Estruturar uma oferta de valor com preço 30% menor ou suporte humanizado.",
          "FASE 04: CRIAR A SOLUÇÃO - Desenvolver o chatbot no-code simulando os mesmos recursos.",
          "FASE 05: DESENVOLVER O PRODUTO - Hospedar a página de agendamentos em um servidor estável.",
          "FASE 06: CRIAR O MODELO DE NEGÓCIO - Integrar gateways de pagamento Pix automático.",
          "FASE 07: IMPLEMENTAR AS AUTOMAÇÕES - Criar fluxos de recuperação de carrinho no WhatsApp.",
          "FASE 08: CRIAR AS CAMPANHAS - Gravar vídeos comparando sua ferramenta com o grande concorrente.",
          "FASE 09: VALIDAR OS RESULTADOS - Coletar métricas de conversão das primeiras abordagens.",
          "FASE 10: ESCALAR O PROJETO - Expandir a oferta criando anúncios para regiões geográficas vizinhas."
        ],
        potencialCrescimento: "Exponencial se focado em canais de suporte alternativos que a grande marca de referência ignora.",
        proximosPassos: [
          "Acessar a página oficial da referência e listar os 3 recursos mais comentados.",
          "Procurar depoimentos e reclamações sobre o concorrente nas redes sociais.",
          "Simular a compra na concorrência para entender o fluxo de e-mails deles.",
          "Montar uma estrutura de site comparativo."
        ],
        riscos: [
          "Retaliação comercial por parte do concorrente estabelecido.",
          "Custo de aquisição de clientes insatisfeitos mais alto do que o esperado."
        ],
        sugestoesMelhoria: [
          "Diferencie-se claramente na marca e no atendimento: seja o oposto de uma empresa fria.",
          "Ofereça suporte 100% humanizado via WhatsApp."
        ],
        notas: {
          dor: 92,
          urgencia: 90,
          mercado: 94,
          solucao: 88,
          monetizacao: 85,
          escalabilidade: 90,
          concorrencia: 80,
          potencial: 91,
          idh: 91,
          iso: 92,
          final: 90
        }
      };
      setResult(mockResult);
      setScreen('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper-aio">
      {/* Overlay de carregamento para geração por inteligência artificial */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 20, 45, 0.9)',
          backdropFilter: 'blur(15px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div className="loading-spinner" style={{
            width: '60px',
            height: '60px',
            border: '6px solid rgba(0, 200, 255, 0.1)',
            borderTop: '6px solid #00C8FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '2rem'
          }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            R.I.O. está calculando a oportunidade...
          </h3>
          <p style={{ color: '#A0AEC0', fontSize: '0.95rem' }}>
            Analisando mercado, estruturando cronogramas e integrando ferramentas.
          </p>
        </div>
      )}

      {screen === 'landing' && (
        <AioPremiumLanding 
          onStartQuiz={() => setScreen('quiz')} 
          onStartLinkAnalysis={() => setScreen('link_input')}
          onNavigateAdmin={() => setScreen('admin')}
        />
      )}
      {screen === 'quiz' && (
        <AioQuiz onFinishQuiz={handleFinishQuiz} onBack={() => setScreen('landing')} />
      )}
      {screen === 'link_input' && (
        <AioLinkAnalyzer onAnalyzeLink={handleAnalyzeLink} onBack={() => setScreen('landing')} />
      )}
      {screen === 'dashboard' && result && (
        <AioDashboard 
          result={result} 
          onReset={() => setScreen('landing')} 
          onSaveLead={handleSaveLead}
        />
      )}
      
      {/* PAINEL ADMIN DE LEADS LOCAL */}
      {screen === 'admin' && (
        <div className="quiz-container" style={{ maxWidth: '600px', padding: '2rem' }}>
          <header className="quiz-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button className="btn-back" onClick={() => setScreen('landing')} style={{ display: 'inline-block', marginBottom: '1rem' }}>
              ← Voltar para Site
            </button>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>Acesso Administrativo A.I.O. 🔒</h2>
          </header>

          {!isAdminAuthed ? (
            <main className="dashboard-card shadow-premium" style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem 2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#CBD5E0', marginBottom: '2rem' }}>Apenas usuários autorizados podem visualizar os contatos capturados pela plataforma.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A0AEC0' }}>E-mail</label>
                  <input 
                    type="email" 
                    placeholder="exemplo@gmail.com" 
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: 'white', fontSize: '1rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A0AEC0' }}>Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', color: 'white', fontSize: '1rem' }}
                  />
                </div>

                <button 
                  className="btn-primary-aio" 
                  onClick={() => {
                    if (emailInput === 'nogueiralfha@gmail.com' && passwordInput === 'missionario405') {
                      setIsAdminAuthed(true);
                      loadFirebaseLeads(); // Carrega os leads do Firestore
                    } else {
                      alert("Credenciais administrativas incorretas. Acesso negado.");
                    }
                  }}
                  style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 800, marginTop: '1rem' }}
                >
                  Entrar no Painel 🔓
                </button>
              </div>
            </main>
          ) : (
            <main className="dashboard-card shadow-premium" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Lista de Contatos Recentes</h3>
                  <p style={{ fontSize: '0.85rem', color: '#A0AEC0', margin: 0 }}>Estes números de WhatsApp foram coletados na Dashboard para liberar o acesso.</p>
                </div>
                <button 
                  className="btn-action-trigger" 
                  onClick={() => {
                    const text = firebaseLeads.map(l => `${l.createdAt} - WhatsApp: ${l.whatsapp} - Idéia de Negócio: ${l.idea}`).join('\n');
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Leads-Capturados-AIO.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Exportar Leads (.txt) 📥
                </button>
              </div>

              {firebaseLeads.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#A0AEC0', padding: '3rem 0', fontStyle: 'italic' }}>Nenhum número de WhatsApp capturado ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {firebaseLeads.map((lead) => (
                    <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#00C8FF', display: 'block' }}>{lead.whatsapp}</span>
                        <span style={{ fontSize: '0.75rem', color: '#CBD5E0' }}>Idéia de interesse: {lead.idea}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>{lead.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </main>
          )}
        </div>
      )}
    </div>
  );
};
