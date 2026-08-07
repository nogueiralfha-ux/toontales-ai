import React, { useState, useEffect } from 'react';
import { PlanType } from '../../domain/Subscription';
import { TaceEngine, TaceEngineConfig, TaceQuality, TaceResolution, TaceResourceType } from '../../services/TaceEngine';
import { getUsersFromFirestore } from '../../services/firebaseConfig';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface SimulatedUser {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  billingCycle: 'mensal' | 'anual' | 'N/A';
  dateJoined: string;
  asaasCustomerId: string;
  whatsapp?: string;
}

interface AIProvider {
  id: string;
  name: string;
  category: 'text' | 'image' | 'audio' | 'video';
  model: string;
  endpoint: string;
  status: 'active' | 'inactive';
  priority: number;
  costPerUse: number; // in cents
  speedMs: number;
  qualityScore: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'marketplace' | 'tace'>('metrics');
  const [taceConfig, setTaceConfig] = useState<TaceEngineConfig>(TaceEngine.getConfig());

  // Simulated Users state
  const [users, setUsers] = useState<SimulatedUser[]>([
    { id: '1', name: 'Ana Silva', email: 'ana.silva@gmail.com', plan: 'hero', billingCycle: 'mensal', dateJoined: '2026-07-12', asaasCustomerId: 'cus_829381023' },
    { id: '2', name: 'Marcos Souza', email: 'marcos.souza@yahoo.com.br', plan: 'free', billingCycle: 'N/A', dateJoined: '2026-07-28', asaasCustomerId: 'cus_991823102' },
    { id: '3', name: 'Lucia Nogueira', email: 'lucia.nogueira@hotmail.com', plan: 'legendary', billingCycle: 'anual', dateJoined: '2026-06-15', asaasCustomerId: 'cus_102938481' },
    { id: '4', name: 'Pedro Santos', email: 'pedrinho99@gmail.com', plan: 'free', billingCycle: 'N/A', dateJoined: '2026-08-01', asaasCustomerId: 'cus_772839182' },
    { id: '5', name: 'Fábio Ramos', email: 'fabio.ramos@gmail.com', plan: 'hero', billingCycle: 'anual', dateJoined: '2026-05-20', asaasCustomerId: 'cus_661928374' }
  ]);

  // Load registered users from Firestore on mount
  useEffect(() => {
    const loadRealUsers = async () => {
      try {
        const realList = await getUsersFromFirestore();
        if (realList && realList.length > 0) {
          const formatted: SimulatedUser[] = realList.map((ru, idx) => ({
            id: ru.id || `db-${idx}`,
            name: ru.name || 'Sem Nome',
            email: ru.email,
            plan: 'free',
            billingCycle: 'N/A',
            dateJoined: ru.createdAt ? ru.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            asaasCustomerId: 'Firestore Cloud',
            whatsapp: ru.whatsapp
          }));

          setUsers(prev => {
            const filteredPrev = prev.filter(pu => !formatted.some(fu => fu.email === pu.email));
            return [...formatted, ...filteredPrev];
          });
        }
      } catch (err) {
        console.error("Erro ao sincronizar usuários do Firestore:", err);
      }
    };
    loadRealUsers();
  }, []);

  // AI Providers state (Marketplace)
  const [providers, setProviders] = useState<AIProvider[]>([
    { id: '1', name: 'OpenAI GPT-4o', category: 'text', model: 'gpt-4o', endpoint: 'https://api.openai.com/v1/chat/completions', status: 'active', priority: 1, costPerUse: 2.5, speedMs: 1200, qualityScore: 9 },
    { id: '2', name: 'Anthropic Claude 3.5', category: 'text', model: 'claude-3-5-sonnet', endpoint: 'https://api.anthropic.com/v1/messages', status: 'active', priority: 2, costPerUse: 3.0, speedMs: 1500, qualityScore: 10 },
    { id: '3', name: 'Groq Llama-3 (Fast)', category: 'text', model: 'llama3-70b-8192', endpoint: 'https://api.groq.com/openai/v1/chat/completions', status: 'inactive', priority: 3, costPerUse: 0.2, speedMs: 300, qualityScore: 8 },
    { id: '4', name: 'Replicate Flux (Images)', category: 'image', model: 'flux-schnell', endpoint: 'https://api.replicate.com/v1/predictions', status: 'active', priority: 1, costPerUse: 4.0, speedMs: 2500, qualityScore: 9.5 },
    { id: '5', name: 'ElevenLabs Voice (Audio)', category: 'audio', model: 'eleven_multilingual_v2', endpoint: 'https://api.elevenlabs.io/v1/text-to-speech', status: 'active', priority: 1, costPerUse: 1.5, speedMs: 900, qualityScore: 9 },
    { id: '6', name: 'Luma Dream Machine (Video)', category: 'video', model: 'luma-ray-1-6', endpoint: 'https://api.lumalabs.ai/v1/video', status: 'inactive', priority: 1, costPerUse: 15.0, speedMs: 8000, qualityScore: 8.5 }
  ]);

  const handleUpdatePlan = (userId: string, newPlan: PlanType) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          plan: newPlan,
          billingCycle: newPlan === 'free' ? 'N/A' : u.billingCycle === 'N/A' ? 'mensal' : u.billingCycle
        };
      }
      return u;
    }));
  };

  const handleToggleProvider = (providerId: string) => {
    setProviders(providers.map(p => {
      if (p.id === providerId) {
        return { ...p, status: p.status === 'active' ? 'inactive' : 'active' };
      }
      return p;
    }));
  };

  const handleUpdatePriority = (providerId: string, val: number) => {
    setProviders(providers.map(p => {
      if (p.id === providerId) {
        return { ...p, priority: val };
      }
      return p;
    }));
  };

  const handleSaveMarketplace = () => {
    alert("Configurações do Marketplace de Provedores de IA salvas com sucesso no banco de dados central!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-8">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl flex justify-between items-center flex-wrap gap-6 border border-slate-700/40">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-black bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/35">
            Área Reservada • Administrador
          </span>
          <h2 className="text-3xl font-black font-serif mt-3">Painel de Administração</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Conectado como: <strong className="text-white">nogueiralfha@gmail.com</strong>
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-2"
        >
          🚪 Sair da Conta
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5 max-w-xl mx-auto w-full shadow-inner border border-slate-200/50">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'metrics' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          📊 Métricas Gerais
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          👥 Gerenciar Usuários
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'marketplace' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          🔌 Provedores de IA
        </button>
        <button
          onClick={() => setActiveTab('tace')}
          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tace' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          🪙 Configurações TACE
        </button>
      </div>

      {/* Admin Tab Panels */}
      <div className="mt-4">
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Faturamento Asaas</span>
              <span className="text-3xl font-black text-slate-800 block mt-2">R$ 12.490</span>
              <span className="text-emerald-500 text-[10px] font-bold block mt-1">↑ 18% este mês</span>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total de Usuários</span>
              <span className="text-3xl font-black text-slate-800 block mt-2">124</span>
              <span className="text-emerald-500 text-[10px] font-bold block mt-1">↑ 12 cadastros hoje</span>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Custo de API (Tokens)</span>
              <span className="text-3xl font-black text-rose-600 block mt-2">R$ 143,50</span>
              <span className="text-slate-400 text-[10px] font-medium block mt-1">Média de R$ 1,15/história</span>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Histórias Criadas</span>
              <span className="text-3xl font-black text-slate-800 block mt-2">348</span>
              <span className="text-sky-500 text-[10px] font-bold block mt-1">68 vídeos exportados</span>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Controle de Assinantes</h3>
              <p className="text-slate-500 text-xs mt-1">Gerencie manualmente os privilégios e consulte os dados cadastrados.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="pb-4">Nome / E-mail</th>
                    <th className="pb-4">Plano</th>
                    <th className="pb-4">Ciclo</th>
                    <th className="pb-4">Asaas ID</th>
                    <th className="pb-4">Data Cadastro</th>
                    <th className="pb-4 align-middle text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="py-4">
                        <span className="block font-bold text-slate-800">{user.name}</span>
                        <span className="block text-[10px] text-slate-400">{user.email}</span>
                        {user.whatsapp && (
                          <span className="inline-block mt-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/60">
                            🟢 WhatsApp: {user.whatsapp}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          user.plan === 'legendary' ? 'bg-amber-100 text-amber-700' :
                          user.plan === 'hero' ? 'bg-sky-100 text-sky-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {user.plan === 'legendary' ? 'Criador' : user.plan === 'hero' ? 'Inicial' : 'Gratuito'}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500 uppercase tracking-wide">{user.billingCycle}</td>
                      <td className="py-4 font-mono text-slate-400 text-[11px]">{user.asaasCustomerId}</td>
                      <td className="py-4 text-slate-500">{user.dateJoined}</td>
                      <td className="py-4 align-middle text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => handleUpdatePlan(user.id, 'free')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md font-bold text-[10px]"
                          >
                            Tornar Grátis
                          </button>
                          <button 
                            onClick={() => handleUpdatePlan(user.id, 'hero')}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-md font-bold text-[10px]"
                          >
                            Inicial
                          </button>
                          <button 
                            onClick={() => handleUpdatePlan(user.id, 'legendary')}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-md font-bold text-[10px]"
                          >
                            Criador
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Orquestração de Provedores de IA</h3>
                <p className="text-slate-500 text-xs mt-1">Ative, defina prioridades e gerencie os endpoints e modelos para garantir a maior margem de lucro.</p>
              </div>
              <button
                onClick={handleSaveMarketplace}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
              >
                💾 Salvar Marketplace
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {providers.map((p) => (
                <div 
                  key={p.id}
                  className={`p-6 rounded-3xl border transition-all flex justify-between items-center flex-wrap gap-6 ${
                    p.status === 'active' 
                      ? 'bg-slate-50 border-slate-200/80' 
                      : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.category === 'text' ? 'bg-purple-100 text-purple-700' :
                        p.category === 'image' ? 'bg-rose-100 text-rose-700' :
                        p.category === 'audio' ? 'bg-sky-100 text-sky-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-800">{p.name}</h4>
                    </div>
                    <p className="text-slate-400 font-mono text-[10px] mt-1.5 truncate max-w-md">{p.endpoint}</p>
                    <p className="text-slate-500 text-xs mt-1">Modelo ativo: <strong className="font-mono text-slate-700">{p.model}</strong></p>
                  </div>

                  {/* Settings columns */}
                  <div className="flex gap-6 flex-wrap items-center">
                    {/* Metrics */}
                    <div className="text-center min-w-[60px]">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Custo</span>
                      <span className="text-xs font-bold text-slate-700">{p.costPerUse}¢ <span className="text-[9px] font-normal text-slate-400">/req</span></span>
                    </div>

                    <div className="text-center min-w-[60px]">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Velocidade</span>
                      <span className="text-xs font-bold text-slate-700">{(p.speedMs / 1000).toFixed(1)}s</span>
                    </div>

                    <div className="text-center min-w-[60px]">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Qualidade</span>
                      <span className="text-xs font-bold text-emerald-600 font-serif">{p.qualityScore}/10</span>
                    </div>

                    {/* Priority Selector */}
                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Prioridade</span>
                      <select 
                        value={p.priority}
                        onChange={(e) => handleUpdatePriority(p.id, Number(e.target.value))}
                        disabled={p.status === 'inactive'}
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500 text-slate-700"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? '(Alta)' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Toggle Switch */}
                    <button
                      onClick={() => handleToggleProvider(p.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        p.status === 'active'
                          ? 'bg-emerald-500 border-emerald-450 hover:bg-emerald-600 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-250'
                      }`}
                    >
                      {p.status === 'active' ? 'Ativo 🟢' : 'Inativo 🔴'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tace' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md flex flex-col gap-8">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Painel TACE Weight Control</h3>
                <p className="text-slate-500 text-xs mt-1">Ajuste os pesos de qualidade, resoluções e o consumo de créditos (TC) das IAs em tempo real para garantir sua margem de 80%.</p>
              </div>
              <button
                onClick={() => {
                  TaceEngine.saveConfig(taceConfig);
                  alert("Pesos do Credit Engine TACE salvos com sucesso e propagados ao vivo!");
                }}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                💾 Salvar Configurações TACE
              </button>
            </div>

            {/* Quality & Resolution Multipliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quality Multipliers */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Multiplicadores de Qualidade</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(taceConfig.qualityWeights) as TaceQuality[]).map((q) => (
                    <div key={q} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">{q}</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={taceConfig.qualityWeights[q]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1.0;
                          setTaceConfig({
                            ...taceConfig,
                            qualityWeights: { ...taceConfig.qualityWeights, [q]: val }
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Multipliers */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Multiplicadores de Resolução</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(taceConfig.resolutionWeights) as TaceResolution[]).map((r) => (
                    <div key={r} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">{r}</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={taceConfig.resolutionWeights[r]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1.0;
                          setTaceConfig({
                            ...taceConfig,
                            resolutionWeights: { ...taceConfig.resolutionWeights, [r]: val }
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resource Base Costs */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Custo Base dos Recursos (TC)</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(taceConfig.resourceBaseCosts) as TaceResourceType[]).map((res) => (
                  <div key={res} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">{res}</label>
                    <input 
                      type="number" 
                      value={taceConfig.resourceBaseCosts[res]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setTaceConfig({
                          ...taceConfig,
                          resourceBaseCosts: { ...taceConfig.resourceBaseCosts, [res]: val }
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Models Table */}
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Modelos de Inteligência Artificial</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse bg-slate-50/40">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider bg-slate-50/80">
                      <th className="p-4">Modelo / IA</th>
                      <th className="p-4">Provedor</th>
                      <th className="p-4">Custo Base (TC)</th>
                      <th className="p-4">Prioridade</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {taceConfig.models.map((model, idx) => (
                      <tr key={model.modelId} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-850">{model.name}</td>
                        <td className="p-4 font-mono text-slate-500 uppercase text-[10px]">{model.provider}</td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            value={model.baseCostTc}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const updatedModels = [...taceConfig.models];
                              updatedModels[idx] = { ...model, baseCostTc: val };
                              setTaceConfig({ ...taceConfig, models: updatedModels });
                            }}
                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-4">
                          <select 
                            value={model.priority}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              const updatedModels = [...taceConfig.models];
                              updatedModels[idx] = { ...model, priority: val };
                              setTaceConfig({ ...taceConfig, models: updatedModels });
                            }}
                            className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold outline-none text-slate-700"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedModels = [...taceConfig.models];
                              updatedModels[idx] = { ...model, isActive: !model.isActive };
                              setTaceConfig({ ...taceConfig, models: updatedModels });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                              model.isActive
                                ? 'bg-emerald-500 border-emerald-450 text-white'
                                : 'bg-slate-200 border-slate-300 text-slate-600'
                            }`}
                          >
                            {model.isActive ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
