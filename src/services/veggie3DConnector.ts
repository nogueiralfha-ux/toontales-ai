/**
 * Conector e Mapeador de Integração 3D / APIs de IA do Veggie World.
 * Esta classe define as pontes de comunicação entre a Camada 1 (Web Hub)
 * e as chaves de API necessárias para modelos 3D e vozes de narração.
 */

export interface AI3DModelRequest {
  vegetableType: string;
  gender: 'M' | 'F';
  sportType: 'football' | 'basketball' | 'volleyball' | 'baseball' | 'tennis' | 'racing' | 'aqua';
  stylePrompt: string;
}

export class Veggie3DConnector {
  private static ELEVENLABS_API_KEY = ''; // Inserir chave de API da ElevenLabs para voz
  private static TRIPO3D_API_KEY = ''; // Inserir chave de API da Tripo3D/Meshy para modelos 3D

  /**
   * Mapeamento de assets 3D locais (Godot/Three.js) para cada atleta e esporte.
   * Contém as referências para os modelos rigados masculinos e femininos.
   */
  static getAsset3DMapping(visualId: string): {
    modelPath: string;
    skeletonType: 'MALE_ATHLETE' | 'FEMALE_ATHLETE';
    texturePath: string;
    animations: string[];
  } {
    const mappings: Record<string, any> = {
      // Atletas Femininas
      'carrot_female_football': {
        modelPath: '/assets/models/carrot_female.gltf',
        skeletonType: 'FEMALE_ATHLETE',
        texturePath: '/assets/textures/carrot_jersey_green.png',
        animations: ['run', 'dribble', 'shoot', 'celebrate_girl', 'idle']
      },
      'broccoli_female_football': {
        modelPath: '/assets/models/broccoli_female.gltf',
        skeletonType: 'FEMALE_ATHLETE',
        texturePath: '/assets/textures/broccoli_jersey_yellow.png',
        animations: ['run', 'pass', 'tackle', 'celebrate_girl', 'idle']
      },
      'tomato_female_football': {
        modelPath: '/assets/models/tomato_female.gltf',
        skeletonType: 'FEMALE_ATHLETE',
        texturePath: '/assets/textures/tomato_jersey_blue.png',
        animations: ['run', 'curve_shoot', 'celebrate_girl', 'idle']
      },
      'cucumber_female_football': {
        modelPath: '/assets/models/cucumber_female.gltf',
        skeletonType: 'FEMALE_ATHLETE',
        texturePath: '/assets/textures/cucumber_jersey_white.png',
        animations: ['run', 'intercept', 'celebrate_girl', 'idle']
      },

      // Atletas Masculinos
      'potato_male_football': {
        modelPath: '/assets/models/potato_male.gltf',
        skeletonType: 'MALE_ATHLETE',
        texturePath: '/assets/textures/potato_jersey_brown.png',
        animations: ['run', 'block_tackle', 'power_shoot', 'celebrate_boy', 'idle']
      },
      'corn_male_football': {
        modelPath: '/assets/models/corn_male.gltf',
        skeletonType: 'MALE_ATHLETE',
        texturePath: '/assets/textures/corn_jersey_green.png',
        animations: ['run', 'header_jump', 'celebrate_boy', 'idle']
      },
      'pepper_male_football': {
        modelPath: '/assets/models/pepper_male.gltf',
        skeletonType: 'MALE_ATHLETE',
        texturePath: '/assets/textures/pepper_jersey_red.png',
        animations: ['run', 'spicy_dribble', 'celebrate_boy', 'idle']
      }
    };

    return mappings[visualId] || {
      modelPath: '/assets/models/default_vegetable.gltf',
      skeletonType: 'MALE_ATHLETE',
      texturePath: '/assets/textures/default_jersey.png',
      animations: ['run', 'pass', 'shoot', 'idle']
    };
  }

  /**
   * Simula a chamada da API de geração de voz para o narrador (ElevenLabs).
   * Em produção, isso envia o texto em português e retorna a URL do áudio gerado por IA.
   */
  static async fetchNarratorVoice(text: string): Promise<string> {
    if (!this.ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API Key não configurada. Usando fallback de áudio sintético local.');
      return '';
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-id-narrador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.75, similarity_boost: 0.85 }
        })
      });

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao gerar voz do narrador:', error);
      return '';
    }
  }

  /**
   * Conexão para API de Geração de Modelos 3D (Tripo3D/Meshy) para novos legumes personalizados.
   */
  static async requestGenerate3DModel(request: AI3DModelRequest): Promise<string> {
    if (!this.TRIPO3D_API_KEY) {
      console.warn('Tripo3D API Key não configurada. Simulação de geração 3D ativada.');
      return `/assets/models/mock_generated_${request.vegetableType.toLowerCase()}.gltf`;
    }

    try {
      const response = await fetch('https://api.tripo3d.ai/v1/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.TRIPO3D_API_KEY}`
        },
        body: JSON.stringify({
          type: 'text_to_model',
          prompt: `A beautiful 3D cartoon style anthropomorphic ${request.vegetableType} athlete, ${request.gender === 'F' ? 'female' : 'male'}, wearing a custom ${request.sportType} sports uniform jersey, game asset, clean mesh, optimized for game engines.`
        })
      });

      const data = await response.json();
      return data.output_model_url || '';
    } catch (error) {
      console.error('Erro na geração do modelo 3D:', error);
      return '';
    }
  }
}
export default Veggie3DConnector;
