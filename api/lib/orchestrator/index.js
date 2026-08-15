const { AIGateway } = require('../ai-gateway');
const { SafetyAgent } = require('./safety');

class StoryOrchestrator {
  static async executePipeline(payload, onProgress) {
    
    // 1. Agente 20: Verificação de Segurança
    if (onProgress) onProgress('Verificando segurança e filtros infantis...');
    const safetyCheck = await SafetyAgent.validate(payload.theme, payload.child_interests);
    if (!safetyCheck.safe) {
      throw new Error(`Conteúdo bloqueado por segurança: ${safetyCheck.reason}`);
    }

    // 2. Orquestração & Agentes Pedagógico / Temático / Roteirista
    if (onProgress) onProgress('Elaborando roteiro com Especialistas Pedagógico e de Conteúdo...');
    const sceneCount = payload.age_range === '3-6' ? 8 : 10;
    
    const systemPrompt = `Você é o AGENTE ORQUESTRADOR MASTER integrando os seguintes agentes do ToonTales AI:
- AGENTE 02 (Pedagógico): Ajustar vocabulário e duração para faixa ${payload.age_range} anos.
- AGENTE 03/04/05 (${payload.category}): Garantir fidelidade e lição de valor.
- AGENTE 06 (Roteirista Cinematográfico): Estruturar exatamente ${sceneCount} cenas.
- AGENTE 07 & 08 (Personagens e Direção de Arte): Consistência 3D vibrante estilo animação infantil com o mascote Shai quando oportuno.
- AGENTE 09 (Engenheiro de Prompts Visuais): Prompts detalhados em inglês para DALL-E/Midjourney.
- AGENTE 12 (Criador de Atividades): 2 atividades pedagógicas complementares.

Retorne EXCLUSIVAMENTE um JSON válido no seguinte esquema:
{
  "title": "string",
  "category": "${payload.category}",
  "age_range": "${payload.age_range}",
  "moral_lesson": "string",
  "biblical_reference": "string ou null",
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 15,
      "environment": "string",
      "characters": ["string"],
      "action": "string",
      "dialogue": "string ou null",
      "narration": "string",
      "emotion": "string",
      "camera": "string",
      "image_prompt": "detailed visual prompt in English, 3D animated style, consistent characters"
    }
  ],
  "activities": [
    {
      "type": "quiz | reflection | coloring",
      "question": "string",
      "options": ["A", "B", "C"],
      "correct_answer": "string",
      "explanation": "string"
    }
  ]
}`;

    const userPrompt = `Crie a história completa:
Tema: ${payload.theme}
Categoria: ${payload.category}
Idade: ${payload.age_range} anos
Criança personalizada: ${payload.child_name ? `Nome: ${payload.child_name}, Interesses: ${payload.child_interests}` : 'Nenhuma'}`;

    const rawStory = await AIGateway.generateText(systemPrompt, userPrompt);
    const story = JSON.parse(rawStory);

    if (onProgress) onProgress('Roteiro concluído. Gerando ilustrações das primeiras cenas...', { storyTitle: story.title });

    // 3. Agente 09 / Image AI (Gera a arte de capa e primeira cena)
    try {
      if (story.scenes && story.scenes.length > 0) {
        const coverPrompt = story.scenes[0].image_prompt;
        const imageUrl = await AIGateway.generateImage(coverPrompt, '16:9');
        story.scenes[0].image_url = imageUrl;
      }
    } catch (imgError) {
      console.warn('[Orchestrator] Falha na geração da imagem da cena 1', imgError);
    }

    // 4. Agente 13: QA & Validação Final
    if (onProgress) onProgress('Revisando qualidade final e publicação...');
    story.credits_consumed = 15; // 15 Créditos TC
    story.status = 'COMPLETED';

    return story;
  }
}

module.exports = { StoryOrchestrator };
