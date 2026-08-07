import React, { useState, useEffect } from 'react';
import { Story, StoryTheme, AgeGroup } from '../../domain/Story';
import { MockStoryService } from '../../services/MockStoryService';
import { StoryCreator } from './StoryCreator';
import { StoryViewer } from './StoryViewer';
import { ParentDashboard } from './ParentDashboard';
import { LandingPage } from './LandingPage';
import { UserSubscription, PlanType } from '../../domain/Subscription';
import { CheckoutModal } from './CheckoutModal';
import { LoginScreen } from './LoginScreen';
import { AdminDashboard } from './AdminDashboard';
import { AuthService, UserSession } from '../../services/AuthService';
import { getUsersFromFirestore } from '../../services/firebaseConfig';
import '../styles/index.css';

export const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : '';

import { TaceEngine, TaceQuality } from '../../services/TaceEngine';

const storyService = new MockStoryService();

type ViewType = 'landing' | 'login' | 'studio' | 'admin';

export const LocalSecureApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'parents'>('create');
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  // Auth Session State
  const [session, setSession] = useState<UserSession | null>(() => AuthService.getSession());

  // User Subscription State
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const email = AuthService.getSession()?.email || 'anonimo';
      const subKey = email !== 'anonimo' ? `toontales_subscription_${email}` : 'toontales_subscription';
      const saved = localStorage.getItem(subKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar assinatura:", e);
    }
    return {
      planType: 'free',
      status: 'free_tier',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: {
        storiesCreatedThisPeriod: 0,
        videosCreatedThisPeriod: 0
      },
      cancelAtPeriodEnd: false,
      billingCycle: 'mensal'
    };
  });

  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{ planType: PlanType | 'single_story'; billingCycle: 'mensal' | 'anual'; price: number } | null>(null);

  // Block right-clicks and inspect element keys for maximum security
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync stories, subscriptions and session validation
  useEffect(() => {
    // Validate session on mount or change
    const currentSession = AuthService.getSession();
    setSession(currentSession);
    
    if (currentSession) {
      if (currentSession.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('studio');
      }
    } else {
      setCurrentView('landing');
    }

    const email = currentSession?.email || 'anonimo';
    const storiesKey = email !== 'anonimo' ? `toontales_stories_${email}` : 'toontales_stories';
    const subKey = email !== 'anonimo' ? `toontales_subscription_${email}` : 'toontales_subscription';

    // Migrate from global storage if user specific does not exist yet
    if (email !== 'anonimo') {
      if (!localStorage.getItem(storiesKey) && localStorage.getItem('toontales_stories')) {
        localStorage.setItem(storiesKey, localStorage.getItem('toontales_stories') || '[]');
      }
      if (!localStorage.getItem(subKey) && localStorage.getItem('toontales_subscription')) {
        localStorage.setItem(subKey, localStorage.getItem('toontales_subscription') || '');
      }
    }

    // Load Stories
    try {
      const saved = localStorage.getItem(storiesKey);
      if (saved) {
        const parsed = JSON.parse(saved).map((story: any) => ({
          ...story,
          createdAt: new Date(story.createdAt)
        }));
        setStories(parsed);
      } else {
        setStories([]);
      }
    } catch (e) {
      console.error("Erro ao carregar histórias locais:", e);
    }

    // Load and Sync Subscription
    const loadAndSyncSubscription = async () => {
      try {
        const saved = localStorage.getItem(subKey);
        let currentSub: UserSubscription = saved ? JSON.parse(saved) : {
          planType: 'free',
          status: 'free_tier',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usage: {
            storiesCreatedThisPeriod: 0,
            videosCreatedThisPeriod: 0,
            taceCreditsConsumed: 0
          },
          cancelAtPeriodEnd: false,
          billingCycle: 'mensal'
        };

        // Sync with Firestore Cloud to get latest plan updated by Admin
        if (email !== 'anonimo') {
          try {
            const cloudUsers = await getUsersFromFirestore();
            const cloudUser = cloudUsers.find(u => u.email === email);
            if (cloudUser) {
              const cloudPlan = cloudUser.plan || 'free';
              if (currentSub.planType !== cloudPlan || currentSub.billingCycle !== cloudUser.billingCycle) {
                console.log(`[Cloud Sync] Atualizando plano local do usuário de ${currentSub.planType} para ${cloudPlan}`);
                currentSub = {
                  ...currentSub,
                  planType: cloudPlan as PlanType,
                  status: cloudPlan === 'free' ? 'free_tier' : 'active',
                  billingCycle: (cloudUser.billingCycle || 'mensal') as 'mensal' | 'anual'
                };
                localStorage.setItem(subKey, JSON.stringify(currentSub));
              }
            }
          } catch (cloudErr) {
            console.error("Erro ao sincronizar assinatura com o Firestore:", cloudErr);
          }
        }

        setSubscription(currentSub);
      } catch (e) {
        console.error("Erro ao carregar assinatura:", e);
      }
    };

    loadAndSyncSubscription();
  }, [session?.email]);

  const handleGenerateStory = async (
    theme: StoryTheme,
    ageGroup: AgeGroup,
    prompt: string,
    childPhoto: string | null,
    parentPhoto: string | null
  ) => {
    const quality: TaceQuality = ageGroup === 'adulto' ? 'premium' : 
                               (subscription.planType === 'free' ? 'economica' : 
                               (subscription.planType === 'hero' ? 'padrao' : 'premium'));

    // TACE Cache - Verifica cache antes de gastar qualquer crédito
    const cacheKey = `${theme}_${ageGroup}_${prompt.substring(0, 30)}_${childPhoto ? 'photo' : 'no'}`;
    const cachedStory = TaceEngine.checkCache(cacheKey);
    if (cachedStory) {
      console.log("[TACE] Retornando história protegida direto do Cache local.");
      const updatedStories = [cachedStory, ...stories];
      setStories(updatedStories);
      setSelectedStory(cachedStory);
      return;
    }

    // TACE AI Router - Seleciona melhor IA de acordo com qualidade
    const bestModel = TaceEngine.selectBestModel('story', quality);

    // TACE Credit Engine - Valida e debita créditos do usuário
    const deductResult = TaceEngine.deductCredits(
      session?.email || 'anonimo',
      'story',
      quality,
      '720p',
      bestModel.modelId
    );

    if (!deductResult.success) {
      if (window.confirm(`${deductResult.message}\n\nDeseja abrir o Painel dos Pais para gerenciar seus créditos e planos agora?`)) {
        setActiveTab('parents');
      }
      return;
    }

    console.log(`[TACE] Geração autorizada! Debitado ${deductResult.cost} TC. Provedor roteado: ${bestModel.provider} (${bestModel.name}).`);
    
    let newStory: Story;

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, ageGroup, prompt, childPhoto, parentPhoto, modelId: bestModel.modelId })
      });
      if (!response.ok) throw new Error("Erro na chamada de API do proxy");
      const data = await response.json();
      
      if (data.status === 'fallback_mock') {
        const title = prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt;
        newStory = await storyService.generateStory(theme, ageGroup, title);
      } else {
        newStory = {
          ...data,
          createdAt: new Date(data.createdAt)
        };
      }
    } catch (e) {
      console.warn("Falha ao gerar história via API real. Utilizando gerador local como fallback:", e);
      const title = prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt;
      newStory = await storyService.generateStory(theme, ageGroup, title);
    }
    
    // Salva no estado
    const email = session?.email || 'anonimo';
    const storiesKey = email !== 'anonimo' ? `toontales_stories_${email}` : 'toontales_stories';
    const subKey = email !== 'anonimo' ? `toontales_subscription_${email}` : 'toontales_subscription';

    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);
    localStorage.setItem(storiesKey, JSON.stringify(updatedStories));

    // Grava no Cache para futuras consultas
    TaceEngine.setCache(cacheKey, newStory);

    // Atualiza a assinatura no localstorage para refletir o débito de créditos no estado local
    const subSaved = localStorage.getItem(subKey);
    if (subSaved) {
      setSubscription(JSON.parse(subSaved));
    }

    setSelectedStory(newStory);
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
  };

  const handleSelectPlan = (planType: PlanType, billingCycle: 'mensal' | 'anual') => {
    const PLAN_LINKS: Record<string, Record<'mensal' | 'anual', string>> = {
      hero: {
        mensal: 'https://www.asaas.com/c/p4djxbmd3a1pa258',
        anual: 'https://www.asaas.com/c/cessgiyswob8a47y'
      },
      professional: {
        mensal: 'https://www.asaas.com/c/vrdfu5hi5k86ctp4',
        anual: 'https://www.asaas.com/c/uyskuo3rmdhya6pl'
      },
      legendary: {
        mensal: 'https://www.asaas.com/c/muqdti8nb8dtkbh7',
        anual: 'https://www.asaas.com/c/he6m5q29enjyptne'
      }
    };

    const targetUrl = PLAN_LINKS[planType]?.[billingCycle];
    if (targetUrl) {
      window.open(targetUrl, '_blank');
      return;
    }

    let price = 0;
    if (planType === 'hero') {
      price = billingCycle === 'mensal' ? 49 : 39;
    } else if (planType === 'legendary') {
      price = billingCycle === 'mensal' ? 249 : 199;
    } else {
      price = billingCycle === 'mensal' ? 119 : 95;
    }

    setPendingPlan({ planType, billingCycle, price });
    setShowCheckout(true);
  };

  const handleBuySingleStory = (_childName: string, theme: string, _ageGroup: string, childPhoto: string | null) => {
    localStorage.setItem('toontales_pending_photo', childPhoto || '');
    localStorage.setItem('toontales_pending_age', _ageGroup);
    localStorage.setItem('toontales_pending_theme', theme);
    localStorage.setItem('toontales_pending_name', _childName);
    
    // Vídeos acima de 4 minutos (faixa etária Adulto) cobram R$ 59,00
    const isLongVideo = _ageGroup === 'adulto';
    const price = isLongVideo ? 59.00 : (theme === 'Livre' ? 39.00 : 19.90);
    
    setPendingPlan({ planType: 'single_story', billingCycle: 'mensal', price });
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (paymentMethod: 'pix' | 'credit_card') => {
    if (!pendingPlan) return;

    const email = session?.email || 'anonimo';
    const subKey = email !== 'anonimo' ? `toontales_subscription_${email}` : 'toontales_subscription';

    if (pendingPlan.planType === 'single_story') {
      const updatedSub: UserSubscription = {
        ...subscription,
        oneTimeCredits: (subscription.oneTimeCredits || 0) + 1
      };
      setSubscription(updatedSub);
      localStorage.setItem(subKey, JSON.stringify(updatedSub));
      
      setShowCheckout(false);
      setPendingPlan(null);

      // Auto-geração do livro utilizando os parâmetros salvos no simulador
      const pendingName = localStorage.getItem('toontales_pending_name') || 'Amiguinho';
      const pendingTheme = localStorage.getItem('toontales_pending_theme') || 'Aventura';
      const pendingAge = localStorage.getItem('toontales_pending_age') || '2-6';
      const pendingPhoto = localStorage.getItem('toontales_pending_photo') || null;

      alert(`Pagamento Confirmado! Criando sua história completa de homenagem para "${pendingName}" agora...`);
      
      handleGenerateStory(
        pendingTheme as any,
        pendingAge as any,
        `Escreva uma linda homenagem personalizada para ${pendingName}.`,
        pendingPhoto,
        null
      );
      
      setCurrentView('studio');
      setActiveTab('library');
      return;
    }

    const updatedSub: UserSubscription = {
      planType: pendingPlan.planType as PlanType,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: {
        ...subscription.usage
      },
      cancelAtPeriodEnd: false,
      paymentMethod,
      billingCycle: pendingPlan.billingCycle
    };

    setSubscription(updatedSub);
    localStorage.setItem(subKey, JSON.stringify(updatedSub));
    setShowCheckout(false);
    setPendingPlan(null);
    setCurrentView('studio');
    setActiveTab('parents');
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Tem certeza que deseja cancelar sua assinatura ativa? Seus benefícios expirarão no final do ciclo atual.")) {
      const email = session?.email || 'anonimo';
      const subKey = email !== 'anonimo' ? `toontales_subscription_${email}` : 'toontales_subscription';

      const updatedSub: UserSubscription = {
        ...subscription,
        cancelAtPeriodEnd: true,
        status: 'canceled'
      };
      setSubscription(updatedSub);
      localStorage.setItem(subKey, JSON.stringify(updatedSub));
    }
  };

  const handleDowngradeToFree = () => {
    if (window.confirm("Deseja voltar para o plano gratuito imediatamente? Suas histórias não serão excluídas, mas os limites de criação voltarão ao padrão (2 por mês).")) {
      const email = session?.email || 'anonimo';
      const subKey = email !== 'anonimo' ? `toontales_subscription_${email}` : 'toontales_subscription';

      const updatedSub: UserSubscription = {
        planType: 'free',
        status: 'free_tier',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage: {
          storiesCreatedThisPeriod: stories.length,
          videosCreatedThisPeriod: 0
        },
        cancelAtPeriodEnd: false,
        billingCycle: 'mensal'
      };
      setSubscription(updatedSub);
      localStorage.setItem(subKey, JSON.stringify(updatedSub));
    }
  };

  const handleLoginSuccess = (_email: string, role: 'admin' | 'user') => {
    const updatedSession = AuthService.getSession();
    setSession(updatedSession);
    if (role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('studio');
      setActiveTab('create');
    }
  };

  const handleLogout = () => {
    AuthService.clearSession();
    setSession(null);
    setCurrentView('landing');
    setSelectedStory(null);
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-[#F0F4F8] text-[#1E293B] font-sans antialiased">
        {/* Floating Landing Header with Login Button */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60 shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentView('landing'); setSelectedStory(null); }}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 shadow-md shadow-amber-300/40 flex items-center justify-center text-white font-black text-xl font-serif">
              T
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-800 font-serif">ToonTales</span>
              <span className="text-xs font-bold text-amber-500 block -mt-1 uppercase tracking-widest text-[9px]">AI Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#planos" className="text-xs font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider px-3 py-2">Planos</a>
            <button
              onClick={() => setCurrentView('login')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            >
              Entrar no Estúdio 🔑
            </button>
          </div>
        </header>
        
        <LandingPage 
          onEnterStudio={() => {
            if (session) {
              setCurrentView('studio');
            } else {
              setCurrentView('login');
            }
          }} 
          onSelectPlan={handleSelectPlan}
          onBuySingleStory={handleBuySingleStory}
        />
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setCurrentView('landing')}
        />
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#F0F4F8] pb-12">
        <header className="bg-slate-900 sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md text-white">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('admin')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 shadow-md flex items-center justify-center text-white font-black text-xl font-serif">
              A
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-serif text-white">ToonTales Admin</span>
              <span className="text-xs font-bold text-amber-400 block -mt-1 uppercase tracking-widest text-[8px]">Painel de Controle</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Allow admin to also view the studio tab if they want to test creation
                setCurrentView('studio');
                setActiveTab('create');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700/50"
            >
              Ir para o Estúdio 🎨
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="mt-8">
          <AdminDashboard onLogout={handleLogout} />
        </main>
      </div>
    );
  }

  // Render Studio (For standard user/authenticated clients, and admin testing)
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans antialiased pb-12">
      {/* Premium Header/Navigation */}
      <header className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentView('landing'); setSelectedStory(null); }}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20 flex items-center justify-center text-white font-black text-xl font-serif">
              T
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-serif">ToonTales</span>
              <span className="text-xs font-bold text-amber-400 block -mt-1 uppercase tracking-widest text-[9px]">
                {subscription.planType === 'free' ? 'AI Studio' : `${subscription.planType} Tier`}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 max-w-full">
            <div className="flex bg-slate-900/60 border border-slate-800/80 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-none max-w-[240px] xs:max-w-[320px] sm:max-w-none">
              <button
                onClick={() => { setCurrentView('landing'); setSelectedStory(null); }}
                className="px-4 py-2 rounded-lg font-bold text-xs md:text-sm text-slate-400 hover:text-white transition-all"
              >
                Início
              </button>
              <button
                onClick={() => { setSelectedStory(null); setActiveTab('create'); }}
                className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                  activeTab === 'create' && !selectedStory
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Criar Livro/Vídeo
              </button>
              <button
                onClick={() => { setSelectedStory(null); setActiveTab('library'); }}
                className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center gap-1.5 ${
                  activeTab === 'library' && !selectedStory
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Biblioteca ({stories.length})
              </button>
              <button
                onClick={() => { setSelectedStory(null); setActiveTab('parents'); }}
                className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                  activeTab === 'parents' && !selectedStory
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Painel dos Pais
              </button>
            </div>

            {/* Admin Back Link or User Profile Logout */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-800">
              {session?.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-all"
                >
                  Admin 🛠️
                </button>
              )}
              <span className="text-[10px] font-black text-slate-400 uppercase hidden md:block">
                {session?.email.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800/80 flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Sair da Conta"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 mt-8">
        {selectedStory ? (
          <StoryViewer story={selectedStory} onBack={() => setSelectedStory(null)} />
        ) : (
          <>
            {activeTab === 'create' && (
              <StoryCreator onGenerate={handleGenerateStory} />
            )}

            {activeTab === 'library' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white font-serif">Minhas Histórias</h2>
                    <p className="text-slate-400 text-sm">Biblioteca completa das aventuras criadas para as crianças.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    + Nova História
                  </button>
                </div>

                {stories.length === 0 ? (
                  <div className="text-center p-16 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2.5rem] shadow-md max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                      <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Biblioteca Vazia</h3>
                    <p className="text-slate-400 text-sm mt-1 mb-6">Você ainda não gerou nenhuma história. Comece agora!</p>
                    <button 
                      onClick={() => setActiveTab('create')}
                      className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-2xl transition-all shadow-md cursor-pointer"
                    >
                      Criar Primeira História
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {stories.map((story) => (
                      <div 
                        key={story.id}
                        onClick={() => handleSelectStory(story)}
                        className="bg-slate-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden border border-slate-800/80 shadow-md hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-slate-700/80 hover:scale-102 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                      >
                        {/* Cover thumbnail */}
                        <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
                          {story.scenes[0].illustrationUrl ? (
                            <img 
                              src={story.scenes[0].illustrationUrl} 
                              alt="Capa"
                              className="w-full h-full object-cover pointer-events-none select-none group-hover:scale-105 transition-all duration-300"
                            />
                          ) : (
                            <div 
                              className="w-full h-full pointer-events-none select-none group-hover:scale-105 transition-all duration-300"
                              dangerouslySetInnerHTML={{ __html: story.scenes[0].illustrationSvg }}
                            />
                          )}
                          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-sm ${
                            story.theme === 'Bíblico' ? 'bg-emerald-500/80 border border-emerald-400/30' :
                            story.theme === 'Aventura' ? 'bg-amber-500/80 border border-amber-400/30' :
                            'bg-sky-500/80 border border-sky-400/30'
                          }`}>
                            {story.theme}
                          </span>
                        </div>

                        {/* Story info */}
                        <div className="p-5 flex-1 flex flex-col justify-between bg-slate-950/20">
                          <div>
                            <h4 className="text-base font-extrabold text-white line-clamp-2 leading-snug font-serif">
                              {story.title}
                            </h4>
                            <p className="text-slate-450 text-xs mt-1.5 font-semibold">
                              Faixa {story.ageGroup} • {story.scenes.length} cenas
                            </p>
                          </div>
                          
                          <div className="flex gap-1.5 mt-4 pt-4 border-t border-slate-800/60">
                            <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] font-black rounded-md uppercase tracking-wide border border-slate-800">
                              Vídeo
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] font-black rounded-md uppercase tracking-wide border border-slate-800">
                              Livro
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] font-black rounded-md uppercase tracking-wide border border-slate-800">
                              Colorir
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] font-black rounded-md uppercase tracking-wide border border-slate-800">
                              Áudio
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parents' && (
              <ParentDashboard 
                stories={stories} 
                onSelectStory={handleSelectStory} 
                subscription={subscription}
                onSelectPlan={handleSelectPlan}
                onCancelSubscription={handleCancelSubscription}
                onDowngradeToFree={handleDowngradeToFree}
              />
            )}
          </>
        )}
      </main>

      {/* Render Checkout Modal */}
      {showCheckout && pendingPlan && (
        <CheckoutModal
          planType={pendingPlan.planType}
          billingCycle={pendingPlan.billingCycle}
          price={pendingPlan.price}
          userEmail={session?.email || 'cliente@toontales.com'}
          isAdultHomenagem={pendingPlan.planType === 'single_story' && localStorage.getItem('toontales_pending_age') === 'adulto'}
          onClose={() => {
            setShowCheckout(false);
            setPendingPlan(null);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}
      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/5516997327255?text=preciso%20de%20infoma%C3%A7oes%20sobre%20a%20platforma%20Toontales%3F"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-emerald-500 hover:bg-emerald-650 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-all duration-300 group cursor-pointer"
        title="Falar no WhatsApp"
      >
        {/* WhatsApp Icon SVG */}
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.883-6.963C16.588 1.964 14.118.94 11.488.94c-5.43 0-9.85 4.417-9.853 9.86-.001 1.737.478 3.43 1.387 4.932L2.003 21.07l5.44-.816zM18.86 15.29c-.326-.163-1.934-.954-2.227-1.061-.293-.106-.507-.16-.72.162-.213.325-.826 1.061-1.013 1.277-.187.213-.373.24-.7.077-1.919-.96-3.11-1.685-4.18-3.52-.28-.481.28-.447.801-1.486.087-.163.04-.306-.02-.469-.06-.163-.507-1.226-.694-1.68-.186-.45-.373-.39-.507-.39-.133-.003-.28-.003-.426-.003-.147 0-.387.054-.587.271-.2.213-.76.743-.76 1.81 0 1.067.773 2.1 1.88 2.247 1.107.147 2.127.818 2.127 1.816 0 1.08-.2 1.94-.4 2.14a.8.8 0 0 1-.587.271z"/>
        </svg>
        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-black py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-300 border border-slate-800 shadow-md">
          Suporte no WhatsApp 🟢
        </span>
      </a>
    </div>
  );
};
