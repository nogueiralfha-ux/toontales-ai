import React from 'react';
import { Story } from '../../domain/Story';
import { UserSubscription, PlanType, PLAN_LIMITS } from '../../domain/Subscription';

interface ParentDashboardProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  subscription: UserSubscription;
  onSelectPlan: (planType: PlanType, billingCycle: 'mensal' | 'anual') => void;
  onCancelSubscription: () => void;
  onDowngradeToFree: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  stories,
  onSelectStory,
  subscription,
  onSelectPlan,
  onCancelSubscription,
  onDowngradeToFree,
}) => {
  const limits = PLAN_LIMITS[subscription.planType];
  const storiesCreated = stories.length;

  const triggerDownload = (fileName: string, mimeType: string, content: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const handleDownloadPDFBook = (story: Story) => {
    if (subscription.planType === 'free') {
      alert("Acesso Negado! O download do livro impresso em PDF é exclusivo para assinantes. Faça o upgrade do seu plano para liberar.");
      return;
    }

    const bookHtml = `
      <html>
        <head>
          <title>${story.title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; text-align: center; }
            .scene { page-break-after: always; padding: 40px 20px; border: 1px solid #eee; margin-bottom: 20px; }
            svg { max-width: 80%; height: auto; margin: 20px 0; }
            h1 { color: #f05a28; }
            p { font-size: 20px; line-height: 1.6; max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body onload="window.print();">
          <h1>${story.title}</h1>
          <p>Eixo: ${story.theme} | Idade: ${story.ageGroup} anos</p>
          <hr/>
          ${story.scenes.map(s => `
            <div class="scene">
              <h2>Cena ${s.pageNumber}</h2>
              <div>${s.illustrationUrl ? `<img src="${s.illustrationUrl}" style="max-width: 80%; height: auto; display: block; margin: 20px auto; border-radius: 12px;" />` : s.illustrationSvg}</div>
              <p>${s.text}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    triggerDownload(`${story.title.replace(/\s+/g, '_')}_livro.html`, 'text/html', bookHtml);
  };

  const handleDownloadPDFColoring = (story: Story) => {
    if (subscription.planType === 'free') {
      alert("Acesso Negado! O download do caderno de colorir em PDF é exclusivo para assinantes. Faça o upgrade do seu plano para liberar.");
      return;
    }

    const coloringHtml = `
      <html>
        <head>
          <title>${story.title} - Para Colorir</title>
          <style>
            body { font-family: sans-serif; padding: 20px; text-align: center; }
            .scene { page-break-after: always; padding: 40px 20px; border: 1px solid #ddd; margin-bottom: 20px; }
            svg, img { max-width: 90%; height: auto; margin: 20px 0; }
            h1 { color: #333; }
            p { font-size: 18px; color: #666; max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body onload="window.print();">
          <h1>${story.title} (Livro de Colorir)</h1>
          <p>Instruções: Use seus lápis e giz de cera favoritos para colorir as cenas!</p>
          <hr/>
          ${story.scenes.map(s => `
            <div class="scene">
              <h2>Desenho da Página ${s.pageNumber}</h2>
              <div>${s.coloringUrl ? `<img src="${s.coloringUrl}" style="max-width: 90%; height: auto; display: block; margin: 20px auto;" />` : s.coloringSvg}</div>
              <p>${s.text}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    triggerDownload(`${story.title.replace(/\s+/g, '_')}_colorir.html`, 'text/html', coloringHtml);
  };

  const handleDownloadFakeMedia = (story: Story, ext: 'mp4' | 'mp3') => {
    alert(`O arquivo ${story.title.replace(/\s+/g, '_')}.${ext} está sendo empacotado para download. O processo leva apenas alguns segundos!`);
  };

  // Generate a mock Asaas Receipt PDF/HTML
  const handleDownloadInvoice = (id: string, date: string, amount: number) => {
    const invoiceHtml = `
      <html>
        <head>
          <title>Recibo Asaas - ${id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
            .title { font-size: 32px; font-weight: bold; color: #00C8FF; }
            .details { margin-top: 20px; margin-bottom: 40px; }
            .table { width: 100%; text-align: left; border-collapse: collapse; }
            .table th { background: #f8f9fa; padding: 12px; border-bottom: 2px solid #dee2e6; }
            .table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="invoice-box">
            <table width="100%">
              <tr>
                <td class="title">ToonTales AI</td>
                <td align="right">
                  <strong>Recibo de Transação</strong><br>
                  Fatura: ${id}<br>
                  Data: ${date}
                </td>
              </tr>
            </table>
            <hr>
            <div class="details">
              <table width="100%">
                <tr>
                  <td>
                    <strong>Emissor:</strong><br>
                    ToonTales AI Studios S.A.<br>
                    São Paulo - SP
                  </td>
                  <td align="right">
                    <strong>Cliente:</strong><br>
                    Assinante ToonTales<br>
                    Faturamento via Gateway Asaas
                  </td>
                </tr>
              </table>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Ciclo</th>
                  <th align="right">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Assinatura de Estúdio de Criação de Histórias (Plano ${subscription.planType.toUpperCase()})</td>
                  <td>${subscription.billingCycle}</td>
                  <td align="right">R$ ${amount.toFixed(2)}</td>
                </tr>
                <tr class="total">
                  <td colspan="2" align="right">Total Pago:</td>
                  <td align="right">R$ ${amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              <p>Pagamento processado com sucesso pelo gateway de pagamentos <strong>Asaas S.A.</strong></p>
              <p>Obrigado pela preferência!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    triggerDownload(`fatura_asaas_${id}.html`, 'text/html', invoiceHtml);
  };

  const getPlanTitle = () => {
    if (subscription.planType === 'free') return 'Gratuito / Teste';
    if (subscription.planType === 'hero') return 'Plano Inicial';
    if (subscription.planType === 'legendary') return 'Estúdio Criador';
    return 'Plano Profissional';
  };

  const usagePercent = Math.min(100, (storiesCreated / limits.maxStoriesPerMonth) * 100);

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-8">
      {/* Overview stats header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between flex-wrap gap-6">
        <div>
          <h2 className="text-3xl font-extrabold">Painel de Controle dos Pais & Educadores</h2>
          <p className="opacity-90 text-sm mt-1">Gerencie, baixe materiais pedagógicos e acompanhe as histórias criadas para as crianças.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm text-center">
            <span className="block text-2xl font-bold">{stories.length}</span>
            <span className="text-xs opacity-75">Histórias Ativas</span>
          </div>
          <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm text-center">
            <span className="block text-2xl font-bold">
              {stories.reduce((acc, s) => acc + s.scenes.length, 0)}
            </span>
            <span className="text-xs opacity-75">Cenas Totais</span>
          </div>
        </div>
      </div>

      {/* Subscription & Billing Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Sub Card Left */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-extrabold uppercase tracking-wider">
              Assinatura & Faturamento (Asaas)
            </span>
            <div className="flex items-center gap-3 mt-3">
              <h3 className="text-2xl font-black text-slate-800 font-serif">
                {getPlanTitle()}
              </h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                subscription.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {subscription.status === 'active' ? 'Ativo (Pago)' : 'Uso Livre'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Faturado via Pix/Cartão pela sua conta integrada com o <strong>Asaas</strong>.
            </p>
          </div>

          {/* Usage Limit Tracker */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/60">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
              <span>Limite de Geração de Livros</span>
              <span>{storiesCreated} de {limits.maxStoriesPerMonth} Livros</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" 
                style={{ width: `${usagePercent}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">
              Seu plano renova em: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {subscription.planType === 'free' ? (
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => onSelectPlan('hero', 'mensal')}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-450 to-amber-550 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  🚀 Assinar Inicial (R$ 49/mês)
                </button>
                <button 
                  onClick={() => onSelectPlan('legendary', 'mensal')}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#6A3DF0] to-[#00C8FF] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  ⭐ Assinar Criador (R$ 249/mês)
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onCancelSubscription}
                  className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all"
                >
                  Cancelar Assinatura
                </button>
                <button
                  onClick={onDowngradeToFree}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all"
                >
                  Retornar ao Plano Gratuito
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub Card Right (Billing statements history) */}
        <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Histórico de Cobrança</h4>
          {subscription.planType === 'free' ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Sem faturamento ativo.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Fatura #ASA-{Math.floor(Math.random() * 90000 + 10000)}</span>
                  <span className="text-[10px] text-slate-400">{new Date(subscription.currentPeriodStart).toLocaleDateString()} • Pix Asaas</span>
                </div>
                <button 
                  onClick={() => handleDownloadInvoice("ASA-82741", new Date(subscription.currentPeriodStart).toLocaleDateString(), subscription.planType === 'hero' ? (subscription.billingCycle === 'mensal' ? 49 : 39) : (subscription.billingCycle === 'mensal' ? 249 : 199))}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200"
                >
                  Recibo 📄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center p-12 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-md">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-bold text-slate-700">Nenhuma história gerada ainda</h3>
          <p className="text-slate-500 text-sm mt-1">Crie sua primeira história no painel principal para liberar os downloads pedagógicos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <h3 className="text-2xl font-extrabold text-slate-800">Materiais Didáticos & Downloads</h3>
          
          <div className="grid grid-cols-1 gap-6">
            {stories.map((story) => (
              <div 
                key={story.id} 
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-100 shadow-md flex items-center justify-between flex-wrap gap-6 hover:shadow-lg transition-all"
              >
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      story.theme === 'Bíblico' ? 'bg-emerald-50 text-emerald-600' :
                      story.theme === 'Aventura' ? 'bg-amber-50 text-amber-600' :
                      'bg-sky-50 text-sky-600'
                    }`}>
                      {story.theme}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Faixa etária: {story.ageGroup} anos
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mt-2 hover:text-amber-500 cursor-pointer" onClick={() => onSelectStory(story)}>
                    {story.title}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">Criada em: {story.createdAt.toLocaleDateString()}</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {/* Download PDF Livro */}
                  <button 
                    onClick={() => handleDownloadPDFBook(story)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Livro Impresso (HTML/PDF)
                  </button>

                  {/* Download PDF Colorir */}
                  <button 
                    onClick={() => handleDownloadPDFColoring(story)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Páginas de Colorir (HTML/PDF)
                  </button>

                  {/* Download MP4 Vídeo */}
                  <button 
                    onClick={() => handleDownloadFakeMedia(story, 'mp4')}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Vídeo Animado (MP4)
                  </button>

                  {/* Download MP3 Audiobook */}
                  <button 
                    onClick={() => handleDownloadFakeMedia(story, 'mp3')}
                    className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Áudio Livro (MP3)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
