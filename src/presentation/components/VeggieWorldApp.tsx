import React, { useState, useEffect } from 'react';
import { VeggieDatabase } from '../../services/veggieDatabase';
import { UserProfile, Character, Club, ShopItem, Standing, Mission, Achievement } from '../../domain/veggieTypes';
import { VeggieCupMatch } from './VeggieCupMatch';
import { VeggieCup3DField } from './VeggieCup3DField';

export const VeggieWorldApp: React.FC = () => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Inputs Autenticação
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [favoriteClubInput, setFavoriteClubInput] = useState<string>('carrot_united');

  const [activeTab, setActiveTab] = useState<string>('WORLD');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playingMatch, setPlayingMatch] = useState<boolean>(false);
  const [selectedOpponentClub, setSelectedOpponentClub] = useState<Club | null>(null);

  // Estados Admin
  const [adminCoinsInput, setAdminCoinsInput] = useState<number>(1000);
  const [adminCustomName, setAdminCustomName] = useState<string>('');
  const [adminCustomVeg, setAdminCustomVeg] = useState<string>('Garlic');
  const [adminCustomGender, setAdminCustomGender] = useState<'M' | 'F'>('F');

  useEffect(() => {
    VeggieDatabase.init();
    const currentEmail = localStorage.getItem('veggieworld_current_user_email');
    if (currentEmail) {
      setIsLogged(true);
      refreshData();
    }
  }, []);

  const refreshData = () => {
    setProfile(VeggieDatabase.getProfile());
    setCharacters(VeggieDatabase.getCharacters());
    setClubs(VeggieDatabase.getClubs());
    setShopItems(VeggieDatabase.getShopItems());
    setStandings(VeggieDatabase.getStandings());
    setMissions(VeggieDatabase.getMissions());
    setAchievements(VeggieDatabase.getAchievements());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = VeggieDatabase.login(emailInput, passwordInput);
    if (res.success) {
      setIsLogged(true);
      refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput || !usernameInput) {
      alert('Preencha todos os campos!');
      return;
    }
    const res = VeggieDatabase.register(emailInput, passwordInput, usernameInput, favoriteClubInput);
    alert(res.message);
    if (res.success) {
      setAuthMode('LOGIN');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    VeggieDatabase.logout();
    setIsLogged(false);
    setProfile(null);
    setEmailInput('');
    setPasswordInput('');
  };

  const handleRefillEnergy = () => {
    if (!profile) return;
    if (profile.wallet.coins >= 100) {
      const updatedProfile = { ...profile };
      updatedProfile.wallet.coins -= 100;
      updatedProfile.wallet.energy = Math.min(100, updatedProfile.wallet.energy + 50);
      VeggieDatabase.saveProfile(updatedProfile);
      refreshData();
    } else {
      alert('Moedas insuficientes para comprar energia!');
    }
  };

  const handleUpgradeCharacter = (charId: string, statKey: 'speed' | 'power' | 'technique' | 'precision' | 'defense' | 'stamina' | 'agility') => {
    if (!profile) return;
    const upgradeCost = 150;

    if (profile.wallet.coins < upgradeCost) {
      alert('Moedas insuficientes para treinar seu atleta vegetal!');
      return;
    }

    const updatedCharacters = characters.map(c => {
      if (c.id === charId) {
        const stats = { ...c.stats };
        stats[statKey] = Math.min(99, stats[statKey] + 3);
        const overall = Math.round(
          (stats.speed + stats.power + stats.technique + stats.precision + stats.defense + stats.stamina + stats.agility) / 7
        );
        return { ...c, stats, overall };
      }
      return c;
    });

    const updatedProfile = { ...profile };
    updatedProfile.wallet.coins -= upgradeCost;
    VeggieDatabase.saveProfile(updatedProfile);
    VeggieDatabase.saveCharacters(updatedCharacters);
    refreshData();
  };

  const handleBuyItem = (itemId: string) => {
    const result = VeggieDatabase.buyShopItem(itemId);
    alert(result.message === 'Purchase successful!' ? 'Compra realizada com sucesso!' : result.message);
    refreshData();
  };

  const handleSelectClub = (clubId: string) => {
    if (!profile) return;
    const updatedProfile = { ...profile, favoriteClubId: clubId };
    VeggieDatabase.saveProfile(updatedProfile);
    refreshData();
  };

  const startMatch = (oppClub: Club) => {
    if (!profile) return;
    if (profile.wallet.energy < 10) {
      alert('Energia insuficiente! Adquira mais energia ou espere a recuperação automática.');
      return;
    }
    VeggieDatabase.consumeEnergy(10);
    setSelectedOpponentClub(oppClub);
    setPlayingMatch(true);
  };

  const handleMatchFinished = () => {
    setPlayingMatch(false);
    setSelectedOpponentClub(null);
    refreshData();
    setActiveTab('RANKING');
  };

  const handleAdminAddCoins = () => {
    if (!profile) return;
    const updatedProfile = { ...profile };
    updatedProfile.wallet.coins += Number(adminCoinsInput);
    VeggieDatabase.saveProfile(updatedProfile);
    refreshData();
    alert(`Injetado ${adminCoinsInput} moedas na carteira!`);
  };

  const handleAdminCreateAthlete = () => {
    if (!adminCustomName) {
      alert('Por favor, insira um nome para o atleta vegetal customizado.');
      return;
    }
    const newAthlete: Character = {
      id: `custom_${Date.now()}`,
      name: adminCustomName,
      vegetable: adminCustomVeg,
      gender: adminCustomGender,
      rarity: 'LEGENDARY',
      level: 1,
      xp: 0,
      overall: 80,
      stats: { speed: 80, power: 80, technique: 80, precision: 80, defense: 80, stamina: 80, agility: 80 },
      specialAbility: { name: 'Super Chute Vegano', description: 'Bônus massivo em todos os atributos.', bonusStat: 'power', multiplier: 1.4 },
      personality: 'Criado no painel administrativo, pronto para brilhar.',
      clubId: profile?.role === 'SUPER_ADMIN' ? null : profile?.favoriteClubId || null,
      availableSports: ['veggie_cup'],
      visualId: 'custom'
    };

    const updatedChars = [...characters, newAthlete];
    VeggieDatabase.saveCharacters(updatedChars);
    
    if (profile) {
      const updatedProfile = { ...profile };
      updatedProfile.inventory.characters.push(newAthlete.id);
      VeggieDatabase.saveProfile(updatedProfile);
    }

    refreshData();
    setAdminCustomName('');
    alert(`Atleta vegetal criado com sucesso: ${newAthlete.name}!`);
  };

  // TELA DE AUTENTICAÇÃO INICIAL
  if (!isLogged) {
    return (
      <div className="min-h-screen bg-[#0c0f12] text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-5xl">🌱</span>
            <h1 className="text-3xl font-extrabold text-emerald-400 mt-4 tracking-wider sports-banner-text">VEGGIE WORLD</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Onde os Vegetais Viram Estrelas</p>
          </div>

          {authMode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: nogueiralfha@gmail.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Sua senha"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold rounded-xl transition-all hover:brightness-110">
                ENTRAR NO JOGO
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => setAuthMode('REGISTER')} className="text-emerald-400 font-bold hover:underline">
                  Cadastre-se
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Apelido (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treinador Cebolinha"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Crie uma senha"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Clube de Coração (Vira Administrador do Time)</label>
                <select
                  value={favoriteClubInput}
                  onChange={e => setFavoriteClubInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option value="carrot_united">Cenoura FC 🥕</option>
                  <option value="broccoli_fc">Brócolis Esporte Clube 🥦</option>
                  <option value="tomato_stars">Tomate Estrela 🍅</option>
                  <option value="potato_warriors">Guerreiros da Batata 🥔</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold rounded-xl transition-all hover:brightness-110">
                CRIAR CONTA E ADMINISTRAR TIME
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => setAuthMode('LOGIN')} className="text-emerald-400 font-bold hover:underline">
                  Faça Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-height-screen bg-slate-950 p-6">
        <div className="text-white text-xl animate-pulse font-mono">Inicializando Perfil...</div>
      </div>
    );
  }

  // Define clubes e elenco com base no time gerenciado
  const activeUserClub = clubs.find(c => c.id === profile.favoriteClubId) || clubs[0];
  const userTeam = characters.filter(c => profile.inventory.characters.includes(c.id));
  const activeTeam = userTeam.filter(c => c.clubId === activeUserClub.id);

  if (playingMatch && selectedOpponentClub) {
    const opponentTeamChars = characters.filter(c => c.clubId === selectedOpponentClub.id);
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4 animate-fade-in">
        <VeggieCupMatch
          userClub={activeUserClub}
          opponentClub={selectedOpponentClub}
          userTeam={activeTeam.length > 0 ? activeTeam : userTeam.slice(0, 3)}
          opponentTeam={opponentTeamChars.length > 0 ? opponentTeamChars : characters.slice(3, 6)}
          onMatchFinished={handleMatchFinished}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f12] text-slate-100 flex flex-col">
      
      {/* GLOBAL TOP NAV BAR */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌱</span>
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-400 tracking-wider sports-banner-text">VEGGIE WORLD</h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Onde os Vegetais se Tornam Estrelas do Esporte</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
            {/* Tag Cargo */}
            <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-lg font-mono">
              {profile.role === 'SUPER_ADMIN' ? '👑 SUPER ADMIN' : '📋 GESTOR DE CLUBE'}
            </span>

            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
              <span className="text-emerald-400 font-bold">NÍVEL {profile.level}</span>
              <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(profile.xp / (profile.level * 1000)) * 100}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{profile.xp}/{profile.level * 1000}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xl">🪙</span>
              <span className="font-extrabold text-yellow-500 font-mono">{profile.wallet.coins}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xl">💎</span>
              <span className="font-extrabold text-cyan-400 font-mono">{profile.wallet.gems}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xl">⚡</span>
              <span className="font-extrabold text-emerald-400 font-mono">{profile.wallet.energy}/100</span>
              {profile.wallet.energy < 100 && (
                <button
                  onClick={handleRefillEnergy}
                  className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] rounded transition-colors"
                >
                  RECOMPRA (+50)
                </button>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* HUB MIDDLE BODY GRID */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <aside className="md:col-span-1 flex flex-col gap-2">
          {[
            { id: 'WORLD', label: '🌎 Central Hub', desc: 'Visão geral do universo' },
            { id: 'SPORTS', label: '⚽ Arena de Esportes', desc: 'Selecione e dispute partidas' },
            { id: 'MY_VEGGIES', label: '🥕 Meus Vegetais', desc: 'Treinar e evoluir atletas' },
            { id: 'MY_CLUB', label: '🛡️ Meu Clube de Futebol', desc: 'Escalar equipe favorita' },
            { id: 'STORE', label: '🛍️ Veggie Store', desc: 'Skins, atletas e itens' },
            { id: 'MISSIONS', label: '📋 Missões & Conquistas', desc: 'Resgatar recompensas' },
            { id: 'RANKING', label: '🏆 Tabela Liga Horta', desc: 'Ver classificação oficial' },
            { id: 'ADMIN', label: '⚙️ Painel de Gestão Admin', desc: 'Configurações administrativas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl flex flex-col text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500/20 to-green-600/10 border-2 border-emerald-500/80 text-white shadow-lg'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">{tab.desc}</span>
            </button>
          ))}
        </aside>

        <section className="md:col-span-3 min-h-[500px]">
          
          {/* TAB 1: CENTRAL HUB */}
          {activeTab === 'WORLD' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative z-10 text-center md:text-left">
                  <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold text-[10px] tracking-wider rounded-full uppercase">
                    PROMOÇÃO DE GESTÃO DO TIME
                  </span>
                  <h2 className="text-3xl font-extrabold text-white mt-4 mb-2">VEGGIE CUP TEMPORADA 1</h2>
                  <p className="text-slate-300 max-w-md text-sm">
                    Como Administrador do seu clube, treine os atributos dos vegetais masculinos e femininos em busca do troféu da Liga Horta!
                  </p>
                  <button
                    onClick={() => setActiveTab('SPORTS')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
                  >
                    ⚽ INICIAR PARTIDA
                  </button>
                </div>
              </div>

              {/* SIMULADOR 3D DE BOLA EM TEMPO REAL */}
              <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 shadow-xl flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">🏟️ Simulador de Campo 3D (Física da Bola em Tempo Real)</h3>
                  <p className="text-xs text-slate-400">Clique nos botões abaixo para testar impulsos vetoriais de chute ou passe com gravidade e quiques físicos reais!</p>
                </div>
                <VeggieCup3DField />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Perfil */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">PERFIL DE GESTÃO</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👨‍🌾</span>
                      <div>
                        <h4 className="font-bold text-white text-lg">{profile.username}</h4>
                        <p className="text-xs text-slate-400">Dirigente do {activeUserClub.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-slate-800 pt-4 grid grid-cols-3 text-center text-xs">
                    <div>
                      <div className="text-slate-500">Vitórias</div>
                      <div className="font-bold text-emerald-400 text-base">{profile.wins}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Derrotas</div>
                      <div className="font-bold text-red-400 text-base">{profile.losses}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Empates</div>
                      <div className="font-bold text-slate-300 text-base">{profile.draws}</div>
                    </div>
                  </div>
                </div>

                {/* Atletas */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">ATLETAS DISPONÍVEIS</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-3xl font-mono">{profile.inventory.characters.length}</span>
                      <span className="text-slate-400 text-xs">Vegetais prontos no seu elenco</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-1">
                    {userTeam.slice(0, 5).map(char => (
                      <span key={char.id} className="text-2xl" title={char.name}>
                        {char.vegetable === 'Carrot' ? '🥕' : char.vegetable === 'Tomato' ? '🍅' : char.vegetable === 'Broccoli' ? '🥦' : char.vegetable === 'Potato' ? '🥔' : '🧅'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Veggie Pass */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">VEGGIE PASS</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-emerald-400 font-bold">NÍVEL 4/50</span>
                      <span className="text-[10px] text-slate-500 font-mono">XP: 240/1000</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-[10px] text-slate-400">
                    🏆 Desbloqueie o Alho Lendário no nível 50!
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ARENA DE ESPORTES */}
          {activeTab === 'SPORTS' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white">ARENA DE ESPORTES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="glass-panel rounded-3xl p-6 border-2 border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    JOGAR AGORA
                  </div>
                  <div>
                    <span className="text-5xl">⚽</span>
                    <h3 className="text-xl font-bold text-white mt-4">VEGGIE CUP (Futebol)</h3>
                    <p className="text-slate-400 text-xs mt-2">
                      Gerencie as ações táticas em tempo real de seu clube favorito na disputa do campeonato da Liga Horta.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">SELECIONE O RIVAL</h4>
                    <div className="flex flex-col gap-2">
                      {clubs.filter(c => c.active && c.id !== profile.favoriteClubId).map(opp => (
                        <button
                          key={opp.id}
                          onClick={() => startMatch(opp)}
                          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all"
                        >
                          <span>Jogar contra {opp.name} {opp.logo}</span>
                          <span className="font-mono opacity-80">⚡ 10 ENERGIA</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {[
                  { icon: '🏀', title: 'VEGGIE BASKET', desc: 'Basquete profissional estilo arcade americano.' },
                  { icon: '🏐', title: 'VEGGIE VOLLEY', desc: 'Vôlei de praia e ginásio lotado.' },
                  { icon: '⚾', title: 'VEGGIE BASEBALL', desc: 'Arremessos e rebatidas com estádios completamente lotados.' },
                  { icon: '🎾', title: 'VEGGIE TENNIS', desc: 'Partidas clássicas com sets rápidos.' },
                  { icon: '🏎️', title: 'VEGGIE RACING', desc: 'Circuitos no-code e com muita velocidade.' },
                  { icon: '🏊', title: 'VEGGIE AQUA', desc: 'Provas rápidas de velocidade aquática.' }
                ].map(sport => (
                  <div key={sport.title} className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between opacity-60">
                    <div>
                      <span className="text-5xl">{sport.icon}</span>
                      <h3 className="text-xl font-bold text-white mt-4">{sport.title}</h3>
                      <p className="text-slate-400 text-xs mt-2">{sport.desc}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">STATUS</span>
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-400 font-bold">
                        EM BREVE
                      </span>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* TAB 3: MY VEGGIES */}
          {activeTab === 'MY_VEGGIES' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white">MEUS ATLETAS VEGETAIS</h2>
              <p className="text-xs text-slate-400">Gaste 150 Moedas para treinar habilidades específicas de seu elenco favorito.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userTeam.map(char => (
                  <div key={char.id} className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4 relative">
                    <span className="absolute top-4 right-4 text-xs font-bold text-yellow-500 font-mono uppercase">
                      {char.rarity}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-6xl">{char.vegetable === 'Carrot' ? '🥕' : char.vegetable === 'Tomato' ? '🍅' : char.vegetable === 'Broccoli' ? '🥦' : char.vegetable === 'Potato' ? '🥔' : '🧅'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{char.name}</h3>
                          <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-400 uppercase">
                            {char.gender === 'F' ? 'Feminino 👩' : 'Masculino 👨'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 italic mt-1">"{char.personality}"</p>
                        <div className="mt-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">
                            Overall Geral: {char.overall}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                      <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">TREINAR ATRIBUTOS (Custo: 150 Moedas)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'speed', label: 'Velocidade' },
                          { key: 'power', label: 'Força' },
                          { key: 'technique', label: 'Técnica' },
                          { key: 'precision', label: 'Mira' },
                          { key: 'defense', label: 'Defesa' },
                          { key: 'stamina', label: 'Fôlego' },
                          { key: 'agility', label: 'Agilidade' }
                        ].map(st => {
                          const val = (char.stats as any)[st.key];
                          return (
                            <button
                              key={st.key}
                              onClick={() => handleUpgradeCharacter(char.id, st.key as any)}
                              className="p-2 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 rounded-xl border border-slate-800 text-left flex justify-between items-center transition-all group"
                            >
                              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-950">{st.label}</span>
                              <span className="text-xs font-extrabold text-emerald-400 group-hover:text-slate-950 font-mono">{val} ➕</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MY CLUB */}
          {activeTab === 'MY_CLUB' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white">GERENCIAR CLUBE DE FUTEBOL</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="glass-panel rounded-3xl p-6 border-2 border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">CLUBE SOB SUA GESTÃO</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-xl border border-slate-700" style={{ backgroundColor: activeUserClub.primaryColor }}>
                        {activeUserClub.logo}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-white">{activeUserClub.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">Ecosistema Sport: Veggie Cup Futebol</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-3xl p-6 border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">MUDAR DE CLUBE DE CORAÇÃO</h3>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {clubs.filter(c => c.active).map(club => (
                      <button
                        key={club.id}
                        onClick={() => handleSelectClub(club.id)}
                        className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                          club.id === activeUserClub.id
                            ? 'bg-emerald-950 border border-emerald-500/40 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{club.logo}</span>
                        <span className="font-bold text-sm">{club.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: VEGGIE STORE */}
          {activeTab === 'STORE' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white">LOJA VEGGIE</h2>
              <p className="text-xs text-slate-400">Adquira novos atletas, skins exclusivas e uniformes para os torneios esportivos.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {shopItems.map(item => (
                  <div key={item.id} className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase font-semibold">
                          {item.category === 'characters' ? 'Atleta' : 'Cosmético'}
                        </span>
                        <span className="text-xs font-mono text-yellow-500 font-bold">{item.rarity}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-3">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-2">{item.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{item.currency === 'coins' ? '🪙' : '💎'}</span>
                        <span className="font-extrabold text-base font-mono">{item.price}</span>
                      </div>

                      {item.purchased ? (
                        <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed">
                          ADQUIRIDO
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyItem(item.id)}
                          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
                        >
                          COMPRAR
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MISSÕES E CONQUISTAS */}
          {activeTab === 'MISSIONS' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              <div>
                <h2 className="text-xl font-bold text-white mb-4">MISSÕES DIÁRIAS</h2>
                <div className="flex flex-col gap-3">
                  {missions.map(m => (
                    <div key={m.id} className="glass-panel rounded-2xl p-4 border border-slate-800 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{m.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(m.current / m.target) * 100}%` }}></div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{m.current}/{m.target}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">RECOMPENSA</div>
                        <div className="font-bold text-yellow-500 font-mono text-sm">+{m.rewardAmount} {m.rewardType === 'coins' ? 'MOEDAS' : 'GEMAS'}</div>
                        {m.completed && (
                          <span className="mt-1 inline-block text-[9px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                            RESGATADO
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-bold text-white mb-4">CONQUISTAS DO GESTOR</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map(ach => (
                    <div key={ach.id} className={`glass-panel rounded-2xl p-4 border flex items-center gap-4 ${ach.unlocked ? 'border-emerald-500/20' : 'border-slate-800 opacity-60'}`}>
                      <span className="text-3xl">{ach.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                        {ach.unlocked ? (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold block mt-1">Concluído</span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-600 block mt-1">Bloqueado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: LIGA HORTA STANDINGS */}
          {activeTab === 'RANKING' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white">CLASSIFICAÇÃO OFICIAL - LIGA HORTA</h2>
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase font-mono">
                      <th className="p-4">POS</th>
                      <th className="p-4">CLUBE</th>
                      <th className="p-4 text-center">J</th>
                      <th className="p-4 text-center">V</th>
                      <th className="p-4 text-center">E</th>
                      <th className="p-4 text-center">D</th>
                      <th className="p-4 text-center">SG</th>
                      <th className="p-4 text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((st, idx) => {
                      const club = clubs.find(c => c.id === st.clubId);
                      const isUserClub = st.clubId === profile.favoriteClubId;
                      return (
                        <tr key={st.clubId} className={`border-b border-slate-800/60 ${isUserClub ? 'bg-emerald-950/20 font-bold text-white' : 'text-slate-300'}`}>
                          <td className="p-4 font-mono">{idx + 1}</td>
                          <td className="p-4 flex items-center gap-3">
                            <span className="text-2xl">{club?.logo}</span>
                            <span>{club?.name}</span>
                          </td>
                          <td className="p-4 text-center font-mono">{st.played}</td>
                          <td className="p-4 text-center font-mono">{st.wins}</td>
                          <td className="p-4 text-center font-mono">{st.draws}</td>
                          <td className="p-4 text-center font-mono">{st.losses}</td>
                          <td className="p-4 text-center font-mono">{st.goalDifference}</td>
                          <td className="p-4 text-center font-mono text-emerald-400 font-extrabold">{st.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ADMIN DASHBOARD */}
          {activeTab === 'ADMIN' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white">⚙️ FERRAMENTAS DE ADMINISTRAÇÃO</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Somente SUPER_ADMIN pode injetar dinheiro no sistema */}
                {profile.role === 'SUPER_ADMIN' ? (
                  <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">INJETAR MOEDAS (GLOBAL)</h3>
                      <span className="text-[9px] bg-yellow-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">SuperAdmin</span>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Quantidade</label>
                      <input
                        type="number"
                        value={adminCoinsInput}
                        onChange={e => setAdminCoinsInput(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      onClick={handleAdminAddCoins}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl transition-all"
                    >
                      🪙 INJETAR RECURSOS
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex items-center justify-center text-center opacity-60">
                    <p className="text-xs text-slate-500 italic">
                      🔒 Injeção de recursos e moedas bloqueada. Apenas Administradores Gerais possuem essa permissão.
                    </p>
                  </div>
                )}

                {/* Criador de atletas (SuperAdmin cria global, ClubAdmin cria associado ao seu clube) */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">CONTRATAR ATLETA VEGETAL</h3>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                      {profile.role === 'SUPER_ADMIN' ? 'Global' : 'Seu Clube'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Nome do Atleta</label>
                    <input
                      type="text"
                      placeholder="Ex: Arlinhos Cenoura"
                      value={adminCustomName}
                      onChange={e => setAdminCustomName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Tipo de Vegetal</label>
                    <select
                      value={adminCustomVeg}
                      onChange={e => setAdminCustomVeg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {['Carrot', 'Broccoli', 'Tomato', 'Potato', 'Onion', 'Corn', 'Pepper'].map(veg => (
                        <option key={veg} value={veg}>{veg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Gênero Visual</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-1.5 text-sm text-slate-300">
                        <input
                          type="radio"
                          name="gender"
                          checked={adminCustomGender === 'F'}
                          onChange={() => setAdminCustomGender('F')}
                          className="accent-emerald-500"
                        />
                        Feminino 👩
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-slate-300">
                        <input
                          type="radio"
                          name="gender"
                          checked={adminCustomGender === 'M'}
                          onChange={() => setAdminCustomGender('M')}
                          className="accent-emerald-500"
                        />
                        Masculino 👨
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleAdminCreateAthlete}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all"
                  >
                    🌱 CRIAR E VINCULAR ATLETA
                  </button>
                </div>

              </div>
            </div>
          )}

        </section>

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-600 mt-auto">
        <p>© 2026 Veggie World - Todos os direitos reservados. Onde os vegetais se tornam lendas do esporte.</p>
      </footer>

    </div>
  );
};
export default VeggieWorldApp;
