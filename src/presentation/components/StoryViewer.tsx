import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../../domain/Story';
import { StoryFlipbook } from './StoryFlipbook';
import { ColoringCanvas } from './ColoringCanvas';

interface StoryViewerProps {
  story: Story;
  onBack: () => void;
}

type TabType = 'video' | 'book' | 'coloring' | 'audio';

export const StoryViewer: React.FC<StoryViewerProps> = ({ story, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [currentVideoScene, setCurrentVideoScene] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState<number>(1);

  // Audio Book state
  const [audioTimer, setAudioTimer] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [waveSeed, setWaveSeed] = useState<number[]>([]);
  const [currentAudioScene, setCurrentAudioScene] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize random height multipliers for audio wave
  useEffect(() => {
    setWaveSeed(Array.from({ length: 26 }).map(() => Math.random() * 0.8 + 0.2));
  }, []);

  // Native Audio player controller
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isAudioPlaying) {
      audio.play().catch(e => console.warn("Erro ao iniciar áudio:", e));
    } else {
      audio.pause();
    }
  }, [isAudioPlaying, currentAudioScene]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = audioSpeed;
  }, [audioSpeed]);

  // Video Autoplay Narration Simulation with Speed Controls
  useEffect(() => {
    let timeout: any;
    let fallbackTimeout: any;
    
    if (activeTab === 'video' && isVideoPlaying) {
      const currentScene = story.scenes[currentVideoScene];
      
      window.speechSynthesis?.cancel();

      const utterance = new SpeechSynthesisUtterance(currentScene.text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.85 * videoSpeed;
      utterance.pitch = 1.05; // Slightly child-friendly high pitch

      const advanceScene = () => {
        timeout = setTimeout(() => {
          if (currentVideoScene < story.scenes.length - 1) {
            setCurrentVideoScene(prev => prev + 1);
          } else {
            setIsVideoPlaying(false);
            setCurrentVideoScene(0);
          }
        }, 1500 / videoSpeed);
      };

      utterance.onend = () => {
        clearTimeout(fallbackTimeout);
        advanceScene();
      };
      
      utterance.onerror = () => {
        clearTimeout(fallbackTimeout);
        advanceScene();
      };

      window.speechSynthesis?.speak(utterance);

      // Fallback timer in case speechSynthesis gets stuck or is blocked by browser policies
      const wordsCount = currentScene.text.split(/\s+/).length;
      const estimatedMs = Math.max(3000, (wordsCount * 450 + 2500) / videoSpeed);
      fallbackTimeout = setTimeout(() => {
        console.warn("[StoryViewer] SpeechSynthesis onend did not fire. Advancing scene via fallback timer.");
        advanceScene();
      }, estimatedMs);

    } else {
      window.speechSynthesis?.cancel();
    }

    return () => {
      window.speechSynthesis?.cancel();
      clearTimeout(timeout);
      clearTimeout(fallbackTimeout);
    };
  }, [activeTab, isVideoPlaying, currentVideoScene, story.scenes, videoSpeed]);

  // Audio Book simulation timer reacting to speeds (only if no real audioUrl)
  useEffect(() => {
    if (story.audioUrl) return;
    let interval: any;
    const totalDuration = story.scenes.length * 6; // 6s per page baseline

    if (activeTab === 'audio' && isAudioPlaying) {
      interval = setInterval(() => {
        setAudioTimer(prev => {
          const next = prev + 1 * audioSpeed;
          if (next < totalDuration) {
            return next;
          }
          setIsAudioPlaying(false);
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, isAudioPlaying, story.scenes, audioSpeed, story.audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNextScene = () => {
    if (currentVideoScene < story.scenes.length - 1) {
      setCurrentVideoScene(prev => prev + 1);
    } else {
      setCurrentVideoScene(0); // Loop to start
    }
  };

  const handlePrevScene = () => {
    if (currentVideoScene > 0) {
      setCurrentVideoScene(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              onBack();
            }}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl shadow-md transition-all flex items-center justify-center transform hover:-translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-serif">{story.title}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Tema: <span className="text-amber-500 font-extrabold">{story.theme}</span> • Faixa: {story.ageGroup} anos
            </p>
          </div>
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex bg-slate-150 p-1.5 rounded-2xl gap-1.5 max-w-2xl mx-auto w-full shadow-inner overflow-x-auto scrollbar-none flex-nowrap border border-slate-200/50">
        <button
          onClick={() => { setActiveTab('video'); window.speechSynthesis?.cancel(); }}
          className={`flex-1 min-w-[130px] md:min-w-0 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'video' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🎬 Vídeo Animado
        </button>

        <button
          onClick={() => { setActiveTab('book'); window.speechSynthesis?.cancel(); }}
          className={`flex-1 min-w-[130px] md:min-w-0 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'book' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          📖 Livro Ilustrado
        </button>

        <button
          onClick={() => { setActiveTab('coloring'); window.speechSynthesis?.cancel(); }}
          className={`flex-1 min-w-[130px] md:min-w-0 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'coloring' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🖍️ Colorir Online
        </button>

        <button
          onClick={() => { setActiveTab('audio'); window.speechSynthesis?.cancel(); }}
          className={`flex-1 min-w-[130px] md:min-w-0 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'audio' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🎧 Áudio Livro
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === 'video' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6 bg-slate-950 rounded-[3rem] p-6 text-white border-4 border-slate-900 shadow-2xl relative overflow-hidden">
            
            {/* Premium Video Player Container */}
            <div className="relative aspect-[16/9] w-full bg-black rounded-2xl overflow-hidden border border-slate-900 flex items-center justify-center shadow-inner group">
              {story.scenes[currentVideoScene].illustrationUrl ? (
                <img 
                  src={story.scenes[currentVideoScene].illustrationUrl} 
                  alt={`Cena ${currentVideoScene + 1}`}
                  className={`w-full h-full object-cover pointer-events-none select-none transition-all duration-700 ${isVideoPlaying ? 'animate-cinematic-video' : 'transform hover:scale-101'}`}
                />
              ) : (
                <div 
                  className={`w-full h-full pointer-events-none select-none transition-all duration-700 ${isVideoPlaying ? 'animate-cinematic-video' : 'transform hover:scale-101'}`}
                  dangerouslySetInnerHTML={{ __html: story.scenes[currentVideoScene].illustrationSvg }}
                />
              )}

              {/* Subtitles Overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-black/75 backdrop-blur-md p-5 rounded-2xl border border-white/5 text-center transition-all duration-300">
                <p className="text-lg md:text-xl font-bold leading-relaxed font-serif text-amber-100">
                  {story.scenes[currentVideoScene].text}
                </p>
              </div>

              {/* Autoplay Status Indicator */}
              {isVideoPlaying && (
                <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  Narração Ativa
                </div>
              )}
            </div>

            {/* Controls Dashboard */}
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4 px-2">
              <div className="flex items-center gap-3">
                {/* Back scene */}
                <button
                  onClick={handlePrevScene}
                  disabled={currentVideoScene === 0}
                  className="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-white disabled:opacity-40 transition-all"
                >
                  ⏮
                </button>

                {/* Play/Pause */}
                <button
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                    isVideoPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                  }`}
                >
                  {isVideoPlaying ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  )}
                </button>

                {/* Forward scene */}
                <button
                  onClick={handleNextScene}
                  className="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-white transition-all"
                >
                  ⏭
                </button>

                <div className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                  Cena {currentVideoScene + 1} / {story.scenes.length}
                </div>
              </div>

              {/* Progress Bubbles */}
              <div className="flex gap-2 items-center flex-1 max-w-sm">
                {story.scenes.map((s, idx) => (
                  <button
                    key={s.pageNumber}
                    onClick={() => {
                      setCurrentVideoScene(idx);
                      setIsVideoPlaying(false);
                    }}
                    className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                      idx === currentVideoScene 
                        ? 'bg-amber-400 shadow-md shadow-amber-400/20' 
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Speed Controller */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                {([0.75, 1, 1.25, 1.5] as number[]).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setVideoSpeed(sp)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${
                      videoSpeed === sp ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <StoryFlipbook 
            scenes={story.scenes} 
            storyTitle={story.title} 
            moralLesson={story.moralLesson} 
            bibleReference={story.bibleReference} 
          />
        )}

        {activeTab === 'coloring' && (
          <ColoringCanvas 
            coloringSvg={story.scenes[currentVideoScene].coloringSvg} 
            storyTitle={story.title} 
            pageNumber={currentVideoScene + 1} 
            coloringUrl={story.scenes[currentVideoScene].coloringUrl}
          />
        )}

        {activeTab === 'audio' && (
          <div className="max-w-md mx-auto bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl text-center flex flex-col items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100/40 rounded-full -mr-6 -mt-6 pointer-events-none" />
            
            {/* Spotify-style Album Art */}
            <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-tr from-sky-400 to-indigo-600 shadow-lg flex items-center justify-center text-white relative hover:scale-102 transition-transform duration-300">
              <svg className="w-24 h-24 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {isAudioPlaying && (
                <div className="absolute inset-0 rounded-[2.5rem] border-4 border-white/20 border-t-white animate-spin" />
              )}
            </div>

            {/* Book metadata & current text reading */}
            <div className="text-center px-6 max-w-md">
              <span className="px-4 py-1.5 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-sky-400/10">
                Áudio Livro • Página {currentAudioScene + 1} de {story.scenes.length} 🎧
              </span>
              <h3 className="text-xl font-black text-slate-850 font-serif mt-3 leading-snug">{story.title}</h3>
              <p className="text-slate-500 font-bold text-xs mt-3 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                "{story.scenes[currentAudioScene]?.text}"
              </p>
            </div>

            {/* Premium Animated Sound Wave */}
            <div className="flex gap-1.5 items-end h-16 w-full max-w-xs justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100/60">
              {waveSeed.map((heightMultiplier, i) => {
                const height = isAudioPlaying 
                  ? Math.max(10, Math.sin(audioTimer * 0.8 + i) * 100 * heightMultiplier)
                  : 12;
                return (
                  <div 
                    key={i}
                    className="bg-sky-500 rounded-full w-2 transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Time Controls */}
            <div className="w-full">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1 mb-1">
                <span>{formatTime(audioTimer)}</span>
                <span>{formatTime(story.scenes.length * 6)}</span>
              </div>
              
              {/* Scrub Slider */}
              <input 
                type="range"
                min={0}
                max={story.scenes.length * 6}
                value={audioTimer}
                onChange={(e) => setAudioTimer(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
              />
            </div>

            {/* Play/Pause & Speed Buttons Row */}
            <div className="flex items-center justify-center gap-4 w-full mt-2">
              {/* Speed */}
              <button 
                onClick={() => setAudioSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-250 text-slate-600 font-extrabold text-[10px] uppercase rounded-xl transition-all"
              >
                Velocidade: {audioSpeed}x
              </button>

              {/* Play Button */}
              <button
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className={`px-8 py-4 rounded-2xl font-black text-xs text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${
                  isAudioPlaying 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                    : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'
                }`}
              >
                {isAudioPlaying ? 'Pausar Áudio ⏸' : 'Ouvir Agora ⏯'}
              </button>
            </div>

            {story.scenes[currentAudioScene]?.audioUrl && (
              <audio
                ref={audioRef}
                src={story.scenes[currentAudioScene].audioUrl}
                onTimeUpdate={(e) => setAudioTimer((e.target as HTMLAudioElement).currentTime)}
                onEnded={() => {
                  if (currentAudioScene < story.scenes.length - 1) {
                    setCurrentAudioScene(prev => prev + 1);
                    setAudioTimer(0);
                  } else {
                    setIsAudioPlaying(false);
                    setCurrentAudioScene(0);
                    setAudioTimer(0);
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Global Story Moral Lesson Callout Card */}
      {(story.moralLesson || story.bibleReference) && (
        <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-dashed border-amber-400/30 rounded-[2rem] p-6 text-center max-w-4xl mx-auto shadow-sm">
          {story.bibleReference && (
            <span className="inline-block px-4 py-1.5 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
              📖 Onde está escrito na Bíblia: {story.bibleReference}
            </span>
          )}
          {story.moralLesson && (
            <p className="text-slate-700 font-extrabold text-lg leading-relaxed font-serif">
              "{story.moralLesson}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
