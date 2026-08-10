import React, { useState, useEffect, useRef } from 'react';
import { Match, Club, Character, MatchEvent } from '../../domain/veggieTypes';
import { VeggieMatchEngine, UserAction } from '../../services/veggieMatchEngine';

interface VeggieCupMatchProps {
  userClub: Club;
  opponentClub: Club;
  userTeam: Character[];
  opponentTeam: Character[];
  onMatchFinished: () => void;
}

export const VeggieCupMatch: React.FC<VeggieCupMatchProps> = ({
  userClub,
  opponentClub,
  userTeam,
  opponentTeam,
  onMatchFinished
}) => {
  const [phase, setPhase] = useState<'PRE_GAME' | 'PLAYING' | 'GOAL_CELEBRATION' | 'POST_GAME'>('PRE_GAME');
  const [match, setMatch] = useState<Match>({
    id: `match_${Date.now()}`,
    homeClubId: userClub.id,
    awayClubId: opponentClub.id,
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    events: [],
    possession: 50,
    shotsHome: 0,
    shotsAway: 0,
    passesHome: 0,
    passesAway: 0
  });

  const [minute, setMinute] = useState(0);
  const [crowdReaction, setCrowdReaction] = useState('A torcida canta alto e balança bandeiras!');
  const [preGameStep, setPreGameStep] = useState(0);
  const [lastGoalEvent, setLastGoalEvent] = useState<MatchEvent | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<'TV' | 'CINEMATIC' | 'TACTICAL'>('TV');
  const [specialEnergy, setSpecialEnergy] = useState<number>(0); // Energia Especial de 0 a 100
  
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [match.events]);

  useEffect(() => {
    if (phase === 'PRE_GAME') {
      const introEvents = VeggieMatchEngine.generateMatchIntro(userClub, opponentClub);
      setMatch(prev => ({ ...prev, events: introEvents }));

      const timer = setInterval(() => {
        setPreGameStep(prev => {
          if (prev >= 3) {
            clearInterval(timer);
            setPhase('PLAYING');
            setMinute(1);
            setMatch(curr => ({
              ...curr,
              status: 'PLAYING',
              events: [...curr.events, { minute: 0, type: 'INFO', description: 'Apita o árbitro! Começa a partida de futebol!' }]
            }));
            return 3;
          }
          return prev + 1;
        });
      }, 3000);

      return () => clearInterval(timer);
    }
    return () => {};
  }, [phase]);

  const handleAction = (action: UserAction) => {
    if (phase !== 'PLAYING') return;

    const result = VeggieMatchEngine.processAction(
      match,
      action,
      userClub,
      opponentClub,
      userTeam,
      opponentTeam,
      minute,
      specialEnergy
    );

    setMatch(result.updatedMatch);
    setCrowdReaction(result.crowdReaction);

    // Atualização da energia especial
    if (action === 'SPECIAL_SKILL') {
      setSpecialEnergy(0);
    } else {
      setSpecialEnergy(prev => Math.min(100, prev + result.gainedSpecialEnergy));
    }

    const latestEvent = result.updatedMatch.events[result.updatedMatch.events.length - 1];
    if (latestEvent && latestEvent.type === 'GOAL') {
      setLastGoalEvent(latestEvent);
      setPhase('GOAL_CELEBRATION');
      setTimeout(() => {
        setPhase('PLAYING');
        setLastGoalEvent(null);
      }, 4000);
    }

    if (result.nextMinute >= 90) {
      setMinute(90);
      VeggieMatchEngine.finalizeMatch(result.updatedMatch);
      setPhase('POST_GAME');
    } else {
      setMinute(result.nextMinute);
    }
  };

  const activePlayer = userTeam[0] || { name: 'Atleta', vegetable: 'Carrot', gender: 'F', specialAbility: { name: 'Poder Veggie', description: '' } };

  return (
    <div className="w-full max-w-6xl mx-auto glass-panel rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl animate-fade-in">
      
      {/* HEADER: PLACAR ELETRÔNICO */}
      <div className="bg-slate-900/90 border-b border-slate-700/50 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Mandante */}
        <div className="flex items-center gap-4 w-full md:w-1/3 justify-end">
          <div className="text-right hidden md:block">
            <h2 className="text-xl font-bold text-white">{userClub.name}</h2>
            <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">CASA</span>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-slate-700" style={{ backgroundColor: userClub.primaryColor }}>
            {userClub.logo}
          </div>
        </div>

        {/* Placar ao Vivo */}
        <div className="flex flex-col items-center justify-center px-6 py-2 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="text-[10px] font-semibold text-emerald-400 tracking-widest uppercase mb-1">
            {phase === 'PRE_GAME' ? 'PRÉ-JOGO' : phase === 'POST_GAME' ? 'FIM DE JOGO' : 'AO VIVO'}
          </div>
          <div className="flex items-center gap-6">
            <span className="text-4xl font-extrabold text-white tracking-wider">{match.homeScore}</span>
            <span className="text-slate-600 text-2xl font-bold">:</span>
            <span className="text-4xl font-extrabold text-white tracking-wider">{match.awayScore}</span>
          </div>
          <div className="mt-2 px-3 py-1 bg-emerald-950/80 rounded-full border border-emerald-800 text-emerald-400 text-sm font-bold">
            {minute}'
          </div>
        </div>

        {/* Visitante */}
        <div className="flex items-center gap-4 w-full md:w-1/3 justify-start">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-slate-700" style={{ backgroundColor: opponentClub.primaryColor }}>
            {opponentClub.logo}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{opponentClub.name}</h2>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">VISITANTE</span>
          </div>
        </div>
      </div>

      {/* 3D ARENA VISUAL ENGINE VIEW */}
      <div className="relative h-80 md:h-[450px] bg-slate-950 overflow-hidden veggie-field-grass flex flex-col justify-between p-4 border-b border-slate-800">
        
        {/* Camada da Torcida Organizada */}
        <div className="absolute inset-x-0 top-0 h-28 bg-slate-900/90 border-b-2 border-slate-700 overflow-hidden flex flex-col justify-end">
          <div className="absolute inset-0 stadium-crowd-layer opacity-40"></div>
          <div className="flex justify-between items-center px-8 pb-2 relative z-10">
            <div className="flex gap-2 text-xl animate-bounce">🚩 🇳🇬 🇧🇷 🥦</div>
            <div className="px-4 py-1 bg-slate-950/80 border border-emerald-500/30 rounded text-xs text-emerald-400 font-bold animate-pulse">
              🏟️ VEGGIE WORLD ARENA - 78.500 ESPECTADORES
            </div>
            <div className="flex gap-2 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍅 🌶️ 🥕 🏁</div>
          </div>
        </div>

        {/* Seletor de Câmeras */}
        <div className="absolute top-32 left-4 z-20 flex gap-2">
          {(['TV', 'CINEMATIC', 'TACTICAL'] as const).map(cam => (
            <button
              key={cam}
              onClick={() => setSelectedCamera(cam)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                selectedCamera === cam
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              📷 Câmera {cam}
            </button>
          ))}
        </div>

        {/* Display Eletrônico de Reação da Torcida */}
        <div className="absolute top-32 right-4 z-20 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-right hidden sm:block">
          <div className="text-[10px] text-slate-400 font-mono">REAÇÃO DA TORCIDA</div>
          <div className="text-xs text-emerald-400 font-bold">{crowdReaction}</div>
        </div>

        {/* CAMPO DE JOGO - MODELOS 3D E REPRESENTAÇÃO DOS ATLETAS */}
        <div className="w-full flex-grow relative mt-24 flex items-center justify-center">
          
          {/* Modal de Comemoração de Gol */}
          {phase === 'GOAL_CELEBRATION' && (
            <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold text-yellow-400 tracking-wider animate-bounce sports-banner-text">
                GOOOOOOL!!!
              </h1>
              <div className="mt-4 text-2xl text-white font-bold flex items-center gap-3">
                {lastGoalEvent?.playerName} ({lastGoalEvent?.clubName})
              </div>
              <p className="mt-2 text-emerald-400 text-lg font-semibold italic">
                "{lastGoalEvent?.description}"
              </p>
              <div className="mt-6 flex gap-4 text-6xl">
                <span>🥕</span><span>🥦</span><span>🍅</span><span>🥔</span>
              </div>
            </div>
          )}

          {/* Pré-jogo: Entrada e Apresentação dos Capitães */}
          {phase === 'PRE_GAME' && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
              {preGameStep === 0 && (
                <div className="animate-pulse">
                  <h3 className="text-2xl font-bold text-white mb-2">🎥 CÂMERA SOBREVOANDO A VEGGIE ARENA</h3>
                  <p className="text-slate-300">Helicóptero de transmissão mostrando o estádio lotado de torcedores vegetais!</p>
                </div>
              )}
              {preGameStep === 1 && (
                <div>
                  <h3 className="text-2xl font-bold text-emerald-400 mb-2">📣 HINO E APRESENTAÇÃO DOS TIMES</h3>
                  <p className="text-slate-300">Os refletores brilham e a torcida organizada começa os cantos nas arquibancadas!</p>
                </div>
              )}
              {preGameStep === 2 && (
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">🏃 JOGADORES ENTRANDO PELO TÚNEL</h3>
                  <p className="text-slate-300">Entrada triunfal dos atletas masculinos e femininos com fardamento oficial.</p>
                </div>
              )}
              {preGameStep === 3 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">🪙 PARTE DE RESERVAS E COMISSÃO</h3>
                  <p className="text-slate-300">Árbitros posicionados, capitães no círculo central para o sorteio inicial.</p>
                </div>
              )}
            </div>
          )}

          {/* Fim de Jogo: Painel de Recompensas */}
          {phase === 'POST_GAME' && (
            <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2">PARTIDA FINALIZADA!</h2>
              <div className="text-lg text-emerald-400 font-bold mb-6">
                {match.homeScore > match.awayScore ? '🏆 VITÓRIA!' : match.homeScore === match.awayScore ? '🤝 EMPATE' : '❌ DERROTA'}
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-md w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase">Moedas</div>
                  <div className="text-xl font-bold text-yellow-500">+{match.homeScore > match.awayScore ? 150 : match.homeScore === match.awayScore ? 80 : 50}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase">Gemas</div>
                  <div className="text-xl font-bold text-sky-400">+{match.homeScore > match.awayScore ? 2 : 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase">XP</div>
                  <div className="text-xl font-bold text-emerald-400">+{match.homeScore > match.awayScore ? 300 : match.homeScore === match.awayScore ? 150 : 100}</div>
                </div>
              </div>

              <button
                onClick={onMatchFinished}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold text-lg rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                VOLTAR AO HUB CENTRAL
              </button>
            </div>
          )}

          {/* Visual dos Atletas com Representação de Gênero */}
          <div className="flex justify-around items-center w-full px-12 z-10 relative">
            {/* Atleta do Usuário */}
            <div className="flex flex-col items-center gap-2 animate-bounce" style={{ animationDuration: '2s' }}>
              <span className="px-2 py-0.5 bg-slate-900 border border-emerald-500 rounded text-[9px] font-bold text-emerald-400 uppercase font-mono">
                {userTeam[0]?.gender === 'F' ? '👩 Atleta' : '👨 Atleta'}
              </span>
              <div className="px-3 py-1 bg-slate-900/90 border border-slate-700 rounded text-xs font-bold text-white">
                {userTeam[0]?.name.split(' ')[0]}
              </div>
              <div className="text-7xl filter drop-shadow-[0_8px_16px_rgba(22,163,74,0.5)]">
                {userTeam[0]?.vegetable === 'Carrot' ? '🥕' : userTeam[0]?.vegetable === 'Tomato' ? '🍅' : '🥦'}
              </div>
              <div className="w-12 h-2 bg-black/40 rounded-full blur-sm"></div>
            </div>

            {/* Bola de Futebol */}
            <div className="relative animate-spin" style={{ animationDuration: '4s' }}>
              <div className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">⚽</div>
            </div>

            {/* Atleta Adversário */}
            <div className="flex flex-col items-center gap-2 animate-bounce" style={{ animationDuration: '2.5s' }}>
              <span className="px-2 py-0.5 bg-slate-900 border border-red-500 rounded text-[9px] font-bold text-red-400 uppercase font-mono">
                {opponentTeam[0]?.gender === 'F' ? '👩 Atleta' : '👨 Atleta'}
              </span>
              <div className="px-3 py-1 bg-slate-900/90 border border-slate-700 rounded text-xs font-bold text-white">
                {opponentTeam[0]?.name.split(' ')[0]}
              </div>
              <div className="text-7xl filter drop-shadow-[0_8px_16px_rgba(239,68,68,0.5)]">
                {opponentTeam[0]?.vegetable === 'Potato' ? '🥔' : opponentTeam[0]?.vegetable === 'Hot Pepper' ? '🌶️' : '🧅'}
              </div>
              <div className="w-12 h-2 bg-black/40 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Informações Estatísticas Rápidas */}
        <div className="w-full bg-slate-900/80 border border-slate-700/50 backdrop-blur rounded-2xl p-3 flex justify-between text-xs font-mono text-slate-300 z-10">
          <div>Posse de Bola: <span className="text-emerald-400 font-bold">{match.possession}%</span> | <span className="text-red-400 font-bold">{100 - match.possession}%</span></div>
          <div>Chutes a Gol: <span className="text-emerald-400 font-bold">{match.shotsHome}</span> - <span className="text-red-400 font-bold">{match.shotsAway}</span></div>
          <div className="hidden sm:block">Passes Concluídos: <span className="text-emerald-400 font-bold">{match.passesHome}</span> - <span className="text-red-400 font-bold">{match.passesAway}</span></div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE TÁTICO E NARRATIVA */}
      <div className="bg-slate-900 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Comandos de Jogo */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">SELEÇÃO TÁTICA</h3>
              <span className="text-xs text-yellow-400 font-bold">Barra de Especial: {specialEnergy}%</span>
            </div>
            
            {/* Barra de progresso especial */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all" style={{ width: `${specialEnergy}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'PASS', label: 'Passe Curto', icon: '⚽', color: 'from-emerald-500 to-green-600' },
              { id: 'DRIBBLE', label: 'Driblar', icon: '⚡', color: 'from-amber-500 to-yellow-600' },
              { id: 'SHOOT', label: 'Chutar a Gol', icon: '🥅', color: 'from-red-500 to-orange-600' },
              { id: 'ATTACK', label: 'Avançar Linha', icon: '↗️', color: 'from-teal-500 to-cyan-600' },
              { id: 'DEFEND', label: 'Retrair Defesa', icon: '🛡️', color: 'from-blue-500 to-indigo-600' },
              { id: 'COUNTER_ATTACK', label: 'Contra-ataque', icon: '⚡', color: 'from-purple-500 to-pink-600' }
            ].map(btn => (
              <button
                key={btn.id}
                disabled={phase !== 'PLAYING'}
                onClick={() => handleAction(btn.id as UserAction)}
                className={`py-4 px-3 rounded-2xl bg-gradient-to-b ${btn.color} text-slate-950 font-bold flex flex-col items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span className="text-2xl">{btn.icon}</span>
                <span className="text-xs tracking-wider">{btn.label}</span>
              </button>
            ))}

            {/* Botão Especial Ativo quando enche a barra */}
            <button
              disabled={phase !== 'PLAYING' || specialEnergy < 100}
              onClick={() => handleAction('SPECIAL_SKILL')}
              className={`col-span-2 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border-2 ${
                specialEnergy >= 100
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 border-yellow-300 text-slate-950 animate-pulse font-extrabold cursor-pointer hover:brightness-115'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>💥 HABILIDADE ESPECIAL</span>
              <span className="text-xs font-mono">({activePlayer.specialAbility.name})</span>
            </button>
          </div>
        </div>

        {/* Feed Narrativo do Jogo */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">NARRADOR OFICIAL</h3>
          <div className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-4 h-64 overflow-y-auto flex flex-col gap-2 font-mono text-xs text-slate-300">
            {match.events.map((evt, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border transition-all ${
                  evt.type === 'GOAL'
                    ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300 text-sm font-bold animate-pulse'
                    : evt.type === 'START' || evt.type === 'END'
                    ? 'bg-slate-900 border-slate-700 text-yellow-400 font-bold'
                    : 'bg-slate-900/30 border-slate-900/50 text-slate-300'
                }`}
              >
                <span className="text-slate-500">[{evt.minute}']</span> {evt.description}
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>

      </div>

    </div>
  );
};
export default VeggieCupMatch;
