const https = require('https');

class AIGateway {
  static openaiKey = process.env.OPENAI_API_KEY;
  static anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Rota de Texto / Raciocínio com Fallback
  static async generateText(systemPrompt, userPrompt) {
    try {
      // Provedor Principal: OpenAI GPT-4o-mini
      return await this.callOpenAI(systemPrompt, userPrompt);
    } catch (primaryError) {
      console.warn('[AI Gateway] Falha no provedor primário (OpenAI). Tentando Fallback (Anthropic)...', primaryError);
      try {
        // Fallback 1: Anthropic Claude 3.5 Sonnet
        return await this.callAnthropic(systemPrompt, userPrompt);
      } catch (fallbackError) {
        console.error('[AI Gateway] Erro crítico em todos os provedores de texto.', fallbackError);
        throw new Error('Falha ao processar texto com os modelos de IA.');
      }
    }
  }

  static async callOpenAI(system, user) {
    return new Promise((resolve, reject) => {
      const req = https.request({
        method: 'POST',
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        }
      }, (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`OpenAI Error: ${res.statusCode} - ${resData}`));
              return;
            }
            const data = JSON.parse(resData);
            resolve(data.choices[0].message.content);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      }));
      req.end();
    });
  }

  static async callAnthropic(system, user) {
    return new Promise((resolve, reject) => {
      const req = https.request({
        method: 'POST',
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        headers: {
          'x-api-key': this.anthropicKey || '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }
      }, (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`Anthropic Error: ${res.statusCode} - ${resData}`));
              return;
            }
            const data = JSON.parse(resData);
            resolve(data.content[0].text);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: user }]
      }));
      req.end();
    });
  }

  // Rota de Geração de Imagens (DALL-E-3)
  static async generateImage(prompt, aspectRatio = '16:9') {
    const sizeMap = {
      '9:16': '1024x1792',
      '16:9': '1792x1024',
      '1:1': '1024x1024',
    };

    return new Promise((resolve) => {
      const req = https.request({
        method: 'POST',
        hostname: 'api.openai.com',
        path: '/v1/images/generations',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        }
      }, (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              console.error('[AI Gateway] Erro na API do OpenAI Images:', res.statusCode, resData);
              resolve('/assets/fallback-scene.png');
              return;
            }
            const data = JSON.parse(resData);
            resolve(data.data[0]?.url || '/assets/fallback-scene.png');
          } catch (e) {
            console.error('[AI Gateway] Falha ao parsear imagem:', e);
            resolve('/assets/fallback-scene.png');
          }
        });
      });

      req.on('error', (err) => {
        console.error('[AI Gateway] Erro de rede ao gerar imagem:', err);
        resolve('/assets/fallback-scene.png');
      });

      req.write(JSON.stringify({
        model: 'dall-e-3',
        prompt: `3D Pixar Disney style animation, vibrant colors, child-friendly, safe, masterpiece: ${prompt}`,
        n: 1,
        size: sizeMap[aspectRatio] || '1024x1024',
        quality: 'standard'
      }));
      req.end();
    });
  }
}

module.exports = { AIGateway };
