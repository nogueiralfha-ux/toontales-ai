import React, { useState, useEffect } from 'react';
import { StoryTheme, AgeGroup } from '../../domain/Story';

interface StoryCreatorProps {
  onGenerate: (theme: StoryTheme, ageGroup: AgeGroup, prompt: string, childPhoto: string | null, parentPhoto: string | null, videoDuration?: 'curto' | 'medio' | 'longo') => Promise<void>;
}

export const StoryCreator: React.FC<StoryCreatorProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState<StoryTheme>('Aventura');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('2-6');
  const [childPhoto, setChildPhoto] = useState<string | null>(null);
  const [parentPhoto, setParentPhoto] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [adultName, setAdultName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [videoDuration, setVideoDuration] = useState<'curto' | 'medio' | 'longo'>('curto');

  const loadingMessages = [
    'Escrevendo o roteiro da história...',
    'Desenhando os cenários no estilo Cartoon Lúdico...',
    'Personalizando os personagens de acordo com a faixa etária...',
    'Adicionando os contornos para o livro de colorir...',
    'Gravando a narração do áudio livro...',
    'Prontinho! Sua história edificante foi criada!'
  ];

  // Load pending photo from simulator if user purchased a credit
  useEffect(() => {
    try {
      const pendingPhoto = localStorage.getItem('toontales_pending_photo');
      if (pendingPhoto) {
        setChildPhoto(pendingPhoto);
        setAcceptedTerms(true); // Term accepted in simulator already
        localStorage.removeItem('toontales_pending_photo');
      }
    } catch (e) {
      console.warn("Erro ao carregar foto pendente do simulador:", e);
    }
  }, []);

  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Erro ao carregar a imagem."));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'child' | 'parent') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        if (type === 'child') {
          setChildPhoto(compressed);
        } else {
          setParentPhoto(compressed);
        }
      } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'child') {
            setChildPhoto(event.target?.result as string);
          } else {
            setParentPhoto(event.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setLoadingStep(0);

    // Simulate stepping through the generation process
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    let finalPrompt = prompt;
    if (childName.trim()) {
      finalPrompt = `[Nome da Criança/Herói: ${childName}] ${finalPrompt}`;
    }
    if (adultName.trim()) {
      finalPrompt = `[Nome do Adulto: ${adultName}] ${finalPrompt}`;
    }

    try {
      await onGenerate(theme, ageGroup, finalPrompt, childPhoto, parentPhoto, videoDuration);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl max-w-xl mx-auto text-center min-h-[400px]">
        <div className="relative w-28 h-28 mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-4 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">Criando sua História...</h3>
        <p className="text-amber-400 font-semibold mb-6 h-8 animate-bounce transition-all duration-300">
          {loadingMessages[loadingStep]}
        </p>

        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden max-w-sm border border-slate-800/80">
          <div 
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/80 shadow-2xl">
      <div className="text-center mb-8">
        <span className="text-amber-400 font-bold tracking-wider text-[10px] uppercase px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">Gerador Inteligente</span>
        <h2 className="text-3xl font-extrabold text-white mt-2 font-serif">Crie sua História</h2>
        <p className="text-slate-400 text-sm mt-1">Dê asas à imaginação do seu pequeno com histórias personalizadas e interativas.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Names Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome da Criança / Protagonista</label>
            <input 
              type="text" 
              placeholder="Ex: Lucas"
              required={!adultName.trim()}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-200 text-sm font-semibold placeholder-slate-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Adulto / Homenageado (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ex: Papai Carlos"
              value={adultName}
              onChange={(e) => setAdultName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-200 text-sm font-semibold placeholder-slate-500"
            />
          </div>
        </div>

        {/* Prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Qual será a ideia da história?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={theme === 'Livre' ? "Ex: Escreva uma homenagem de Dia dos Pais para o papai Carlos, agradecendo por ele me ensinar a pescar e jogar futebol..." : "Ex: Lili a coelhinha quer encontrar uma árvore de ouro brilhante para plantar flores no vale de esmeralda..."}
            required
            rows={3}
            className="w-full p-4 border border-slate-800 bg-slate-950/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-200 placeholder-slate-500 shadow-inner resize-none font-semibold text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Theme */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tema principal</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {(['Bíblico', 'Aventura', 'Educativo', 'Livre'] as StoryTheme[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`py-3.5 px-2 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                    theme === t 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-102' 
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Idade / Faixa Etária</label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAgeGroup('2-6')}
                className={`py-3.5 px-2 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                  ageGroup === '2-6' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] scale-102' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                3-6 anos <span className="block text-[10px] font-normal opacity-90">(8 Cenas)</span>
              </button>
              <button
                type="button"
                onClick={() => setAgeGroup('7-12')}
                className={`py-3.5 px-2 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                  ageGroup === '7-12' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] scale-102' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                7-12 anos <span className="block text-[10px] font-normal opacity-90">(12 Cenas)</span>
              </button>
              <button
                type="button"
                onClick={() => setAgeGroup('adulto')}
                className={`py-3.5 px-2 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
                  ageGroup === 'adulto' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] scale-102' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                Adulto / Homenagem <span className="block text-[10px] font-normal opacity-90">(16 Cenas)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Photo Upload (Character Personalization) */}
        <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-6">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Personalizar Personagens com Foto (Opcional)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Child Photo */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">1. Foto do Herói / Criança</span>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative border-2 border-dashed border-slate-800 hover:border-amber-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-950/40">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoUpload(e, 'child')} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-450 font-bold">Selecionar Foto</span>
                </div>
                {childPhoto && (
                  <div className="relative w-14 h-14 rounded-2xl border border-amber-500 overflow-hidden shadow-lg group flex-shrink-0">
                    <img src={childPhoto} alt="Criança" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setChildPhoto(null); setAcceptedTerms(false); }}
                      className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-black transition-all"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Parent Photo */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">2. Foto do Adulto / Acompanhante</span>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative border-2 border-dashed border-slate-800 hover:border-amber-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-950/40">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoUpload(e, 'parent')} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-450 font-bold">Selecionar Foto</span>
                </div>
                {parentPhoto && (
                  <div className="relative w-14 h-14 rounded-2xl border border-amber-500 overflow-hidden shadow-lg group flex-shrink-0">
                    <img src={parentPhoto} alt="Acompanhante" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setParentPhoto(null); setAcceptedTerms(false); }}
                      className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-black transition-all"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Duração do Vídeo Animado */}
          <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              🎬 Escolha a Duração do Vídeo Animado
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setVideoDuration('curto')}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  videoDuration === 'curto'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-102'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <span>Curto (Até 4 min)</span>
                <span className="text-[9px] font-normal opacity-80">Incluso no Plano</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoDuration('medio')}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  videoDuration === 'medio'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-102'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <span>Médio (5 a 7 min)</span>
                <span className="text-[9px] font-bold text-amber-500">+ R$ 59,00 avulso</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoDuration('longo')}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  videoDuration === 'longo'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-102'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <span>Longo (8 a 10 min)</span>
                <span className="text-[9px] font-bold text-amber-500">+ R$ 79,00 avulso</span>
              </button>
            </div>
          </div>

          {/* Responsibility terms */}
          {(childPhoto || parentPhoto) && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl flex gap-3 items-start">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-[10px] text-slate-400 font-semibold leading-relaxed cursor-pointer select-none">
                Eu declaro que possuo os direitos de imagem da criança e/ou adulto enviado e **autorizo expressamente** o processamento desta imagem para fins de personalização das ilustrações, aceitando integralmente o <strong className="text-amber-500">Termo de Responsabilidade e Uso de Imagem (LGPD)</strong> para evitar qualquer uso indevido ou de má fé.
              </label>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={(childPhoto !== null || parentPhoto !== null) && !acceptedTerms}
          className="mt-4 py-4.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg rounded-2xl transition-all transform hover:-translate-y-0.5 shadow-lg active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🚀</span> Criar História Inspiradora
        </button>
      </form>
    </div>
  );
};
