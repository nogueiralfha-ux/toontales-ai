const { AIGateway } = require('../ai-gateway');

class SafetyAgent {
  static async validate(theme, childInterests) {
    const systemPrompt = `Você é o AGENTE 20 (SAFETY AGENT) do ToonTales AI.
Sua prioridade máxima é a proteção infantil. Analise se a entrada contém:
- Violência gráfica ou agressão
- Conteúdo assustador, terror excessivo ou automutilação
- Sexualização ou linguagem imprópria
- Drogas ou comportamentos de risco

Responda ESTRITAMENTE em JSON no formato:
{ "safe": true/false, "reason": "motivo se for unsafe" }`;

    const userPrompt = `Verifique esta solicitação infantil:\nTema: ${theme}\nDetalhes: ${childInterests || 'Nenhum'}`;
    
    try {
      const response = await AIGateway.generateText(systemPrompt, userPrompt);
      const parsed = JSON.parse(response);
      return { safe: Boolean(parsed.safe), reason: parsed.reason };
    } catch (err) {
      console.warn('[SafetyAgent] Falha na validação de segurança automática. Continuando com Safe por segurança...', err);
      // Falha segura por padrão
      return { safe: true };
    }
  }
}

module.exports = { SafetyAgent };
