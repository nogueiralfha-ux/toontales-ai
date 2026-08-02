export interface GeminiOpportunityResult {
  diagnostico: string;
  necessidade: string;
  urgencia: string;
  potencialMercado: string;
  solucoes: {
    categoria: string;
    titulo: string;
    descricao: string;
  }[];
  modeloNegocio: string;
  estrategia: string;
  fasesExecucao: string[];
  potencialCrescimento: string;
  proximosPassos: string[];
  riscos: string[];
  sugestoesMelhoria: string[];
  notas: {
    dor: number;
    urgencia: number;
    mercado: number;
    solucao: number;
    monetizacao: number;
    escalabilidade: number;
    concorrencia: number;
    potencial: number;
    idh: number;
    iso: number;
    final: number;
  };
}

// Lê a chave de API de forma segura a partir das variáveis de ambiente do Vite
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 


export const analyzeWithGemini = async (promptInput: string): Promise<GeminiOpportunityResult> => {
  const systemPrompt = `Você é o R.I.O. (Radar Inteligente de Oportunidades), o principal cérebro estratégico do A.I.O.
Sua tarefa é analisar o perfil do usuário ou desconstruir o concorrente fornecido e gerar um plano de negócio estruturado em formato JSON exato.

IMPORTANTE: Retorne APENAS o objeto JSON puro, sem marcações de markdown como \`\`\`json ou explicações antes ou depois.

O JSON deve seguir rigorosamente a estrutura abaixo:
{
  "diagnostico": "Explicação macro da oportunidade em linguagem simples.",
  "necessidade": "Título resumido do negócio/serviço local recomendado.",
  "urgencia": "Nota de urgência (ex: '92/100 - Altíssima').",
  "potencialMercado": "Estimativa simples de faturamento ou mercado local.",
  "solucoes": [
    {
      "categoria": "Tipo (ex: Automação/SaaS)",
      "titulo": "Nome da Solução",
      "descricao": "Como funciona"
    }
  ],
  "modeloNegocio": "Como cobrar mensalmente por esse serviço.",
  "estrategia": "Estratégia de vendas de baixo custo para conseguir clientes locais.",
  "fasesExecucao": [
    "Fase 1: Descrição da fase",
    "Fase 2: Descrição da fase",
    "Fase 3: Descrição da fase",
    "Fase 4: Descrição da fase",
    "Fase 5: Descrição da fase",
    "Fase 6: Descrição da fase",
    "Fase 7: Descrição da fase",
    "Fase 8: Descrição da fase",
    "Fase 9: Descrição da fase",
    "Fase 10: Descrição da fase"
  ],
  "potencialCrescimento": "Como expandir a ideia no futuro.",
  "proximosPassos": [
    "Primeira ação simples",
    "Segunda ação simples",
    "Terceira ação simples"
  ],
  "riscos": [
    "Dificuldade ou risco 1",
    "Dificuldade ou risco 2"
  ],
  "sugestoesMelhoria": [
    "Ideia de evolução 1",
    "Ideia de evolução 2"
  ],
  "notas": {
    "dor": 90,
    "urgencia": 85,
    "mercado": 80,
    "solucao": 75,
    "monetizacao": 85,
    "escalabilidade": 80,
    "concorrencia": 70,
    "potencial": 85,
    "idh": 80,
    "iso": 85,
    "final": 83
  }
}`;

  if (!GEMINI_API_KEY) {
    // Fallback inteligente caso a chave não esteja presente para garantir funcionamento imediato
    throw new Error("Chave do Gemini não configurada.");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nAnalise o seguinte input e gere o diagnóstico:\n${promptInput}` }]
          }
        ]
      })
    });

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Limpa possíveis marcações adicionais que a IA colocar
    const cleanedJsonText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedJsonText);
  } catch (error) {
    console.error("Erro na chamada da API do Gemini:", error);
    throw error;
  }
};
