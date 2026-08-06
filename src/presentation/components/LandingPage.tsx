import React, { useState } from 'react';
import { PlanType } from '../../domain/Subscription';

interface LandingPageProps {
  onEnterStudio: () => void;
  onSelectPlan: (planType: PlanType, billingCycle: 'mensal' | 'anual') => void;
  onBuySingleStory: (childName: string, theme: string, ageGroup: string, childPhoto: string | null) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterStudio, onSelectPlan, onBuySingleStory }) => {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');

  // Prices based on cycle (20% off for annual billing)
  const prices = {
    hero: billingCycle === 'mensal' ? 49 : 39,
    professional: billingCycle === 'mensal' ? 119 : 95,
    legendary: billingCycle === 'mensal' ? 249 : 199
  };

  // Simulator States
  const [childName, setChildName] = useState('');
  const [adultName, setAdultName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('Aventura');
  const [selectedStyle, setSelectedStyle] = useState('Animação Encantadora');
  const [selectedAge, setSelectedAge] = useState('2-6');
  const [storyDetails, setStoryDetails] = useState('');
  const [simulatedPhoto, setSimulatedPhoto] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [previewStory, setPreviewStory] = useState<{ title: string; sceneText: string; theme: string } | null>(null);

  const simulationMessages = [
    'Esboçando roteiro personalizado com IA...',
    'Gerando traços de arte lúdica...',
    'Montando capa do livro...',
    'Preparando sua prévia exclusiva!'
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSimulatedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const activeName = childName.trim() || adultName.trim();
    if (!activeName) return;

    setIsSimulating(true);
    setSimulationStep(0);
    setPreviewStory(null);

    const interval = setInterval(() => {
      setSimulationStep(prev => {
        if (prev < simulationMessages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
      
      // Generate simulated story details
      const activeName = childName.trim() || adultName.trim();
      let title = '';
      let sceneText = '';
      if (selectedTheme === 'Bíblico') {
        title = `${activeName} e a Arca da Amizade`;
        sceneText = `Noé chamou ${activeName} para ajudar a arrumar os animais na grande arca de madeira. Com muita alegria e obediência, eles viram o arco-íris brilhar no céu trazendo paz.`;
      } else if (selectedTheme === 'Educativo') {
        title = `${activeName} e o Mistério dos Planetas`;
        sceneText = `Com um capacete de astronauta brilhante, ${activeName} voou até a Lua para descobrir por que as estrelas piscavam no céu à noite. Aprendendo a economizar energia e cuidar da Terra!`;
      } else if (selectedTheme === 'Livre') {
        title = adultName ? `Homenagem Especial para ${adultName}` : `Homenagem Especial para o Papai`;
        sceneText = `Para o melhor homenageado do mundo: obrigado por me ensinar, apoiar e estar sempre ao meu lado. Com todo o meu amor e carinho, de seu eterno admirador ${activeName}!`;
      } else {
        title = `${activeName} e a Floresta dos Doces`;
        sceneText = `Caminhando por uma estrada de marshmallow, ${activeName} encontrou um coelhinho azul que precisava de ajuda para encontrar sua cenoura de chocolate perdida.`;
      }

      setPreviewStory({
        title,
        sceneText,
        theme: selectedTheme
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4F8] via-white to-[#F0F4F8] text-slate-800 antialiased overflow-x-hidden">
      {/* Premium Hero Section */}
      <section className="relative pt-24 pb-20 px-6 md:px-12 text-center max-w-6xl mx-auto flex flex-col items-center">
        {/* Decorative Floating Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow delay-75" />

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 border border-amber-200 rounded-full text-amber-700 text-xs font-black uppercase tracking-wider mb-6 animate-bounce-slow">
          <span>🌟</span> Criador de Histórias Infantis com IA
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight font-serif max-w-4xl">
          Transforme seu filho no <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Herói Principal</span> de histórias edificantes!
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
          Crie livros ilustrados, vídeos animados no estilo Cartoon Lúdico, áudio-livros e páginas de colorir personalizadas usando inteligência artificial de alta qualidade.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
          <button
            onClick={onEnterStudio}
            className="px-8 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3"
          >
            <span>✨</span> Entrar no Estúdio de Criação
          </button>
          <a
            href="#simulador"
            className="px-8 py-5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-lg rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center"
          >
            Simulador ao Vivo 🔮
          </a>
        </div>

        {/* Interactive Stats Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-lg">
          <div className="text-center">
            <h4 className="text-3xl font-black text-amber-600">3 Eixos</h4>
            <p className="text-xs font-bold text-slate-500 mt-1">Bíblico, Aventuras e Educação</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <h4 className="text-3xl font-black text-sky-600">Fácil</h4>
            <p className="text-xs font-bold text-slate-500 mt-1">Gere com 3 cliques</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <h4 className="text-3xl font-black text-emerald-600">Confiança</h4>
            <p className="text-xs font-bold text-slate-500 mt-1">Faturamento Asaas Seguro</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <h4 className="text-3xl font-black text-purple-600">Multimídia</h4>
            <p className="text-xs font-bold text-slate-500 mt-1">Vídeo, Áudio, Livro e Colorir</p>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="simulador" className="py-20 bg-slate-900 text-white px-6 md:px-12 relative overflow-hidden border-y border-slate-950">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-xs font-extrabold tracking-widest text-[#00C8FF] uppercase bg-[#00C8FF]/10 px-4 py-1.5 rounded-full border border-[#00C8FF]/20">
            Simulador de Estúdio
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-serif mt-4">Simulador do Estúdio de Criação</h2>
          <p className="text-slate-400 text-xs mt-2 font-semibold">Preencha os dados abaixo e veja a tecnologia do ToonTales AI acontecendo em tempo real.</p>

          {/* Simulator Box */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 p-8 md:p-10 shadow-2xl mt-12 max-w-2xl mx-auto text-left">
            {!previewStory && !isSimulating ? (
              <form onSubmit={handleSimulate} className="flex flex-col gap-6">
                
                {/* Photo Upload area (mockup matching) */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center bg-[#D97706]/10 border border-[#D97706]/20 px-4 py-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#F59E0B] tracking-wider block">Criador com Foto do Herói</span>
                      <span className="text-[9px] text-slate-400 font-semibold block">Transforme seu filho no herói principal das histórias!</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded-md uppercase border border-amber-500/25">Novo Recurso IA</span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 relative border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/40">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-xl">☁️</span>
                        <span className="text-[10px] font-bold text-slate-350">Clique para enviar a foto da criança ou arraste até aqui</span>
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">formatos: JPG, PNG (OPCIONAL NO SIMULADOR)</span>
                      </div>
                    </div>
                    {simulatedPhoto && (
                      <div className="relative w-16 h-16 rounded-xl border border-amber-500 overflow-hidden shadow-md group flex-shrink-0">
                        <img src={simulatedPhoto} alt="Criança" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setSimulatedPhoto(null); setAcceptedTerms(false); }}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-black transition-all"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms of responsibility */}
                {simulatedPhoto && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex gap-3 items-start">
                    <input 
                      type="checkbox" 
                      id="sim-terms" 
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 accent-amber-500 rounded cursor-pointer"
                    />
                    <label htmlFor="sim-terms" className="text-[10px] text-slate-400 font-semibold leading-relaxed cursor-pointer select-none">
                      Eu declaro ser o responsável legal pela criança e **autorizo o processamento seguro desta imagem** para personalização de ilustrações do ToonTales AI, aceitando os termos de responsabilidade de imagem de boa fé (LGPD).
                    </label>
                  </div>
                )}

                {/* Row 1: Protagonist Name & Faixa Etária */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">
                      Nome da Criança / Protagonista
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Lucas"
                      required={!adultName.trim()}
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-slate-200 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">Faixa Etária (Regra de Cenas)</label>
                    <select 
                      value={selectedAge} 
                      onChange={(e) => setSelectedAge(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-slate-250 text-xs font-bold"
                    >
                      <option value="2-6">👶 5 a 7 anos (8 Cenas • Descobertas)</option>
                      <option value="7-12">👦 7 a 12 anos (12 Cenas)</option>
                      <option value="adulto">👨 14+ anos / Adultos (16 Cenas • Homenagens)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Theme & Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">Eixo Temático ou Ocasião</label>
                    <select 
                      value={selectedTheme} 
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-slate-250 text-xs font-bold"
                    >
                      <option value="Aventura">Aventura & Descobertas</option>
                      <option value="Bíblico">📖 Bíblico (A Arca / Davi / Daniel)</option>
                      <option value="Educativo">🎓 Educação & Ciências</option>
                      <option value="Livre">✨ História Livre & Memórias da Família</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">Estilo de Arte</label>
                    <select 
                      value={selectedStyle} 
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-slate-250 text-xs font-bold"
                    >
                      <option value="Animação Encantadora">🎨 Cartoon Lúdico 3D</option>
                      <option value="Aquarela Artistica">🖌️ Aquarela Artística</option>
                      <option value="Cartoon Retro">🖍️ Desenho Cartoon Lúdico</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Adult Name & Optional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">
                      Nome do Adulto / Homenageado (Opcional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Papai Carlos / Professora Ana / Vovô João"
                      value={adultName}
                      onChange={(e) => setAdultName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-slate-200 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2">Detalhes ou Tema da História (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Homenagem especial de Dia dos Pais / Aniversário de..."
                      value={storyDetails}
                      onChange={(e) => setStoryDetails(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-slate-200 text-sm font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={simulatedPhoto !== null && !acceptedTerms}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-101 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse-slow"
                >
                  {simulatedPhoto ? '📸 Gerar História Personalizada por Foto' : '⚡ Gerar Prévia de História Agora'}
                </button>
              </form>
            ) : isSimulating ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <h4 className="text-lg font-bold mt-2">Criando livro...</h4>
                <p className="text-amber-500 font-semibold text-xs animate-pulse">
                  {simulationMessages[simulationStep]}
                </p>
              </div>
            ) : (
              /* Preview Rendered */
              <div className="flex flex-col gap-6">
                <div className="border-b border-slate-700/50 pb-4 flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
                    ✨ Prévia Pronta para {childName}
                  </span>
                  <button 
                    onClick={() => { setPreviewStory(null); setSimulatedPhoto(null); setAcceptedTerms(false); }} 
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ← Reiniciar
                  </button>
                </div>

                <div>
                  <h4 className="text-xl font-black text-amber-500 font-serif">"{previewStory?.title}"</h4>
                  <div className="mt-4 p-5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-350 text-sm leading-relaxed font-medium font-serif italic">
                    {previewStory?.sceneText}
                  </div>
                </div>

                {/* Locked indicators */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-[11px] text-slate-400 font-semibold flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    🔒 Livro Ilustrado Completo ({selectedAge === '2-6' ? '8' : selectedAge === '7-12' ? '12' : '16'} Cenas)
                  </div>
                  <div className="flex items-center gap-2">🔒 Vídeo Animado com Movimento Cinemático</div>
                  <div className="flex items-center gap-2">🔒 Áudio Livro Narrado por Voz Humana</div>
                  <div className="flex items-center gap-2">🔒 Páginas de Colorir e Giz de Cera Interativos</div>
                </div>

                {/* Paywall Upsell Button */}
                <button
                  onClick={() => onBuySingleStory(childName + (adultName ? ` e ${adultName}` : ''), selectedTheme, selectedAge, simulatedPhoto)}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-xl shadow-lg transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span className="text-sm font-extrabold">Liberar História Completa + PDF 🚀</span>
                  <span className="text-[10px] font-semibold opacity-90">R$ {selectedAge === 'adulto' ? '59,00' : (selectedTheme === 'Livre' ? '39,00' : '19,90')} no Pix avulso ou assinatura</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-slate-50 px-6 md:px-12 border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Recursos Inclusos</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-serif mt-2">Uma Caixa de Ferramentas Completa</h2>
            <p className="text-slate-500 text-sm mt-3">Tudo o que pais e educadores precisam para estimular a criatividade infantil de forma totalmente segura.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📚</div>
              <h3 className="text-lg font-bold text-slate-800">Livros Ilustrados</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Histórias completas com ilustrações exclusivas geradas por inteligência artificial para ler no computador, tablet ou baixar em alta definição.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl">🎨</div>
              <h3 className="text-lg font-bold text-slate-800">Páginas de Colorir</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Desenhos em linhas vetorizadas baseados em cenas das próprias histórias para imprimir e colorir fisicamente no papel, estimulando a coordenação.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">🎬</div>
              <h3 className="text-lg font-bold text-slate-800">Vídeos Cinemáticos</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Transforme as páginas geradas em pequenas animações com narração por IA em áudio imersivo, ideal para assistir em família.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plan section */}
      <section id="planos" className="py-24 bg-[#08142D] text-white px-6 md:px-12 border-t border-slate-900 relative overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-sky-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="text-xs font-extrabold tracking-widest text-[#00C8FF] uppercase bg-[#00C8FF]/10 px-4 py-1.5 rounded-full border border-[#00C8FF]/20">
            Preços Especiais
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-serif mt-6 bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
            Valores Justos para Toda a Família
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Sem fidelidade ou contratos longos. Cancele e altere quando quiser.
          </p>

          {/* Toggle Billing Cycle */}
          <div className="mt-10 flex items-center justify-center gap-4 bg-slate-900/60 border border-slate-800 rounded-full p-1 max-w-[320px] mx-auto">
            <button
              onClick={() => setBillingCycle('mensal')}
              className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                billingCycle === 'mensal' ? 'bg-[#00C8FF] text-slate-950 shadow-md shadow-[#00C8FF]/15' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                billingCycle === 'anual' ? 'bg-[#00C8FF] text-slate-950 shadow-md shadow-[#00C8FF]/15' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                -20%
              </span>
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Plan 1: Hero */}
            <div className="bg-[#0D1E3D]/80 backdrop-blur-sm border border-slate-800/80 hover:border-slate-650 rounded-[2.5rem] p-8 text-left flex flex-col justify-between hover:shadow-[0_0_30px_rgba(106,61,240,0.15)] transition-all duration-300 hover:-translate-y-2 group">
              <div>
                <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">Plano Inicial</h3>
                <p className="text-slate-455 text-xs mt-1">Excelente para experimentar histórias em família.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-[#00C8FF]">R$ {prices.hero}</span>
                  <span className="text-slate-400 text-xs font-bold block">/mês</span>
                  {billingCycle === 'anual' && (
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">Cobrado Anualmente (R$ 468/ano)</span>
                  )}
                </div>
                <ul className="text-slate-355 text-xs font-medium space-y-3.5 border-t border-slate-800/60 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> 15 histórias ilustradas por mês
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> 3 vídeos de 4 minutos por mês
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> Estúdio de Pintura e Giz de Cera
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> Narração em Áudio Livro
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> PDF para Impressão
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectPlan('hero', billingCycle)}
                className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-sm rounded-2xl border border-slate-700/60 hover:border-[#00C8FF]/30 transition-all cursor-pointer"
              >
                Começar Agora
              </button>
            </div>

            {/* Plan 2: Legendary (Featured) */}
            <div className="bg-[#121B35] border-2 border-amber-500 rounded-[2.5rem] p-8 text-left flex flex-col justify-between shadow-[0_15px_40px_rgba(245,158,11,0.15)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-2 relative group">
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-400 shadow-md">
                Mais Vendido ⭐
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Criador / Estúdio</h3>
                <p className="text-slate-400 text-xs mt-1">Acesso a todos os recursos e limite estendido.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-amber-400">R$ {prices.legendary}</span>
                  <span className="text-slate-400 text-xs font-bold block">/mês</span>
                  {billingCycle === 'anual' && (
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">Cobrado Anualmente (R$ 2.388/ano)</span>
                  )}
                </div>
                <ul className="text-slate-300 text-xs font-medium space-y-3.5 border-t border-slate-800 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-400">✓</span> <strong>150 histórias ilustradas</strong> por mês
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-400">✓</span> Vídeos em Alta Definição
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-400">✓</span> Estúdio de Pintura Completo
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-400">✓</span> Exportação Ilimitada em PDF
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-400">✓</span> Narração em Áudio Ilimitada
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectPlan('legendary', billingCycle)}
                className="w-full py-4 mt-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/10 hover:scale-102 transition-all cursor-pointer"
              >
                Assinar Plano Completo
              </button>
            </div>

            {/* Plan 3: Professional */}
            <div className="bg-[#0D1E3D]/80 backdrop-blur-sm border border-slate-800/80 hover:border-slate-650 rounded-[2.5rem] p-8 text-left flex flex-col justify-between hover:shadow-[0_0_30px_rgba(106,61,240,0.15)] transition-all duration-300 hover:-translate-y-2 group">
              <div>
                <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">Plano Escola / Profissional</h3>
                <p className="text-slate-455 text-xs mt-1">Ideal para professores e pequenos estúdios.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-[#00C8FF]">R$ {prices.professional}</span>
                  <span className="text-slate-400 text-xs font-bold block">/mês</span>
                  {billingCycle === 'anual' && (
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">Cobrado Anualmente (R$ 1.140/ano)</span>
                  )}
                </div>
                <ul className="text-slate-355 text-xs font-medium space-y-3.5 border-t border-slate-800/60 pt-6">
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> 50 histórias ilustradas por mês
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> 15 vídeos animados por mês
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> Narração em áudio profissional
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✓</span> Acesso completo aos painéis
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectPlan('professional', billingCycle)}
                className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-sm rounded-2xl border border-slate-700/60 hover:border-[#00C8FF]/30 transition-all cursor-pointer"
              >
                Assinar Profissional
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-950 text-center text-slate-500 text-xs">
        <p>© 2026 ToonTales AI Inc. Todos os direitos reservados. Faturamento operado com segurança por Asaas S.A.</p>
      </footer>
    </div>
  );
};
