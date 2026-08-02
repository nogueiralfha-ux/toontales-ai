import React, { useState } from 'react';
import capaEbook from '../../assets/capa_ebook_aio.jpg';

export interface OpportunityResult {
  diagnostico: string;
  necessidade: string;
  urgencia: string;
  potencialMercado: string;
  solucoes: {
    categoria: string;
    titulo: string;
    descricao: string;
  }[];
  modeloNegocio: string;
  estrategia: string;
  fasesExecucao: string[];
  potencialCrescimento: string;
  proximosPassos: string[];
  riscos: string[];
  sugestoesMelhoria: string[];
  notas: {
    dor: number;
    urgencia: number;
    mercado: number;
    solucao: number;
    monetizacao: number;
    escalabilidade: number;
    concorrencia: number;
    potencial: number;
    idh: number;
    iso: number;
    final: number;
  };
}

interface AioDashboardProps {
  result: OpportunityResult;
  onReset: () => void;
  onSaveLead?: (whatsapp: string, idea: string) => void;
}

interface PhaseDetail {
  title: string;
  desc: string;
  script?: string;
  tecnico?: string;
  dica?: string;
}

export const AioDashboard: React.FC<AioDashboardProps> = ({ result, onReset, onSaveLead }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  
  // Abas de Entrega de Inteligência (Fase, Universidade, Biblioteca, Ferramentas)
  const [activeTab, setActiveTab] = useState<'plano' | 'universidade' | 'biblioteca' | 'ferramentas'>('plano');

  // Controle de Desbloqueio e Coleta de Leads
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [whatsappLead, setWhatsappLead] = useState('');

  // Valores para a calculadora financeira reativa (AIO 045 / AIO 043)
  const [targetClients, setTargetClients] = useState<number>(10);
  const [pricePerClient, setPricePerClient] = useState<number>(197);

  // Controle de páginas do E-book da Biblioteca
  const [ebookPage, setEbookPage] = useState<number>(0);

  // Formatação completa de todo o material gerado pelo A.I.O.
  const formatReportText = () => {
    return `==================================================
=== RELATÓRIO COMPLETO DE OPORTUNIDADE A.I.O. ===
==================================================

[1. DIAGNÓSTICO DO MERCADO]
- Oportunidade/Necessidade: ${result.necessidade}
- Análise de Cenário: ${result.diagnostico}
- Nível de Urgência: ${result.urgencia}
- Potencial de Mercado Mapeado: ${result.potencialMercado}

[2. IDEIAS DE NEGÓCIOS SUGERIDAS]
${result.solucoes.map((s, i) => `--- IDÉIA ${i + 1} ---
* Categoria: ${s.categoria}
* Título: ${s.titulo}
* Descrição da Solução: ${s.descricao}
`).join('\n')}

[3. ESTRATÉGIA FINANCEIRA E DE CAPTAÇÃO]
- Como Cobrar (Modelo de Ganhos): ${result.modeloNegocio}
- Como Divulgar (Canais de Atração): ${result.estrategia}

[4. NOTAS DE VIABILIDADE (0 a 100)]
* Pontuação Geral do Projeto: ${result.notas.final}/100
- Dor do Cliente: ${result.notas.dor}/100
- Urgência da Solução: ${result.notas.urgencia}/100
- Tamanho do Mercado: ${result.notas.mercado}/100
- Facilidade de Fazer (No-code/IA): ${result.notas.solucao}/100
- Forma de Monetização: ${result.notas.monetizacao}/100
- Poder de Escalabilidade: ${result.notas.escalabilidade}/100
- Nível de Pouca Concorrência: ${result.notas.concorrencia}/100
- Potencial Lucrativo Geral: ${result.notas.potencial}/100
* Índice Dor Humana (IDH): ${result.notas.idh}/100
* Índice de Oportunidade (ISO): ${result.notas.iso}/100

[5. PLANO DE EXECUÇÃO PRÁTICO (10 FASES)]
${result.fasesExecucao.map((fase, idx) => {
  return `Fase ${idx + 1}: ${fase}`;
}).join('\n')}

[6. CHECKLIST DE PRIMEIRAS AÇÕES]
${result.proximosPassos.map((p, i) => `[ ] ${p}`).join('\n')}

[7. ANÁLISE DE SEGURANÇA E CRESCIMENTO]
* Principais Riscos Mapeados:
${result.riscos.map(r => `- ${r}`).join('\n')}

* Conselhos de Evolução e Próximos Passos:
${result.sugestoesMelhoria.map(s => `- ${s}`).join('\n')}

==================================================
Relatório Gerado Automaticamente por A.I.O.
Agente Inteligente de Oportunidades.
==================================================`;
  };

  const handleDownloadTxt = () => {
    const text = formatReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio-Oportunidade-${result.necessidade.replace(/\s+/g, '-').slice(0, 30)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsapp = () => {
    const fullText = formatReportText() + `\n\nContato advindo do A.I.O`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    const subject = `Relatório de Oportunidade - ${result.necessidade}`;
    const body = formatReportText();
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  // Conteúdo das páginas do E-book Oficial com 6 páginas baseadas no sumário do usuário
  const ebookContent = [
    {
      title: "Dicionário de Termos da Internet",
      chapterNum: "A.I.O. BIBLIOTECA",
      content: (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          {/* Renderização da Capa com a imagem enviada pelo usuário resolvendo a visualização direta */}
          <div style={{ maxWidth: '280px', margin: '0 auto 1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', border: '1px solid hsl(var(--border))' }}>
            <img 
              src={capaEbook} 
              alt="Capa do E-book Dicionário de Termos da Internet" 
              style={{ width: '100%', display: 'block', height: 'auto' }}
            />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem' }}>Dicionário de Termos da Internet</h1>
          <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', marginBottom: '1rem' }}>Aprenda a linguagem da internet sem complicação</p>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Autor: A.I.O – Agente Inteligente de Oportunidades</span>
        </div>
      )
    },
    {
      title: "Apresentação & Sumário",
      chapterNum: "APRESENTAÇÃO",
      content: (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 850, marginBottom: '1rem' }}>Apresentação</h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>A internet possui milhares de palavras em inglês que assustam quem está começando. Na realidade, a maioria desses termos representa ideias bastante simples.</p>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>O objetivo deste pequeno dicionário é explicar os principais conceitos utilizando exemplos do dia a dia, permitindo que qualquer pessoa compreenda o funcionamento da tecnologia moderna.</p>
          
          <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>📖 Sumário do Livro</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
              <li style={{ cursor: 'pointer', color: 'hsl(var(--primary))' }} onClick={() => setEbookPage(2)}>1. Capítulo 1 – SaaS (Software como Serviço)</li>
              <li style={{ cursor: 'pointer', color: 'hsl(var(--primary))' }} onClick={() => setEbookPage(3)}>2. Capítulo 2 – No-Code (Sem Programação)</li>
              <li style={{ cursor: 'pointer', color: 'hsl(var(--primary))' }} onClick={() => setEbookPage(4)}>3. Capítulo 3 – Webhooks e APIs (As Pontes da Internet)</li>
              <li style={{ cursor: 'pointer', color: 'hsl(var(--primary))' }} onClick={() => setEbookPage(5)}>4. Conclusão & Sobre o Autor</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Capítulo 1: SaaS (Software como Serviço)",
      chapterNum: "CAPÍTULO 1",
      content: (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 850, marginBottom: '0.75rem' }}>SaaS (Software como Serviço)</h2>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>1.1 O que significa SaaS?</strong><br />SaaS é a sigla para <em>Software as a Service</em> (Software como Serviço). Ao invés de vender um programa para ser instalado no computador, você oferece acesso pela internet. O cliente apenas entra no site, faz login e utiliza o sistema.</p>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>1.2 Como funciona?</strong><br />Imagine um condomínio. Você não compra o prédio, você paga uma mensalidade para morar nele. Com o SaaS acontece exatamente isso. Você paga uma assinatura para usar um software. Quando parar de pagar, perde o acesso.</p>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>1.3 Exemplos conhecidos:</strong><br />Netflix (filmes por assinatura), Spotify (músicas por assinatura), Google Drive (espaço em nuvem), Canva Pro e ChatGPT Plus.</p>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '0.9rem' }}>
            <strong>1.4 Como ganhar dinheiro com SaaS?</strong><br />
            Muitas empresas vivem da receita recorrente mensal. Exemplo: <strong>500 clientes</strong> pagando <strong>R$ 39/mês</strong> gera um faturamento recorrente fixo de <strong>R$ 19.500 por mês</strong>.
          </div>
        </div>
      )
    },
    {
      title: "Capítulo 2: No-Code (Sem Programação)",
      chapterNum: "CAPÍTULO 2",
      content: (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 850, marginBottom: '0.75rem' }}>No-Code (Sem Programação)</h2>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>2.1 O que significa No-Code?</strong><br />Significa literalmente: sem escrever linhas de código ou programação. Hoje existem plataformas que permitem criar aplicativos e sites completos apenas clicando, arrastando e configurando blocos visuais na tela.</p>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>2.2 Como funciona?</strong><br />Imagine montar um quebra-cabeça. Cada peça possui uma função e você apenas as conecta. No No-Code você conecta blocos funcionais prontos.</p>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>2.3 Exemplos de ferramentas importantes:</strong><br />Bubble (apps completos), FlutterFlow (apps Android/iOS), Lovable e Bolt.new (geração por IA), Make e n8n (automações), Glide (planilhas em apps) e Softr.</p>
          <p style={{ lineHeight: '1.5', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}><strong>Vantagens:</strong> Muito mais rápido, muito mais barato, não exige faculdade de computação e permite validar ideias de negócios locais de forma imediata.</p>
        </div>
      )
    },
    {
      title: "Capítulo 3: Webhooks e APIs",
      chapterNum: "CAPÍTULO 3",
      content: (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 850, marginBottom: '0.75rem' }}>Webhooks e APIs (As Pontes da Internet)</h2>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>3.1 O que é uma API?</strong><br />Significa Interface de Programação de Aplicações. Ela permite que dois sistemas conversem. É como um garçom: você faz o pedido, o garçom leva até a cozinha e depois lhe entrega a comida pronta. A API leva dados de um sistema para o outro.</p>
          <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}><strong>3.2 O que é um Webhook?</strong><br />Enquanto a API pergunta se existe novidade, o Webhook avisa automaticamente. É como um carteiro: assim que chega uma carta, ele toca a sua campainha, evitando que você precise ficar olhando a caixa de correio toda hora.</p>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '0.85rem' }}>
            <strong>3.3 Exemplo prático de fluxo:</strong><br />
            Cliente agenda no WhatsApp → Envia um Webhook → Make recebe → Google Calendar cria o evento automaticamente → Cliente recebe confirmação de sucesso em segundos.
          </div>
        </div>
      )
    },
    {
      title: "Conclusão & Autor",
      chapterNum: "CONCLUSÃO",
      content: (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 850, marginBottom: '0.75rem' }}>Conclusão</h2>
          <p style={{ lineHeight: '1.5', marginBottom: '1.5rem', fontSize: '0.95rem' }}>A tecnologia não precisa ser complicada. Dominar termos básicos como SaaS (sistemas por assinatura), No-code (construção sem código) e APIs (pontes de integração) é o primeiro passo para criar negócios inteligentes e automatizar tarefas manuais na nova economia digital.</p>
          
          <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sobre o Autor</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}><strong>A.I.O – Agente Inteligente de Oportunidades</strong> foi idealizado para simplificar conceitos tecnológicos e auxiliar na criação de soluções inovadoras usando Inteligência Artificial e automações, transformando conhecimento complexo em conteúdo acessível e prático.</p>
          </div>
        </div>
      )
    }
  ];

  // Cálculos reativos
  const grossRevenue = targetClients * pricePerClient;
  const estimatedCost = Math.round(grossRevenue * 0.15 + 50); // 15% de custos de APIs/servidores + R$ 50 fixo
  const netProfit = Math.max(0, grossRevenue - estimatedCost);
  const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  const handleCopyText = (text: string, type: 'script' | 'tecnico') => {
    navigator.clipboard.writeText(text).then(() => {
      const key = `${activePhaseIndex}-${type}`;
      setCopiedIndex(key);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const phaseDetails: Record<number, PhaseDetail> = {
    0: {
      title: "Fase 1: Mapear Necessidade (Prospecção)",
      desc: "Aborde clínicas, profissionais de estética, prestadores locais ou pequenos comerciantes que não têm atendimento rápido.",
      script: `Script de abordagem recomendado:\n\n"Olá, [Nome do Responsável]! Notei que vocês têm um perfil excelente, mas percebi que clientes interessados em marcar horários fora do expediente comercial podem acabar esfriando sem uma resposta imediata.\n\nDesenvolvemos um assistente de agendamento por WhatsApp que atende 24h em tempo real. Estamos selecionando 3 parceiros locais para testar sem custos de setup. Teriam 5 minutos para conhecer como funciona?"`,
      dica: "Dica do Executor: Use o Google Maps na sua cidade, digite o nome do serviço (ex: manicure, dentista, pedreiro) e veja quem não responde rápido no chat para propor a parceria."
    },
    1: {
      title: "Fase 2: Analisar o Mercado (Concorrentes)",
      desc: "Pesquise concorrentes locais e defina o seu diferencial competitivo de forma simples.",
      tecnico: "Instruções Técnicas:\n1. Procure no Google os 3 sistemas de agendamento mais comuns da sua cidade.\n2. Veja os problemas reclamados pelos usuários (ex: difícil de mexer pelo celular, preço alto, taxas ocultas).\n3. Use isso como diferencial: a sua solução roda direta no WhatsApp do cliente de forma extremamente intuitiva e simplificada.",
      dica: "Dica do Executor: O seu maior trunfo competitivo é a simplicidade. Não tente criar algo gigante, faça o básico funcionar perfeitamente."
    },
    2: {
      title: "Fase 3: Validar a Oportunidade (Primeiros Clientes)",
      desc: "Ofereça o MVP totalmente gratuito por 7 dias para fechar com as primeiras clínicas parceiras.",
      script: `Script de negociação da oferta:\n\n"Para provar o valor na prática, nós configuramos e liberamos a automação inteira de graça por 7 dias. Você só começa a pagar a mensalidade se o robô preencher horários e de fato trouxer resultados. Vamos rodar esse teste na próxima semana?"`,
      dica: "Dica do Executor: Use estes primeiros 3 clientes como estudos de caso e colha depoimentos preciosos."
    },
    3: {
      title: "Fase 4: Criar a Solução (Typebot / Make)",
      desc: "Monte o fluxo lógico de conversa e integre com a API de IA.",
      tecnico: "Fluxo lógico recomendado no Typebot:\n1. Boas-vindas da IA -> 2. Coletar nome do cliente -> 3. Escolher serviço -> 4. Disparar Webhook para o Make.com -> 5. Make consulta horários livres no Google Calendar -> 6. Retorna opções em botões dinâmicos -> 7. Cliente seleciona o horário -> 8. Salvar reserva.",
      dica: "Dica do Executor: Mantenha as mensagens curtas e use emojis para dar um tom amigável."
    },
    4: {
      title: "Fase 5: Desenvolver o Produto (MVP)",
      desc: "Monte o painel administrativo simplificado para as clínicas consultarem a agenda.",
      tecnico: "Solução recomendada para início ágil:\nUse Glide, Airtable ou mesmo planilhas integradas via Make para que a dona da clínica receba as notificações de marcações e visualize a agenda sem precisar de sistemas caros no início.",
      dica: "Dica do Executor: Não gaste semanas desenvolvendo código complexo antes de validar a recorrência financeira."
    },
    5: {
      title: "Fase 6: Criar o Modelo de Negócio",
      desc: "Configure o sistema de recebimento e controle financeiro de assinaturas.",
      tecnico: "Infraestrutura recomendada:\n1. Crie uma conta no Stripe ou Asaas (plataformas brasileiras com menor taxa Pix).\n2. Crie um produto recorrente do tipo 'Assinatura Mensal'.\n3. Configure o envio automático de faturas via WhatsApp/e-mail para os assinantes.",
      dica: "Dica do Executor: Ofereça 10% de desconto para pagamentos anuais no Pix."
    },
    6: {
      title: "Fase 7: Implementar as Automações",
      desc: "Configure lembretes de agendamento automáticos pós-confirmação.",
      tecnico: "Régua de mensagens no Make.com:\n- Disparo 1: Confirmação imediata do horário.\n- Disparo 2: Lembrete de presença 24h antes.\n- Disparo 3: Lembrete express 2h antes com opção de 'Confirmar' ou 'Reagendar'.",
      dica: "Dica do Executor: Lembretes reduzem a taxa de ausência (no-show) em mais de 40%."
    },
    7: {
      title: "Fase 8: Criar as Campanhas",
      desc: "Grave e edite vídeos rápidos mostrando a automação funcionando em tempo real para atrair clientes.",
      script: "Estrutura do roteiro de vídeo (Reels/TikTok):\n1. Gancho (0-3s): 'Essa clínica de estética reduziu o telefone tocando a zero e dobrou a marcação de horários...'\n2. Problema (3-10s): 'Perder clientes porque a secretária demorou para responder é passado.'\n3. Solução (10-25s): Mostre o celular com a IA conversando e fechando o agendamento em 30 segundos.\n4. CTA (25-30s): 'Se quer esse robô na sua clínica, comente QUERO aqui embaixo.'",
      dica: "Dica do Executor: Deixe a tela do celular bem legível e dinâmica no vídeo."
    },
    8: {
      title: "Fase 9: Validar os Resultados",
      desc: "Colete depoimentos em vídeo e dados de impacto das clínicas parceiras.",
      script: `Perguntas para o depoimento do cliente:\n\n1. "Qual era a sua maior dificuldade com agendamento antes da nossa ferramenta?"\n2. "Como a automação mudou a rotina da sua clínica no dia a dia?"\n3. "Você recomendaria esse sistema para outras clínicas?"`,
      dica: "Dica do Executor: Ofereça 1 mês de bônus na assinatura para os clientes que gravarem o depoimento em vídeo."
    },
    9: {
      title: "Fase 10: Escalar o Projeto",
      desc: "Expanda as vendas utilizando tráfego pago geolocalizado.",
      tecnico: "Configuração de anúncios no Meta Ads:\n1. Campanha de Tráfego direcionada para o WhatsApp.\n2. Público: Donos de negócios locais na sua cidade (filtros por interesses em estética, beleza, gerência).\n3. Orçamento inicial sugerido: R$ 15,00 a R$ 20,00 por dia.",
      dica: "Dica do Executor: Use os depoimentos da Fase 9 como o criativo principal do anúncio."
    }
  };

  return (
    <div className="dashboard-container-aio" style={{ position: 'relative' }}>
      <div className="glow-orb orb-primary" />

      {/* Barreira de Desbloqueio (Lock Lead Wall) */}
      {!isUnlocked && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 20, 45, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="dashboard-card shadow-premium" style={{ maxWidth: '440px', textAlign: 'center', padding: '2.5rem 2rem', border: '1px solid rgba(106, 61, 240, 0.4)', boxShadow: '0 10px 40px rgba(106, 61, 240, 0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔓</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.75rem' }}>Seu Diagnóstico Está Pronto!</h2>
            <p style={{ color: '#CBD5E0', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Digite seu WhatsApp abaixo para liberar o acesso gratuito e vitalício ao seu plano prático e às ferramentas recomendadas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="tel" 
                placeholder="(DDD) 9XXXX-XXXX" 
                value={whatsappLead}
                onChange={e => setWhatsappLead(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              />
              <button 
                className="btn-primary-aio" 
                onClick={() => {
                  const cleanedPhone = whatsappLead.replace(/\D/g, '');
                  if (cleanedPhone.length >= 10) {
                    setIsUnlocked(true);
                    
                    // Persiste o lead no banco de dados local
                    if (onSaveLead) {
                      onSaveLead(cleanedPhone, result.necessidade);
                    }

                    // Formata o relatório completo para enviar
                    const reportText = formatReportText() + `\n\nContato advindo do A.I.O`;
                    // Abre o WhatsApp enviando o relatório para o número informado
                    const url = `https://api.whatsapp.com/send?phone=55${cleanedPhone}&text=${encodeURIComponent(reportText)}`;
                    window.open(url, '_blank');
                  } else {
                    alert("Por favor, digite seu WhatsApp com DDD (ex: 16997327255).");
                  }
                }}
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 800 }}
              >
                Liberar Acesso Gratuito
              </button>
            </div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#A0AEC0', marginTop: '1.5rem' }}>
              🔒 Seus dados estão seguros e não enviamos spam.
            </span>
          </div>
        </div>
      )}

      <header className="dashboard-header-aio">
        <div className="brand-logo-small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <h2>A.I.O. Dashboard</h2>
        </div>
        <button className="btn-reset-aio" onClick={onReset}>
          Nova Consulta
        </button>
      </header>

      {/* Barra de Ferramentas de Exportação e Salvamento */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn-action-trigger" onClick={handleDownloadTxt}>
          📥 Salvar no Computador (Download TXT)
        </button>
        <button className="btn-action-trigger" onClick={handleShareWhatsapp}>
          💬 Compartilhar no WhatsApp
        </button>
        <button className="btn-action-trigger" onClick={handleSendEmail}>
          ✉️ Enviar por E-mail
        </button>
      </div>

      {/* Seletores de Camada de Inteligencia no topo da Dashboard */}
      <div className="dashboard-tabs-container">
        <button
          className={`tab-btn-aio ${activeTab === 'plano' ? 'active' : ''}`}
          onClick={() => setActiveTab('plano')}
        >
          📋 Plano de Execução (Fases)
        </button>
        <button
          className={`tab-btn-aio ${activeTab === 'universidade' ? 'active' : ''}`}
          onClick={() => setActiveTab('universidade')}
        >
          🎓 Universidade (Aprender a Criar)
        </button>
        <button
          className={`tab-btn-aio ${activeTab === 'biblioteca' ? 'active' : ''}`}
          onClick={() => setActiveTab('biblioteca')}
        >
          📚 Biblioteca (E-book de Conceitos)
        </button>
        <button
          className={`tab-btn-aio ${activeTab === 'ferramentas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ferramentas')}
        >
          🛠️ Ferramentas (Grátis vs Pagas)
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Lado Esquerdo: Abas de Conteudo Dinamico */}
        <div className="main-content-column">
          {activeTab === 'plano' && (
            <>
              <section className="dashboard-card shadow-premium">
                <div className="card-header-aio">
                  <span className="badge-category">Diagnóstico de Mercado Mapeado</span>
                  <h2>{result.necessidade}</h2>
                </div>
                <div className="card-body-aio">
                  <p className="highlight-text">{result.diagnostico}</p>
                  <div className="info-meta-grid">
                    <div>
                      <label>Urgência Mapeada</label>
                      <span>{result.urgencia}</span>
                    </div>
                    <div>
                      <label>Potencial do Mercado</label>
                      <span>{result.potencialMercado}</span>
                    </div>
                  </div>

                  {/* CTA Comercial de Contratação */}
                  <div style={{ marginTop: '2rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginBottom: '1rem' }}>Gostou desse plano, mas quer que a nossa equipe configure tudo para você?</p>
                    <a 
                      href={`https://api.whatsapp.com/send?phone=5516997327255&text=Olá! Gostaria de contratar a configuração do setup do projeto recomendado pelo A.I.O: ${encodeURIComponent(result.necessidade)}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary-aio" 
                      style={{ display: 'inline-block', textDecoration: 'none', padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
                    >
                      Quero Contratar a Configuração deste Projeto ⚡
                    </a>
                  </div>
                </div>
              </section>

              {/* Soluções Propostas */}
              <section className="dashboard-card shadow-premium mt-1.5">
                <div className="card-header-aio">
                  <h2>Ideias de Negócios Sugeridas</h2>
                  <p className="subtitle-desc">Opções criadas sob medida para o seu orçamento, tempo livre e habilidades.</p>
                </div>
                <div className="solutions-stack">
                  {result.solucoes.map((sol, index) => (
                    <div key={index} className="solution-item">
                      <div className="solution-header">
                        <span className="badge-sol-cat">{sol.categoria}</span>
                        <h3>{sol.titulo}</h3>
                      </div>
                      <p>{sol.descricao}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Modelo de Negócio e Estratégia */}
              <div className="two-col-grid mt-1.5">
                <section className="dashboard-card shadow-premium">
                  <div className="card-header-aio">
                    <h2>Como Cobrar / Modelo de Ganhos</h2>
                    <p className="subtitle-desc">A melhor forma de precificar e receber pagamentos dos clientes.</p>
                  </div>
                  <p>{result.modeloNegocio}</p>
                </section>
                <section className="dashboard-card shadow-premium">
                  <div className="card-header-aio">
                    <h2>Como Divulgar / Encontrar Clientes</h2>
                    <p className="subtitle-desc">Estratégias de vendas de baixo custo para conseguir resultados rápidos.</p>
                  </div>
                  <p>{result.estrategia}</p>
                </section>
              </div>

              {/* Plano de Execução (Fases 1 a 10) */}
              <section className="dashboard-card shadow-premium mt-1.5">
                <div className="card-header-aio">
                  <h2>Plano de Execução (Etapas Práticas)</h2>
                  <p className="subtitle-desc">Veja o passo a passo para começar. **Clique em qualquer linha** para ver o guia prático com scripts e tutoriais.</p>
                </div>
                <div className="execution-flow">
                  {result.fasesExecucao.map((fase, index) => (
                    <div
                      key={index}
                      className="flow-step clickable-step"
                      onClick={() => setActivePhaseIndex(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
                      <div className="step-detail" style={{ flex: 1 }}>
                        <h3>{fase.split(':')[0]}</h3>
                        <p>{fase.split(':')[1] || ''}</p>
                      </div>
                      <button className="btn-action-trigger">Ver Ajuda Prática ⚡</button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'ferramentas' && (
            <section className="dashboard-card shadow-premium">
              <div className="card-header-aio" style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2>🛠️ Prateleira de Ferramentas (Como Desenvolver Seu Projeto)</h2>
                <p className="subtitle-desc">Separamos os recursos essenciais de que você precisa, divididos entre ferramentas 100% grátis e pagas para quando você for expandir.</p>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--accent-success))', marginBottom: '1rem' }}>🟢 Ferramentas 100% Gratuitas (Para Começar Sem Custos)</h3>
              <div className="solutions-stack" style={{ marginBottom: '3rem' }}>
                <div className="solution-item">
                  <span className="badge-sol-cat" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Grátis Ilimitado</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Tally.so (Formulários Online)</h4>
                  <p style={{ fontSize: '0.9rem' }}>A melhor ferramenta de formulários do mundo. Permite criar páginas de agendamento de consultas ou captação de clientes sem pagar nada e sem limite de respostas.</p>
                  <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ display: 'inline-block', marginTop: '0.75rem', textDecoration: 'none' }}>Acessar Tally.so 🔗</a>
                </div>

                <div className="solution-item">
                  <span className="badge-sol-cat" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Grátis Ilimitado</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Google Agenda (Organizador de Horários)</h4>
                  <p style={{ fontSize: '0.9rem' }}>Você cria uma agenda dedicada para o seu cliente do comércio local. Os horários marcados pelo robô caem aqui de forma 100% organizada.</p>
                  <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ display: 'inline-block', marginTop: '0.75rem', textDecoration: 'none' }}>Acessar Google Agenda 🔗</a>
                </div>

                <div className="solution-item">
                  <span className="badge-sol-cat" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Grátis (1.000 Ações/Mês)</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Make.com (Cérebro Operacional)</h4>
                  <p style={{ fontSize: '0.9rem' }}>Conecta o formulário do site diretamente com a planilha e a agenda do cliente de forma invisível. O plano gratuito suporta até 1.000 envios de dados por mês.</p>
                  <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ display: 'inline-block', marginTop: '0.75rem', textDecoration: 'none' }}>Acessar Make.com 🔗</a>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--primary))', marginBottom: '1rem' }}>🔵 Ferramentas Profissionais (Para Escalar & Lucrar)</h3>
              <div className="solutions-stack">
                <div className="solution-item">
                  <span className="badge-sol-cat" style={{ background: 'rgba(106, 61, 240, 0.1)', color: 'hsl(var(--primary))' }}>Plano Grátis / Pago opcional</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Typebot.io (Chatbots de WhatsApp)</h4>
                  <p style={{ fontSize: '0.9rem' }}>Permite criar caminhos de conversação inteligentes, gerando atendentes de WhatsApp automáticos para clínicas que conversam com o cliente final.</p>
                  <a href="https://typebot.io" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ display: 'inline-block', marginTop: '0.75rem', textDecoration: 'none' }}>Acessar Typebot 🔗</a>
                </div>

                <div className="solution-item">
                  <span className="badge-sol-cat" style={{ background: 'rgba(106, 61, 240, 0.1)', color: 'hsl(var(--primary))' }}>Taxa por Venda Efetuada</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Asaas / Stripe (Recebimentos Automáticos)</h4>
                  <p style={{ fontSize: '0.9rem' }}>Gerenciamento de faturas e mensalidades recorrentes por cartão ou Pix. O cliente se cadastra e o dinheiro cai na sua conta todo mês.</p>
                  <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ display: 'inline-block', marginTop: '0.75rem', textDecoration: 'none' }}>Acessar Asaas 🔗</a>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'universidade' && (
            <section className="dashboard-card shadow-premium">
              <div className="card-header-aio">
                <h2>🎓 Universidade A.I.O. (Curso de Inicialização Rápida)</h2>
                <p className="subtitle-desc">Aprenda a aplicar as 3 lições core na prática para construir seu micro-negócio digital.</p>
              </div>
              <div className="solutions-stack" style={{ marginTop: '2rem' }}>
                <div className="solution-item">
                  <span className="badge-sol-cat">LIÇÃO 01: Prestação de Serviços Digitais</span>
                  <h3 style={{ margin: '0.5rem 0' }}>Como funciona no mundo real</h3>
                  <p>Muitos donos de comércios tradicionais (padarias, manicures, consultórios) não entendem nada de tecnologia. O seu papel não é criar um sistema super complexo, mas sim organizar o WhatsApp e a agenda deles de forma simples. Você atua como o facilitador que economiza tempo para eles.</p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <strong>Exemplo Prático:</strong><br />
                    Você vai até a Manicure do seu bairro e propõe: <em>"Eu configuro um sistema no seu celular onde suas clientes escolhem o serviço e o horário pelo link do WhatsApp, e a sua agenda se organiza sozinha sem você precisar ficar digitando no meio do expediente."</em>
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ textDecoration: 'none' }}>Tally Forms (Grátis) 🔗</a>
                    <a href="https://typebot.io" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ textDecoration: 'none' }}>Typebot (Chatbot) 🔗</a>
                  </div>
                </div>

                <div className="solution-item">
                  <span className="badge-sol-cat">LIÇÃO 02: Montando a Primeira Demonstração</span>
                  <h3 style={{ margin: '0.5rem 0' }}>O Roteiro da Validação Rápida</h3>
                  <p>A melhor forma de fechar um cliente é mostrando o robô funcionando. Crie um fluxo de testes no seu celular. Mande uma mensagem simulando um cliente real e grave a tela do celular respondendo e agendando. Mostre esse vídeo para o comerciante. O impacto visual de ver o robô funcionando na hora garante o fechamento.</p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <strong>Roteiro de Gravação de Tela (30 segundos):</strong><br />
                    1. Envie no chat da IA: <em>"Oi, quero marcar pé e mão hoje 14h."</em><br />
                    2. Mostre o robô respondendo na hora: <em>"Olá! Temos o horário das 14h livre com a profissional Ana. Confirmamos?"</em><br />
                    3. Clique em 'Confirmar' e mostre a notificação de confirmação que cai para a dona da clínica.
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ textDecoration: 'none' }}>Make.com (Integrações) 🔗</a>
                    <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ textDecoration: 'none' }}>Google Agenda (Calendário) 🔗</a>
                  </div>
                </div>

                <div className="solution-item">
                  <span className="badge-sol-cat">LIÇÃO 03: Cobrança e Recebimento Recorrente</span>
                  <h3 style={{ margin: '0.5rem 0' }}>Ajustando as Cobranças Automáticas</h3>
                  <p>Evite cobrar fiado. Use plataformas gratuitas como Asaas ou Mercado Pago para gerar links de cobrança recorrentes (mensais). O cliente cadastra o cartão de crédito ou faz o Pix automático. Isso garante que você receba todo mês certinho sem precisar ficar cobrando manualmente.</p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <strong>Exemplo de Precificação Recomendada:</strong><br />
                    Cobrar uma taxa de setup inicial de <strong>R$ 199,00</strong> (para você configurar o formulário e a integração) + uma mensalidade fixa de <strong>R$ 49,90</strong> para suporte e manutenção da automação.
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ textDecoration: 'none' }}>Asaas Recorrência 🔗</a>
                    <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="btn-action-trigger" style={{ textDecoration: 'none' }}>Stripe Brasil 🔗</a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'biblioteca' && (
            <section className="dashboard-card shadow-premium" style={{ position: 'relative' }}>
              <div className="card-header-aio" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem' }}>
                <div>
                  <span className="badge-sol-cat">{ebookContent[ebookPage].chapterNum}</span>
                  <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{ebookContent[ebookPage].title}</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-action-trigger" 
                    onClick={() => setEbookPage(p => Math.max(0, p - 1))}
                    disabled={ebookPage === 0}
                  >
                    ◀ Voltar
                  </button>
                  <button 
                    className="btn-action-trigger" 
                    onClick={() => setEbookPage(p => Math.min(ebookContent.length - 1, p + 1))}
                    disabled={ebookPage === ebookContent.length - 1}
                  >
                    Avançar ▶
                  </button>
                </div>
              </div>

              <div style={{ minHeight: '320px', padding: '2rem 0' }}>
                {ebookContent[ebookPage].content}
              </div>

              {/* Indicador de Páginas do E-book */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                {ebookContent.map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setEbookPage(i)}
                    style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: ebookPage === i ? 'hsl(var(--primary))' : 'hsl(var(--border))', 
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Riscos e Melhorias fixos na Dashboard */}
          <div className="two-col-grid mt-1.5">
            <section className="dashboard-card shadow-premium">
              <div className="card-header-aio">
                <h2>Atenção: Riscos do Projeto</h2>
                <p className="subtitle-desc">Quais dificuldades você pode ter e o que prestar atenção para não errar.</p>
              </div>
              <ul className="dashboard-list">
                {result.riscos.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
            <section className="dashboard-card shadow-premium">
              <div className="card-header-aio">
                <h2>Conselhos de Evolução</h2>
                <p className="subtitle-desc">Como melhorar sua ideia e expandir seus ganhos no futuro.</p>
              </div>
              <ul className="dashboard-list">
                {result.sugestoesMelhoria.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Lado Direito: Matriz de Pontuação, Checklist e CALCULADORA REATIVA */}
        <div className="sidebar-column">
          {/* Calculadora Financeira Reativa (AIO 045) */}
          <section className="dashboard-card shadow-premium" style={{ border: '1px solid hsla(var(--primary), 0.3)', background: 'linear-gradient(180deg, hsl(var(--surface)) 0%, hsla(var(--primary), 0.02) 100%)' }}>
            <div className="card-header-aio">
              <span className="badge-sol-cat">💸 SIMULADOR DE LUCROS</span>
              <h2 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Simulação Financeira</h2>
              <p className="subtitle-desc">Calcule quanto você pode faturar no mês.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Quantidade de Clientes (Mensais):</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={targetClients}
                    onChange={e => setTargetClients(Math.max(0, Number(e.target.value)))}
                    className="form-input"
                    style={{ background: 'hsl(var(--background))', color: 'white', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '0.5rem', width: '80px', textAlign: 'center' }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={targetClients}
                    onChange={e => setTargetClients(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Valor Cobrado por Cliente (R$ / Mês):</label>
                <input
                  type="number"
                  value={pricePerClient}
                  onChange={e => setPricePerClient(Math.max(0, Number(e.target.value)))}
                  className="form-input"
                  style={{ background: 'hsl(var(--background))', color: 'white', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '0.5rem', width: '100%' }}
                />
              </div>

              <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Faturamento Bruto:</span>
                  <span style={{ fontWeight: 700 }}>R$ {grossRevenue.toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Custos de Servidor/IA:</span>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>R$ {estimatedCost.toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed hsl(var(--border))', paddingTop: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'white' }}>Lucro Líquido:</span>
                  <span style={{ fontWeight: 800, color: 'hsl(var(--accent-success))' }}>R$ {netProfit.toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Margem de Lucro:</span>
                  <span style={{ fontWeight: 700, color: '#a855f7' }}>{profitMargin}%</span>
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-card card-highlight shadow-premium mt-1.5">
            <div className="card-header-aio">
              <h2>Notas de Viabilidade (0 a 100)</h2>
              <p className="subtitle-desc">Avaliamos a sua ideia em cada quesito de mercado.</p>
            </div>
            <div className="score-matrix">
              {[
                { label: 'Dor do Cliente', val: result.notas.dor },
                { label: 'Urgência da Solução', val: result.notas.urgencia },
                { label: 'Tamanho do Mercado', val: result.notas.mercado },
                { label: 'Facilidade de Fazer', val: result.notas.solucao },
                { label: 'Forma de Ganhar Dinheiro', val: result.notas.monetizacao },
                { label: 'Poder de Crescimento', val: result.notas.escalabilidade },
                { label: 'Pouca Concorrência', val: result.notas.concorrencia },
                { label: 'Potencial Lucrativo', val: result.notas.potencial },
                { label: 'Índice Dor Humana (IDH)', val: result.notas.idh },
                { label: 'Índice de Oportunidade (ISO)', val: result.notas.iso }
              ].map((item, idx) => (
                <div key={idx} className="matrix-row">
                  <span>{item.label}</span>
                  <div className="matrix-bar-bg">
                    <div className="matrix-bar-fill" style={{ width: `${item.val}%` }} />
                  </div>
                  <span className="matrix-score">{item.val}/100</span>
                </div>
              ))}

              <div className="final-score-box">
                <label>NOTA FINAL DO SEU PROJETO</label>
                <span className="final-val">{result.notas.final}</span>
              </div>
            </div>
          </section>

          <section className="dashboard-card shadow-premium mt-1.5">
            <div className="card-header-aio">
              <h2>Suas Primeiras Ações (Checklist)</h2>
              <p className="subtitle-desc">Marque as tarefas concluídas para iniciar com o pé direito.</p>
            </div>
            <ul className="steps-checklist">
              {result.proximosPassos.map((passo, i) => (
                <li key={i}>
                  <input type="checkbox" id={`passo-${i}`} />
                  <label htmlFor={`passo-${i}`}>{passo}</label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Modal Overlay do Executor A.E.O. com recursos didaticos */}
      {activePhaseIndex !== null && phaseDetails[activePhaseIndex] && (
        <div className="modal-overlay" onClick={() => setActivePhaseIndex(null)}>
          <div className="modal-content-aio shadow-premium" onClick={e => e.stopPropagation()}>
            <header className="modal-header-aio">
              <h2>{phaseDetails[activePhaseIndex].title}</h2>
              <button className="modal-close-btn" onClick={() => setActivePhaseIndex(null)}>
                ×
              </button>
            </header>
            <main className="modal-body-aio">
              <p className="modal-desc-highlight">{phaseDetails[activePhaseIndex].desc}</p>
              
              {phaseDetails[activePhaseIndex].script && (
                <div className="code-box-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Texto Pronto para Copiar e Enviar:</label>
                    <button
                      className="btn-action-trigger"
                      onClick={() => handleCopyText(phaseDetails[activePhaseIndex].script || '', 'script')}
                    >
                      {copiedIndex === `${activePhaseIndex}-script` ? "✓ Copiado!" : "Copiar Texto 📋"}
                    </button>
                  </div>
                  <pre className="code-display">{phaseDetails[activePhaseIndex].script}</pre>
                </div>
              )}

              {phaseDetails[activePhaseIndex].tecnico && (
                <div className="code-box-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Passo a Passo de Configuração:</label>
                    <button
                      className="btn-action-trigger"
                      onClick={() => handleCopyText(phaseDetails[activePhaseIndex].tecnico || '', 'tecnico')}
                    >
                      {copiedIndex === `${activePhaseIndex}-tecnico` ? "✓ Copiado!" : "Copiar Instruções 📋"}
                    </button>
                  </div>
                  <pre className="code-display">{phaseDetails[activePhaseIndex].tecnico}</pre>
                </div>
              )}

              {phaseDetails[activePhaseIndex].dica && (
                <div className="alert-tip-aio">
                  <span>💡 **Conselho do Executor:** {phaseDetails[activePhaseIndex].dica}</span>
                </div>
              )}
            </main>
            <footer className="modal-footer-aio">
              <button className="btn-modal-close" onClick={() => setActivePhaseIndex(null)}>
                Voltar para Dashboard
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
