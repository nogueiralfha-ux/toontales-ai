export type TaceQuality = 'economica' | 'padrao' | 'premium' | 'cinema';
export type TaceResolution = '720p' | '1080p' | '2k' | '4k';
export type TaceResourceType = 'story' | 'video' | 'audio' | 'coloring' | 'export' | 'quiz' | 'translation';

export interface TaceModelWeight {
  modelId: string;
  name: string;
  provider: string;
  baseCostTc: number; // base credit cost
  isActive: boolean;
  priority: number; // lower is higher priority
}

export interface TaceEngineConfig {
  qualityWeights: Record<TaceQuality, number>;      // multiplier for quality
  resolutionWeights: Record<TaceResolution, number>; // multiplier for resolution
  resourceBaseCosts: Record<TaceResourceType, number>; // base cost per resource type
  models: TaceModelWeight[];
}

export interface TaceTransaction {
  id: string;
  userId: string;
  resourceType: TaceResourceType;
  quality: TaceQuality;
  modelId: string;
  creditsConsumed: number;
  timestamp: string;
  status: 'success' | 'failed';
}

const DEFAULT_CONFIG: TaceEngineConfig = {
  qualityWeights: {
    economica: 1.0,
    padrao: 1.8,
    premium: 3.5,
    cinema: 6.0
  },
  resolutionWeights: {
    '720p': 1.0,
    '1080p': 1.4,
    '2k': 2.0,
    '4k': 3.2
  },
  resourceBaseCosts: {
    story: 15,       // base TC cost for a story (8 scenes)
    video: 40,       // base TC cost for a video (per scene)
    audio: 10,       // base TC cost for audio
    coloring: 5,     // base TC cost for coloring features
    export: 8,       // base TC cost for PDF export
    quiz: 5,
    translation: 10
  },
  models: [
    // Text IAs
    { modelId: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'google', baseCostTc: 5, isActive: true, priority: 1 },
    { modelId: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google', baseCostTc: 25, isActive: true, priority: 2 },
    { modelId: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', baseCostTc: 10, isActive: true, priority: 3 },
    { modelId: 'gpt-4o', name: 'GPT-4o', provider: 'openai', baseCostTc: 40, isActive: true, priority: 4 },
    
    // Image IAs
    { modelId: 'flux-schnell', name: 'Flux Schnell', provider: 'fal', baseCostTc: 8, isActive: true, priority: 1 },
    { modelId: 'imagen-3', name: 'Google Imagen 3', provider: 'google', baseCostTc: 12, isActive: true, priority: 2 },
    { modelId: 'flux-dev', name: 'Flux Dev', provider: 'fal', baseCostTc: 20, isActive: true, priority: 3 },
    { modelId: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', baseCostTc: 60, isActive: true, priority: 4 },

    // Audio IAs
    { modelId: 'google-tts', name: 'Google Text-to-Speech', provider: 'google', baseCostTc: 5, isActive: true, priority: 1 },
    { modelId: 'openai-tts', name: 'OpenAI TTS', provider: 'openai', baseCostTc: 15, isActive: true, priority: 2 },
    { modelId: 'elevenlabs', name: 'ElevenLabs Speech', provider: 'elevenlabs', baseCostTc: 50, isActive: true, priority: 3 },

    // Video IAs
    { modelId: 'ltx-video', name: 'LTX Video', provider: 'fal', baseCostTc: 30, isActive: true, priority: 1 },
    { modelId: 'wan-video', name: 'Wan Video', provider: 'fal', baseCostTc: 50, isActive: true, priority: 2 },
    { modelId: 'runway-gen3', name: 'Runway Gen-3', provider: 'runway', baseCostTc: 200, isActive: true, priority: 3 }
  ]
};

export class TaceEngine {
  private static CONFIG_KEY = 'tace_engine_config';
  private static TRANSACTIONS_KEY = 'tace_transactions';
  private static CACHE_KEY = 'tace_generation_cache';

  // Load Admin configurable weights
  public static getConfig(): TaceEngineConfig {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading TACE config:", e);
    }
    return DEFAULT_CONFIG;
  }

  public static saveConfig(config: TaceEngineConfig): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  // Cost calculation based on weights
  public static calculateCost(
    resource: TaceResourceType,
    quality: TaceQuality,
    resolution: TaceResolution,
    modelId: string,
    quantity: number = 1
  ): number {
    const config = this.getConfig();
    
    const baseCost = config.resourceBaseCosts[resource] || 10;
    const qualityMultiplier = config.qualityWeights[quality] || 1.0;
    const resolutionMultiplier = config.resolutionWeights[resolution] || 1.0;
    
    const model = config.models.find(m => m.modelId === modelId);
    const modelCost = model ? model.baseCostTc : 10;

    // Dinamic calculation combining all weights
    const totalCost = Math.round(
      (baseCost + modelCost) * qualityMultiplier * resolutionMultiplier * quantity
    );

    return totalCost;
  }

  // Deduct credits and log transaction
  public static deductCredits(
    userId: string,
    resource: TaceResourceType,
    quality: TaceQuality,
    resolution: TaceResolution,
    modelId: string,
    quantity: number = 1
  ): { success: boolean; cost: number; remaining: number; message: string } {
    const cost = this.calculateCost(resource, quality, resolution, modelId, quantity);
    
    // Get subscription specific to the user
    const subKey = userId && userId !== 'anonimo' ? `toontales_subscription_${userId}` : 'toontales_subscription';
    let subSaved = localStorage.getItem(subKey);
    
    // Backwards compatibility migration
    if (!subSaved && userId && userId !== 'anonimo') {
      const globalSaved = localStorage.getItem('toontales_subscription');
      if (globalSaved) {
        subSaved = globalSaved;
        localStorage.setItem(subKey, globalSaved);
      }
    }

    if (!subSaved) {
      const defaultSub = {
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
      localStorage.setItem(subKey, JSON.stringify(defaultSub));
      subSaved = JSON.stringify(defaultSub);
    }

    const sub = JSON.parse(subSaved);
    // Admin has unlimited bypass
    const isAdmin = userId === 'nogueiralfha@gmail.com';
    
    // In TACE, we represent balance in TC
    // By default, if the user doesn't have credit balance field, convert plan limits or give default balance
    let currentBalance = sub.oneTimeCredits ? sub.oneTimeCredits * 300 : 0;
    
    if (sub.planType === 'free') {
      currentBalance += 0; // default free starter credits is 0 TC, forcing subscription or purchase
    } else if (sub.planType === 'hero') {
      currentBalance += 1500;
    } else if (sub.planType === 'professional') {
      currentBalance += 5000;
    } else if (sub.planType === 'legendary') {
      currentBalance += 12000;
    }

    // Deduct usage
    const consumed = sub.usage?.taceCreditsConsumed || 0;
    const available = currentBalance - consumed;

    if (!isAdmin && available < cost) {
      return { 
        success: false, 
        cost, 
        remaining: available, 
        message: `Saldo insuficiente! Essa operação necessita de ${cost} TC, mas você possui apenas ${available} TC. Cadastre-se ou assine um plano para continuar.` 
      };
    }

    // Deduct and save
    if (!isAdmin) {
      const updatedSub = {
        ...sub,
        usage: {
          ...sub.usage,
          taceCreditsConsumed: consumed + cost
        }
      };
      localStorage.setItem(subKey, JSON.stringify(updatedSub));
    }

    // Save transaction log
    this.logTransaction({
      id: Math.random().toString(36).substring(2, 9),
      userId,
      resourceType: resource,
      quality,
      modelId,
      creditsConsumed: cost,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return { 
      success: true, 
      cost, 
      remaining: isAdmin ? 999999 : available - cost, 
      message: "Créditos debitados com sucesso." 
    };
  }

  // Get active model based on preferences and plan
  public static selectBestModel(resource: TaceResourceType, quality: TaceQuality): TaceModelWeight {
    const config = this.getConfig();
    
    // Filter active models for the resource type
    let filtered = config.models.filter(m => {
      if (!m.isActive) return false;
      if (resource === 'story' && (m.modelId.includes('gemini') || m.modelId.includes('gpt-4'))) return true;
      if (resource === 'coloring' && (m.modelId.includes('flux') || m.modelId.includes('imagen') || m.modelId.includes('dall-e'))) return true;
      if (resource === 'video' && m.modelId.includes('video')) return true;
      if (resource === 'audio' && m.modelId.includes('tts')) return true;
      return false;
    });

    // Default sorting by priority
    filtered.sort((a, b) => a.priority - b.priority);

    // Economical plans get first priority models (cheapest ones)
    if (quality === 'economica') {
      return filtered[0] || config.models[0];
    }
    
    // Premium/Cinema quality gets premium models
    if (quality === 'premium' || quality === 'cinema') {
      const premiumModels = filtered.filter(m => m.baseCostTc >= 20);
      if (premiumModels.length > 0) return premiumModels[0];
    }

    return filtered[Math.min(filtered.length - 1, 1)] || config.models[0];
  }

  // Transaction Logs
  public static getTransactions(): TaceTransaction[] {
    try {
      const saved = localStorage.getItem(this.TRANSACTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }

  private static logTransaction(tx: TaceTransaction): void {
    const transactions = this.getTransactions();
    transactions.unshift(tx);
    // Keep max 100 transactions for storage limits
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions.slice(0, 100)));
  }

  // Cache System to avoid duplicate generation costs
  public static checkCache(key: string): any | null {
    try {
      const cacheData = localStorage.getItem(`${this.CACHE_KEY}_${key}`);
      if (cacheData) {
        const item = JSON.parse(cacheData);
        // 48 hour cache expiry
        if (Date.now() - item.timestamp < 48 * 60 * 60 * 1000) {
          return item.data;
        }
      }
    } catch (e) {}
    return null;
  }

  public static setCache(key: string, data: any): void {
    try {
      const cacheItem = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(`${this.CACHE_KEY}_${key}`, JSON.stringify(cacheItem));
    } catch (e) {}
  }
}
