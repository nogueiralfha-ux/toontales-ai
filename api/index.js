import https from 'https';

// Helper for Asaas Requests
async function asaasRequest(method, path, body = null) {
  const asaasKey = process.env.ASAAS_API_KEY;
  const asaasUrl = process.env.ASAAS_API_URL || process.env['URL da API ASAAS'] || 'https://api.asaas.com/v3';
  const hostname = asaasUrl.replace('https://', '').split('/')[0];

  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      hostname: hostname,
      path: `/v3${path}`,
      headers: {
        'access_token': asaasKey,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resData);
          if (res.statusCode >= 400) {
            reject({ statusCode: res.statusCode, ...parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ statusCode: res.statusCode, error: 'JSON inválido retornado pelo Asaas' });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Helper para geração com Gemini
async function generateTextWithGemini(modelName, apiKey, promptSystem, userInstruction) {
  return new Promise((resolve, reject) => {
    const reqPost = https.request({
      method: 'POST',
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/${modelName}:generateContent?key=${apiKey}`,
      headers: { 'Content-Type': 'application/json' }
    }, (resPost) => {
      let resData = '';
      resPost.on('data', chunk => resData += chunk);
      resPost.on('end', () => {
        try {
          resolve(JSON.parse(resData));
        } catch (e) {
          reject(new Error("Erro de parse da resposta do Gemini"));
        }
      });
    });
    reqPost.on('error', reject);
    reqPost.write(JSON.stringify({
      contents: [{ parts: [{ text: `${promptSystem}\n\nInstrução:\n${userInstruction}` }] }],
      generationConfig: { responseMimeType: "application/json" }
    }));
    reqPost.end();
  });
}

// Helper para geração com OpenAI
async function generateTextWithOpenAI(modelName, apiKey, promptSystem, userInstruction) {
  return new Promise((resolve, reject) => {
    const reqPost = https.request({
      method: 'POST',
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }, (resPost) => {
      let resData = '';
      resPost.on('data', chunk => resData += chunk);
      resPost.on('end', () => {
        try {
          resolve(JSON.parse(resData));
        } catch (e) {
          reject(new Error("Erro de parse da resposta da OpenAI"));
        }
      });
    });
    reqPost.on('error', reject);
    reqPost.write(JSON.stringify({
      model: modelName,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: userInstruction }
      ]
    }));
    reqPost.end();
  });
}

// Helper para upload de imagens base64 para a CDN do Fal.ai
async function uploadBase64ToFal(base64Data, falKey) {
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const fileBuffer = Buffer.from(cleanBase64, 'base64');
  
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  
  const requestBody = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    fileBuffer,
    Buffer.from(footer, 'utf-8')
  ]);

  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'POST',
      hostname: 'files.fal.run',
      path: '/upload',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': requestBody.length
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resData);
          if (parsed.url) {
            resolve(parsed.url);
          } else {
            reject(new Error("Fal upload failed: " + resData));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, access_token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 1. Create PIX Payment
    if (req.method === 'POST' && pathname === '/api/create-pix') {
      const { price, planName, email } = req.body;

      // Create or find Customer on Asaas
      console.log(`[Asaas] Criando cliente: ${email}...`);
      const customer = await asaasRequest('POST', '/customers', {
        name: `Assinante ToonTales - ${email.split('@')[0]}`,
        email: email,
        notificationDisabled: true
      });

      // Create Pix Payment
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDateStr = tomorrow.toISOString().split('T')[0];

      console.log(`[Asaas] Criando cobrança PIX de R$ ${price} para o cliente ${customer.id}...`);
      const payment = await asaasRequest('POST', '/payments', {
        customer: customer.id,
        billingType: 'PIX',
        value: price,
        dueDate: dueDateStr,
        description: `Plano ${planName} - ToonTales AI`,
        externalReference: `plan_${planName.toLowerCase()}`
      });

      // Fetch Pix QR Code details
      console.log(`[Asaas] Gerando QR Code para pagamento ${payment.id}...`);
      const qrCode = await asaasRequest('GET', `/payments/${payment.id}/pixQrCode`);

      return res.status(200).json({
        paymentId: payment.id,
        qrCodeImage: qrCode.encodedImage, // Base64 image
        copyPasteCode: qrCode.payload,    // Pix copy-paste key
        price: payment.value,
        status: payment.status
      });
    }

    // 2. Check Payment Status
    else if (req.method === 'GET' && pathname === '/api/check-payment') {
      const paymentId = url.searchParams.get('paymentId');
      if (!paymentId) {
        return res.status(400).json({ error: 'paymentId é obrigatório' });
      }

      console.log(`[Asaas] Verificando status do pagamento: ${paymentId}...`);
      const payment = await asaasRequest('GET', `/payments/${paymentId}`);
      
      return res.status(200).json({
        paymentId: payment.id,
        status: payment.status, 
        isPaid: payment.status === 'RECEIVED' || payment.status === 'CONFIRMED'
      });
    }

    // 3. Generate Story using Real AI APIs (OpenAI + Fal.ai/Replicate)
    else if (req.method === 'POST' && pathname === '/api/generate-story') {
      const { theme, ageGroup, prompt, childPhoto, parentPhoto, modelId, imageModelId } = req.body;

      const openAiKey = process.env.OPENAI_API_KEY;
      const replicateKey = process.env.REPLICATE_API_KEY;
      const falKey = process.env.FAL_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      const hasTextKey = (openAiKey && !openAiKey.includes('sua_chave')) || (geminiKey && !geminiKey.includes('sua_chave'));
      const hasImageKey = (replicateKey && !replicateKey.includes('sua_chave')) || (falKey && !falKey.includes('sua_chave')) || (geminiKey && !geminiKey.includes('sua_chave'));

      if (!hasTextKey || !hasImageKey) {
        console.log("[AI Proxy] Chaves não configuradas. Executando fallback mockado...");
        return res.status(200).json({ status: 'fallback_mock' });
      }

      // System Prompt
      const promptSystem = `Você é um escritor profissional de histórias infantis lúdicas e edificantes. 
Você DEVE retornar a resposta estritamente no formato JSON, sem crases markdown ou qualquer texto adicional. 
Estrutura do JSON esperado:
{
  "title": "Título criativo e educativo",
  "moralLesson": "Uma lição de vida bonita que resume a moral da história para a criança",
  "bibleReference": "Se o tema for Bíblico, inclua o livro e versículo correspondentes, caso contrário deixe em branco ou descreva uma lição edificante",
  "scenes": [
    {
      "pageNumber": 1,
      "text": "Texto da cena lúdica adaptado para a faixa etária especificada",
      "illustrationPrompt": "Prompt em inglês ultra descritivo e colorido para gerar a ilustração desta cena no estilo desenho animado infantil, 3D claymation ou cartoon vibrante."
    }
  ]
}`;

      const userInstruction = `Escreva uma história no tema "${theme}" para o público de faixa etária "${ageGroup}" anos.
A ideia principal da história é: "${prompt}".
Gere exatamente ${ageGroup === '2-6' ? 8 : ageGroup === '7-12' ? 12 : 16} cenas completas.
Lembre-se: os personagens devem ser educativos e sem qualquer termo relacionado a "mágica" ou "magia".`;

      let storyTextData;
      let rawContent = '';
      let usedFallback = false;

      // Dynamic AI Routing based on TACE selection
      const useGemini = modelId ? modelId.startsWith('gemini') : (geminiKey && !geminiKey.includes('sua_chave'));
      
      if (useGemini) {
        const geminiModel = 'gemini-2.0-flash';
        console.log(`[AI Proxy TACE] Gerando texto com Google Gemini (${geminiModel})...`);
        try {
          const geminiResponse = await generateTextWithGemini(geminiModel, geminiKey, promptSystem, userInstruction);
          if (geminiResponse.candidates && geminiResponse.candidates[0] && geminiResponse.candidates[0].content && geminiResponse.candidates[0].content.parts[0]) {
            rawContent = geminiResponse.candidates[0].content.parts[0].text;
          } else if (geminiResponse.error) {
            throw new Error(geminiResponse.error.message || "Erro da API do Gemini");
          } else {
            throw new Error("Gemini não retornou candidates válidos: " + JSON.stringify(geminiResponse));
          }
        } catch (err) {
          console.warn("Google Gemini falhou. Tentando OpenAI como fallback...", err);
          if (openAiKey && !openAiKey.includes('sua_chave')) {
            try {
              const openAiResponse = await generateTextWithOpenAI('gpt-4o-mini', openAiKey, promptSystem, userInstruction);
              if (openAiResponse.choices && openAiResponse.choices[0]) {
                rawContent = openAiResponse.choices[0].message.content;
                usedFallback = true;
              } else {
                throw new Error("Resposta da OpenAI vazia ou inválida.");
              }
            } catch (openaiErr) {
              console.error("OpenAI fallback também falhou:", openaiErr);
              throw new Error(`Ambos os serviços de IA (Gemini e OpenAI) falharam. Detalhe Gemini: ${err.message || JSON.stringify(err)} | Detalhe OpenAI: ${openaiErr.message || JSON.stringify(openaiErr)}`);
            }
          } else {
            throw new Error(`Google Gemini falhou: ${err.message || JSON.stringify(err)}. OpenAI não está configurada.`);
          }
        }
      } else {
        const openAiModel = modelId === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini';
        console.log(`[AI Proxy TACE] Gerando texto com OpenAI GPT (${openAiModel})...`);
        try {
          const openAiResponse = await generateTextWithOpenAI(openAiModel, openAiKey, promptSystem, userInstruction);
          
          if (openAiResponse.error) {
            throw new Error(openAiResponse.error.message || "Erro na cota da OpenAI");
          }
          
          rawContent = openAiResponse.choices[0].message.content;
        } catch (err) {
          console.warn("OpenAI falhou (provavelmente sem créditos). Tentando Google Gemini 1.5 Flash como fallback...", err);
          if (geminiKey && !geminiKey.includes('sua_chave')) {
            try {
              const geminiResponse = await generateTextWithGemini('gemini-2.0-flash', geminiKey, promptSystem, userInstruction);
              if (geminiResponse.candidates && geminiResponse.candidates[0] && geminiResponse.candidates[0].content && geminiResponse.candidates[0].content.parts[0]) {
                rawContent = geminiResponse.candidates[0].content.parts[0].text;
                usedFallback = true;
              } else if (geminiResponse.error) {
                throw new Error(geminiResponse.error.message || "Erro da API do Gemini");
              } else {
                throw new Error("Gemini não retornou candidates válidos: " + JSON.stringify(geminiResponse));
              }
            } catch (geminiErr) {
              console.error("Gemini fallback também falhou:", geminiErr);
              throw new Error(`Ambos os serviços de IA (OpenAI e Gemini) falharam. Detalhe OpenAI: ${err.message || JSON.stringify(err)} | Detalhe Gemini: ${geminiErr.message || JSON.stringify(geminiErr)}`);
            }
          } else {
            throw new Error(`OpenAI falhou: ${err.message || JSON.stringify(err)}. Google Gemini não está configurado.`);
          }
        }
      }

      // Parse JSON com sanitização de crases
      try {
        let cleanText = rawContent.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        }
        storyTextData = JSON.parse(cleanText);
      } catch (errParse) {
        console.error("Erro ao fazer parse da resposta da IA:", errParse, "Conteúdo:", rawContent);
        throw new Error("Falha ao processar o formato JSON da história: " + errParse.message + " | Resposta bruta: " + rawContent.substring(0, 100));
      }
      // Upload preliminar de fotos locais de rosto para a CDN do Fal.ai
      let publicPhotoUrl = null;
      if ((childPhoto || parentPhoto) && falKey && !falKey.includes('sua_chave')) {
        try {
          console.log("[AI Proxy] Detectada foto local para consistência. Fazendo upload para CDN do Fal.ai...");
          const photoToUpload = childPhoto || parentPhoto;
          if (photoToUpload.startsWith('data:')) {
            publicPhotoUrl = await uploadBase64ToFal(photoToUpload, falKey);
            console.log("[AI Proxy] Upload de foto concluído com sucesso. URL pública:", publicPhotoUrl);
          } else {
            publicPhotoUrl = photoToUpload;
          }
        } catch (uploadErr) {
          console.error("[AI Proxy] Falha no upload preliminar da foto de rosto:", uploadErr);
        }
      }

      // Generate illustrations and voice in parallel
      const scenesPromises = storyTextData.scenes.map(async (scene) => {
        let imageUrl = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600';
        let audioUrl = '';

        // Step A: Generate Image
        try {
          if (scene.pageNumber > 1) {
            imageUrl = '';
          } else {
            const useImagen = imageModelId === 'imagen-3' || (!falKey && geminiKey);
          
          if (useImagen && geminiKey && !geminiKey.includes('sua_chave')) {
            console.log(`[AI Proxy] Gerando imagem para cena ${scene.pageNumber} via Google Imagen 3...`);
            const promptValue = `${scene.illustrationPrompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`;
            
            const imagenResponse = await new Promise((resolve, reject) => {
              const reqPost = https.request({
                method: 'POST',
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
                headers: { 'Content-Type': 'application/json' }
              }, (resPost) => {
                let resData = '';
                resPost.on('data', chunk => resData += chunk);
                resPost.on('end', () => {
                  try {
                    resolve(JSON.parse(resData));
                  } catch (e) {
                    reject(e);
                  }
                });
              });
              reqPost.on('error', reject);
              reqPost.write(JSON.stringify({
                instances: [
                  {
                    prompt: promptValue
                  }
                ],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: "16:9",
                  outputMimeType: "image/jpeg"
                }
              }));
              reqPost.end();
            });

            if (imagenResponse.predictions && imagenResponse.predictions[0]) {
              imageUrl = `data:image/jpeg;base64,${imagenResponse.predictions[0].bytesBase64Encoded}`;
            } else if (imagenResponse.error) {
              throw new Error(imagenResponse.error.message || "Erro desconhecido do Google Imagen 3");
            } else {
              throw new Error("Imagen 3 não retornou dados de imagem in predictions.");
            }
          } else if (falKey && !falKey.includes('sua_chave')) {
            console.log(`[AI Proxy] Gerando imagem para cena ${scene.pageNumber} via Fal.ai...`);
            const isConsistent = !!publicPhotoUrl;
            const bodyObj = isConsistent ? {
              prompt: `${scene.illustrationPrompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`,
              reference_image_url: publicPhotoUrl,
              image_size: "landscape_16_9"
            } : {
              prompt: `${scene.illustrationPrompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`,
              image_size: "landscape_16_9"
            };

            const falResponse = await new Promise((resolve, reject) => {
              const reqPost = https.request({
                method: 'POST',
                hostname: 'fal.run',
                path: isConsistent ? '/fal-ai/flux-pulid' : '/fal-ai/flux/schnell',
                headers: {
                  'Authorization': `Key ${falKey}`,
                  'Content-Type': 'application/json'
                }
              }, (resPost) => {
                let resData = '';
                resPost.on('data', chunk => resData += chunk);
                resPost.on('end', () => resolve(JSON.parse(resData)));
              });
              reqPost.on('error', reject);
              reqPost.write(JSON.stringify(bodyObj));
              reqPost.end();
            });

            if (falResponse.images && falResponse.images[0]) {
              imageUrl = falResponse.images[0].url;
            }
          }
        }
      } catch (errImg) {
          console.error(`Fal.ai falhou, tentando Google Imagen 3 como contingência...`, errImg);
          try {
            if (geminiKey && !geminiKey.includes('sua_chave')) {
              console.log(`[AI Proxy Contingência] Gerando imagem para cena ${scene.pageNumber} via Google Imagen 3...`);
              const promptValue = `${scene.illustrationPrompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`;
              
              const imagenResponse = await new Promise((resolve, reject) => {
                const reqPost = https.request({
                  method: 'POST',
                  hostname: 'generativelanguage.googleapis.com',
                  path: `/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
                  headers: { 'Content-Type': 'application/json' }
                }, (resPost) => {
                  let resData = '';
                  resPost.on('data', chunk => resData += chunk);
                  resPost.on('end', () => {
                    try {
                      resolve(JSON.parse(resData));
                    } catch (e) {
                      reject(e);
                    }
                  });
                });
                reqPost.on('error', reject);
                reqPost.write(JSON.stringify({
                  instances: [
                    {
                      prompt: promptValue
                    }
                  ],
                  parameters: {
                    sampleCount: 1,
                    aspectRatio: "16:9",
                    outputMimeType: "image/jpeg"
                  }
                }));
                reqPost.end();
              });

              if (imagenResponse.predictions && imagenResponse.predictions[0]) {
                imageUrl = `data:image/jpeg;base64,${imagenResponse.predictions[0].bytesBase64Encoded}`;
                console.log(`[AI Proxy Contingência] Imagem gerada com sucesso via Google Imagen 3 para cena ${scene.pageNumber}!`);
              }
            }
          } catch (imagenErr) {
            console.error("Contingência do Google Imagen 3 também falhou:", imagenErr);
          }
        }

        // Step B: Generate Audio and convert to base64 Data URI (serverless friendly)
        try {
          if (openAiKey && !openAiKey.includes('sua_chave')) {
            console.log(`[AI Proxy] Gerando áudio via OpenAI TTS...`);
            const audioBuffer = await new Promise((resolve, reject) => {
              const reqPost = https.request({
                method: 'POST',
                hostname: 'api.openai.com',
                path: '/v1/audio/speech',
                headers: {
                  'Authorization': `Bearer ${openAiKey}`,
                  'Content-Type': 'application/json'
                }
              }, (resPost) => {
                const chunks = [];
                resPost.on('data', chunk => chunks.push(chunk));
                resPost.on('end', () => resolve(Buffer.concat(chunks)));
              });
              reqPost.on('error', reject);
              reqPost.write(JSON.stringify({
                model: 'tts-1',
                input: scene.text,
                voice: theme === 'Livre' ? 'fable' : 'nova'
              }));
              reqPost.end();
            });

            const base64Audio = audioBuffer.toString('base64');
            audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
          }
        } catch (errAudio) {
          console.error(`Erro ao gerar áudio:`, errAudio);
        }

        return {
          pageNumber: scene.pageNumber,
          text: scene.text,
          illustrationSvg: '',
          coloringSvg: '',
          illustrationUrl: imageUrl,
          coloringUrl: imageUrl,
          audioUrl: audioUrl
        };
      });

      const completedScenes = await Promise.all(scenesPromises);

      const finalStory = {
        id: Math.random().toString(36).substring(2, 11),
        title: storyTextData.title,
        theme: theme,
        ageGroup: ageGroup,
        createdAt: new Date().toISOString(),
        scenes: completedScenes,
        moralLesson: storyTextData.moralLesson,
        bibleReference: storyTextData.bibleReference,
        audioUrl: completedScenes[0]?.audioUrl || ''
      };

      return res.status(200).json(finalStory);
    }
    // 4. Generate Scene Image (Lazy-loaded for pages 2+)
    else if (req.method === 'POST' && pathname === '/api/generate-scene-image') {
      const { prompt, childPhoto, parentPhoto, imageModelId } = req.body;

      const falKey = process.env.FAL_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      let imageUrl = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600';

      // Upload preliminar de fotos locais de rosto para a CDN do Fal.ai
      let publicPhotoUrl = null;
      if ((childPhoto || parentPhoto) && falKey && !falKey.includes('sua_chave')) {
        try {
          console.log("[AI Proxy Scene] Fazendo upload de foto para CDN do Fal.ai...");
          const photoToUpload = childPhoto || parentPhoto;
          if (photoToUpload.startsWith('data:')) {
            publicPhotoUrl = await uploadBase64ToFal(photoToUpload, falKey);
            console.log("[AI Proxy Scene] Upload concluído:", publicPhotoUrl);
          } else {
            publicPhotoUrl = photoToUpload;
          }
        } catch (uploadErr) {
          console.error("[AI Proxy Scene] Falha no upload preliminar da foto de rosto:", uploadErr);
        }
      }

      try {
        const useImagen = imageModelId === 'imagen-3' || (!falKey && geminiKey);
        
        if (useImagen && geminiKey && !geminiKey.includes('sua_chave')) {
          console.log(`[AI Proxy Scene] Gerando imagem via Google Imagen 3...`);
          const promptValue = `${prompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`;
          
          const imagenResponse = await new Promise((resolve, reject) => {
            const reqPost = https.request({
              method: 'POST',
              hostname: 'generativelanguage.googleapis.com',
              path: `/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
              headers: { 'Content-Type': 'application/json' }
            }, (resPost) => {
              let resData = '';
              resPost.on('data', chunk => resData += chunk);
              resPost.on('end', () => {
                try { resolve(JSON.parse(resData)); } catch (e) { reject(e); }
              });
            });
            reqPost.on('error', reject);
            reqPost.write(JSON.stringify({
              instances: [{ prompt: promptValue }],
              parameters: { sampleCount: 1, aspectRatio: "16:9", outputMimeType: "image/jpeg" }
            }));
            reqPost.end();
          });

          if (imagenResponse.predictions && imagenResponse.predictions[0]) {
            imageUrl = `data:image/jpeg;base64,${imagenResponse.predictions[0].bytesBase64Encoded}`;
          } else if (imagenResponse.error) {
            throw new Error(imagenResponse.error.message || "Erro do Imagen 3");
          }
        } else if (falKey && !falKey.includes('sua_chave')) {
          console.log(`[AI Proxy Scene] Gerando imagem via Fal.ai...`);
          const isConsistent = !!publicPhotoUrl;
          const bodyObj = isConsistent ? {
            prompt: `${prompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`,
            reference_image_url: publicPhotoUrl,
            image_size: "landscape_16_9"
          } : {
            prompt: `${prompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`,
            image_size: "landscape_16_9"
          };

          const falResponse = await new Promise((resolve, reject) => {
            const reqPost = https.request({
              method: 'POST',
              hostname: 'fal.run',
              path: isConsistent ? '/fal-ai/flux-pulid' : '/fal-ai/flux/schnell',
              headers: {
                'Authorization': `Key ${falKey}`,
                'Content-Type': 'application/json'
              }
            }, (resPost) => {
              let resData = '';
              resPost.on('data', chunk => resData += chunk);
              resPost.on('end', () => resolve(JSON.parse(resData)));
            });
            reqPost.on('error', reject);
            reqPost.write(JSON.stringify(bodyObj));
            reqPost.end();
          });

          if (falResponse.images && falResponse.images[0]) {
            imageUrl = falResponse.images[0].url;
          }
        }
      } catch (errImg) {
        console.error(`Erro ao gerar imagem na contingência de cena:`, errImg);
        // Tenta Imagen 3 se Fal.ai falhou
        try {
          if (geminiKey && !geminiKey.includes('sua_chave')) {
            const promptValue = `${prompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`;
            const imagenResponse = await new Promise((resolve, reject) => {
              const reqPost = https.request({
                method: 'POST',
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
                headers: { 'Content-Type': 'application/json' }
              }, (resPost) => {
                let resData = '';
                resPost.on('data', chunk => resData += chunk);
                resPost.on('end', () => {
                  try { resolve(JSON.parse(resData)); } catch (e) { reject(e); }
                });
              });
              reqPost.on('error', reject);
              reqPost.write(JSON.stringify({
                instances: [{ prompt: promptValue }],
                parameters: { sampleCount: 1, aspectRatio: "16:9", outputMimeType: "image/jpeg" }
              }));
              reqPost.end();
            });

            if (imagenResponse.predictions && imagenResponse.predictions[0]) {
              imageUrl = `data:image/jpeg;base64,${imagenResponse.predictions[0].bytesBase64Encoded}`;
            }
          }
        } catch (errFallback) {
          console.error("Erro no fallback de imagem da cena:", errFallback);
        }
      }

      return res.status(200).json({ imageUrl });
    }

    return res.status(404).json({ error: 'Rota não encontrada' });
  } catch (err) {
    console.error("Erro no processador Serverless:", err);
    return res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
}
