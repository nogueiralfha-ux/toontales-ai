const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return env;
}

const env = loadEnv();
const API_KEY = env.ASAAS_API_KEY;
const API_URL = env.ASAAS_API_URL || 'https://api.asaas.com/v3';
const PORT = parseInt(env.PORT || '3001');

if (!API_KEY) {
  console.error("ERRO: ASAAS_API_KEY não foi encontrada no arquivo .env");
  process.exit(1);
}

console.log("Iniciando Servidor Proxy Seguro do Asaas...");
console.log("URL de Destino:", API_URL);

// Helper to make HTTPS requests to Asaas
function asaasRequest(method, endpoint, payload = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${API_URL}${endpoint}`);
    const options = {
      method: method,
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'ToonTales Proxy'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject({ statusCode: res.statusCode, error: json });
          } else {
            resolve(json);
          }
        } catch (e) {
          reject({ statusCode: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

// Server router
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, access_token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    // 1. Create PIX Payment
    if (req.method === 'POST' && url.pathname === '/api/create-pix') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { price, planName, email } = JSON.parse(body);

          // Step A: Create or find Customer on Asaas
          console.log(`[Asaas] Criando cliente: ${email}...`);
          const customer = await asaasRequest('POST', '/customers', {
            name: `Assinante ToonTales - ${email.split('@')[0]}`,
            email: email,
            notificationDisabled: true
          });

          // Step B: Create Pix Payment
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

          // Step C: Fetch Pix QR Code details
          console.log(`[Asaas] Gerando QR Code para pagamento ${payment.id}...`);
          const qrCode = await asaasRequest('GET', `/payments/${payment.id}/pixQrCode`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            paymentId: payment.id,
            qrCodeImage: qrCode.encodedImage, // Base64 image
            copyPasteCode: qrCode.payload,    // Pix copy-paste key
            price: payment.value,
            status: payment.status
          }));

        } catch (err) {
          console.error("Erro ao criar pagamento:", err);
          res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(err));
        }
      });
    }

    // 2. Check Payment Status
    else if (req.method === 'GET' && url.pathname === '/api/check-payment') {
      const paymentId = url.searchParams.get('paymentId');
      if (!paymentId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'paymentId é obrigatório' }));
        return;
      }

      console.log(`[Asaas] Verificando status do pagamento: ${paymentId}...`);
      const payment = await asaasRequest('GET', `/payments/${paymentId}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        paymentId: payment.id,
        status: payment.status, // RECEIVED, CONFIRMED, PENDING
        isPaid: payment.status === 'RECEIVED' || payment.status === 'CONFIRMED'
      }));
    }

    // 2.5. Serve Static Files from /public/downloads/
    else if (req.method === 'GET' && url.pathname.startsWith('/downloads/')) {
      const filePath = path.join(__dirname, 'public', url.pathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.mp3') contentType = 'audio/mpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.pdf') contentType = 'application/pdf';

        res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
        fs.createReadStream(filePath).pipe(res);
        return;
      } else {
        res.writeHead(404);
        res.end();
        return;
      }
    }

    // 3. Generate Story using Real AI APIs (OpenAI + Replicate) with fallbacks
    else if (req.method === 'POST' && url.pathname === '/api/generate-story') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { theme, ageGroup, prompt, childPhoto, parentPhoto } = JSON.parse(body);

          const openAiKey = env.OPENAI_API_KEY;
          const replicateKey = env.REPLICATE_API_KEY;
          const falKey = env.FAL_KEY;
          const geminiKey = env.GEMINI_API_KEY;

          const hasTextKey = (openAiKey && !openAiKey.includes('sua_chave')) || (geminiKey && !geminiKey.includes('sua_chave'));
          const hasImageKey = (replicateKey && !replicateKey.includes('sua_chave')) || (falKey && !falKey.includes('sua_chave'));

          // If keys are not present or left as placeholder, return fallback status to use client-side Mock generator
          if (!hasTextKey || !hasImageKey) {
            console.log("[AI Proxy] Chaves de API de texto ou imagem não configuradas no .env. Executando fallback mockado...");
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'fallback_mock' }));
            return;
          }

          // Call API for Text Generation
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

          if (geminiKey && !geminiKey.includes('sua_chave')) {
            console.log(`[AI Proxy] Gerando história real com Google Gemini 1.5 Flash...`);
            const geminiResponse = await new Promise((resolve, reject) => {
              const reqPost = https.request({
                method: 'POST',
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                headers: { 'Content-Type': 'application/json' }
              }, (resPost) => {
                let resData = '';
                resPost.on('data', chunk => resData += chunk);
                resPost.on('end', () => resolve(JSON.parse(resData)));
              });
              reqPost.on('error', reject);
              reqPost.write(JSON.stringify({
                contents: [{ parts: [{ text: `${promptSystem}\n\nInstrução:\n${userInstruction}` }] }],
                generationConfig: { responseMimeType: "application/json" }
              }));
              reqPost.end();
            });

            try {
              const rawText = geminiResponse.candidates[0].content.parts[0].text;
              storyTextData = JSON.parse(rawText);
            } catch (errParse) {
              console.error("Erro ao fazer parse da resposta do Gemini:", errParse);
              throw new Error("Resposta inválida do Gemini");
            }
          } else {
            console.log(`[AI Proxy] Gerando história real com OpenAI GPT-4o-Mini...`);
            const openAiResponse = await new Promise((resolve, reject) => {
              const reqPost = https.request({
                method: 'POST',
                hostname: 'api.openai.com',
                path: '/v1/chat/completions',
                headers: {
                  'Authorization': `Bearer ${openAiKey}`,
                  'Content-Type': 'application/json'
                }
              }, (resPost) => {
                let resData = '';
                resPost.on('data', chunk => resData += chunk);
                resPost.on('end', () => resolve(JSON.parse(resData)));
              });
              reqPost.on('error', reject);
              reqPost.write(JSON.stringify({
                model: 'gpt-4o-mini',
                response_format: { type: "json_object" },
                messages: [
                  { role: 'system', content: promptSystem },
                  { role: 'user', content: userInstruction }
                ]
              }));
              reqPost.end();
            });

            storyTextData = JSON.parse(openAiResponse.choices[0].message.content);
          }

          const storyId = Math.random().toString(36).substring(2, 11);
          console.log(`[AI Proxy] Roteiro gerado com sucesso: "${storyTextData.title}". Gerando ilustrações e áudio...`);

          // Ensure directory for downloads exists
          const audioDir = path.join(__dirname, 'public', 'downloads', 'audio');
          fs.mkdirSync(audioDir, { recursive: true });

          // Generate Illustrations and Narration in Parallel
          const scenesPromises = storyTextData.scenes.map(async (scene) => {
            let imageUrl = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600';
            let audioUrl = '';

            // Step 1: Generate Image
            try {
              if (falKey) {
                // Use Fal.ai for ultra fast cheap generation
                console.log(`[AI Proxy] Enviando prompt da cena ${scene.pageNumber} para Fal.ai...`);
                const isConsistent = childPhoto || parentPhoto;
                const endpoint = isConsistent ? 'https://fal.run/fal-ai/flux-pulid' : 'https://fal.run/fal-ai/flux/schnell';
                const bodyObj = isConsistent ? {
                  prompt: `${scene.illustrationPrompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`,
                  reference_image_url: childPhoto || parentPhoto,
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
              } else if (replicateKey) {
                // Use Replicate as fallback
                console.log(`[AI Proxy] Enviando prompt da cena ${scene.pageNumber} para Replicate...`);
                const prediction = await new Promise((resolve, reject) => {
                  const reqPost = https.request({
                    method: 'POST',
                    hostname: 'api.replicate.com',
                    path: '/v1/predictions',
                    headers: {
                      'Authorization': `Token ${replicateKey}`,
                      'Content-Type': 'application/json'
                    }
                  }, (resPost) => {
                    let resData = '';
                    resPost.on('data', chunk => resData += chunk);
                    resPost.on('end', () => resolve(JSON.parse(resData)));
                  });
                  reqPost.on('error', reject);
                  reqPost.write(JSON.stringify({
                    version: "zsxkib/flux-pulid:0c8cf840d216f49e491c360b411d73507cf279df64700c010dcf2cc4cf7aa654",
                    input: {
                      prompt: `${scene.illustrationPrompt}, children's book style illustration, soft colors, vibrant 3D cartoon style, highly detailed`,
                      main_face_image: childPhoto || parentPhoto,
                      width: 1024,
                      height: 576
                    }
                  }));
                  reqPost.end();
                });

                let predictionResult = prediction;
                let attempts = 0;
                while (predictionResult.status !== 'succeeded' && predictionResult.status !== 'failed' && attempts < 10) {
                  await new Promise(r => setTimeout(r, 1500));
                  predictionResult = await new Promise((resolve, reject) => {
                    const reqGet = https.request({
                      method: 'GET',
                      hostname: 'api.replicate.com',
                      path: `/v1/predictions/${prediction.id}`,
                      headers: { 'Authorization': `Token ${replicateKey}` }
                    }, (resGet) => {
                      let resData = '';
                      resGet.on('data', chunk => resData += chunk);
                      resGet.on('end', () => resolve(JSON.parse(resData)));
                    });
                    reqGet.on('error', reject);
                    reqGet.end();
                  });
                  attempts++;
                }

                if (predictionResult.output && predictionResult.output[0]) {
                  imageUrl = predictionResult.output[0];
                }
              }
            } catch (errImg) {
              console.error(`Erro ao gerar imagem para cena ${scene.pageNumber}:`, errImg);
            }

            // Step 2: Generate Audio Narration with OpenAI TTS
            try {
              console.log(`[AI Proxy] Gerando áudio TTS para cena ${scene.pageNumber}...`);
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
                  const dataChunks = [];
                  resPost.on('data', chunk => dataChunks.push(chunk));
                  resPost.on('end', () => resolve(Buffer.concat(dataChunks)));
                });
                reqPost.on('error', reject);
                reqPost.write(JSON.stringify({
                  model: 'tts-1',
                  input: scene.text,
                  voice: theme === 'Livre' ? 'fable' : 'nova'
                }));
                reqPost.end();
              });

              const audioFileName = `${storyId}_${scene.pageNumber}.mp3`;
              const audioFilePath = path.join(audioDir, audioFileName);
              fs.writeFileSync(audioFilePath, audioBuffer);
              audioUrl = `http://localhost:3001/downloads/audio/${audioFileName}`;
            } catch (errAudio) {
              console.error(`Erro ao gerar áudio para cena ${scene.pageNumber}:`, errAudio);
            }

            return {
              pageNumber: scene.pageNumber,
              text: scene.text,
              illustrationSvg: '', 
              coloringSvg: '',     
              illustrationUrl: imageUrl,
              coloringUrl: imageUrl, // O outline de colorir é gerado localmente pelo Canvas
              audioUrl: audioUrl
            };
          });

          const completedScenes = await Promise.all(scenesPromises);

          const finalStory = {
            id: storyId,
            title: storyTextData.title,
            theme: theme,
            ageGroup: ageGroup,
            createdAt: new Date().toISOString(),
            scenes: completedScenes,
            moralLesson: storyTextData.moralLesson,
            bibleReference: storyTextData.bibleReference,
            audioUrl: completedScenes[0]?.audioUrl || '' // Usa o primeiro áudio ou link do livro compilado
          };

          console.log(`[AI Proxy] História gerada completamente com IA real!`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(finalStory));

        } catch (errGlobal) {
          console.error("Erro na rota de geração:", errGlobal);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Falha na geração de IA", details: errGlobal.message }));
        }
      });
    }

    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }

  } catch (globalError) {
    console.error("Erro global no proxy:", globalError);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor proxy' }));
  }
});

server.listen(PORT, () => {
  console.log(`Servidor de Autenticação e Cobrança Real do Asaas ativo na porta ${PORT}!`);
});
