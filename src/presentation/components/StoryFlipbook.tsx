import React, { useState, useEffect } from 'react';
import { StoryScene } from '../../domain/Story';

interface StoryFlipbookProps {
  scenes: StoryScene[];
  storyTitle: string;
  moralLesson?: string;
  bibleReference?: string;
  generatingPages?: Record<number, boolean>;
  onPageChange?: (pageIndex: number) => void;
}

export const StoryFlipbook: React.FC<StoryFlipbookProps> = ({ scenes, storyTitle, moralLesson, bibleReference, onPageChange }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const currentScene = scenes[currentPageIndex];

  // BUGFIX: avisa o componente pai (StoryViewer) qual página está visível.
  // Sem isso, o carregamento lazy de imagens nunca é disparado ao virar
  // páginas no modo Livro, deixando cenas em branco permanentemente.
  useEffect(() => {
    onPageChange?.(currentPageIndex);
  }, [currentPageIndex, onPageChange]);

  // Stop speech synthesis if page changes or component unmounts
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsPlayingNarration(false);
  }, [currentPageIndex]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert("A narração por voz não é suportada neste navegador.");
      return;
    }

    if (isPlayingNarration) {
      window.speechSynthesis.cancel();
      setIsPlayingNarration(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentScene.text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85; // slightly slower for children
    
    // Find a nice Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => {
      setIsPlayingNarration(false);
    };

    utterance.onerror = () => {
      setIsPlayingNarration(false);
    };

    setIsPlayingNarration(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < scenes.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 p-4">
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{storyTitle}</h3>
          <p className="text-sm text-slate-500">Cena {currentPageIndex + 1} de {scenes.length}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSpeak}
            className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md ${
              isPlayingNarration 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {isPlayingNarration ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Parar Narração
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .9-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Ouvir História
              </>
            )}
          </button>
        </div>
      </div>

      {/* Flipbook Layout (Double-Page Book) */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-amber-50/40 rounded-[2.5rem] overflow-hidden border-4 border-amber-900/10 shadow-2xl min-h-[480px]">
        {/* Left Page: Illustration */}
        <div className="bg-white p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-amber-900/10 relative">
          {currentScene.illustrationUrl ? (
            <img 
              src={currentScene.illustrationUrl} 
              alt={`Ilustração ${currentScene.pageNumber}`}
              className="w-full aspect-[4/3] max-w-md bg-slate-50 rounded-2xl overflow-hidden shadow-md object-cover"
            />
          ) : (
            <div 
              className="w-full aspect-[4/3] max-w-md bg-slate-50 rounded-2xl overflow-hidden shadow-md"
              dangerouslySetInnerHTML={{ __html: currentScene.illustrationSvg }}
            />
          )}
          {/* Page fold effect */}
          <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Right Page: Story Text */}
        <div className="bg-white p-12 flex flex-col justify-between relative">
          {/* Page fold effect */}
          <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none hidden md:block" />
          
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed text-center font-serif px-4">
              {currentScene.text}
            </p>
          </div>

          <div className="text-slate-400 font-mono text-center text-sm mt-8">
            - {currentScene.pageNumber} -
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-6 mt-2">
        <button
          onClick={handlePrev}
          disabled={currentPageIndex === 0}
          className="w-14 h-14 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-x-1"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-slate-600 font-bold text-lg">
          Página {currentPageIndex + 1} de {scenes.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPageIndex === scenes.length - 1}
          className="w-14 h-14 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-x-1"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Moral Lesson / Bible Reference Callout Card */}
      {currentPageIndex === scenes.length - 1 && (moralLesson || bibleReference) && (
        <div className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-dashed border-amber-400/30 rounded-3xl p-6 shadow-inner text-center max-w-3xl mx-auto animate-pulse-slow">
          {bibleReference && (
            <span className="inline-block px-4 py-1.5 bg-amber-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              📖 Onde está escrito: {bibleReference}
            </span>
          )}
          {moralLesson && (
            <p className="text-slate-700 font-extrabold text-lg leading-relaxed font-serif">
              {moralLesson}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
