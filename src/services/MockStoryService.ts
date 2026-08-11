import { Story, StoryTheme, AgeGroup, StoryScene } from '../domain/Story';

export interface IStoryService {
  generateStory(theme: StoryTheme, ageGroup: AgeGroup, title?: string): Promise<Story>;
}

export class MockStoryService implements IStoryService {
  public async generateStory(theme: StoryTheme, ageGroup: AgeGroup, title?: string): Promise<Story> {
    // Definir número de cenas com base na faixa etária
    let sceneCount = 8;
    if (ageGroup === '2-6') sceneCount = 8;
    else if (ageGroup === '7-12') sceneCount = 12;
    else if (ageGroup === 'adulto') sceneCount = 16;
    const rawTitle = title || this.getDefaultTitle(theme);
    
    // Extract a custom name from the prompt/title if available
    let customName = '';
    let parentRole = '';
    
    // Check for bracket tags first
    const childMatch = rawTitle.match(/\[Nome da Criança\/Herói:\s*([^\]]+)\]/i);
    if (childMatch && childMatch[1].trim()) {
      customName = childMatch[1].trim();
    }
    
    const adultMatch = rawTitle.match(/\[Nome do Adulto:\s*([^\]]+)\]/i);
    if (adultMatch && adultMatch[1].trim()) {
      parentRole = adultMatch[1].trim();
    }

    // Fallback name extraction if brackets aren't used
    if (!customName && rawTitle && rawTitle !== this.getDefaultTitle(theme)) {
      // 1. Tenta encontrar qualquer palavra em maiúsculo no prompt (excluindo a primeira palavra de comando)
      const words = rawTitle.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÏÓÔÕÖÚÇ\s]/g, '').trim().split(/\s+/);
      const capitalizedWords = words.filter((w, idx) => idx > 0 && w && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase());
      
      if (capitalizedWords.length > 0) {
        customName = capitalizedWords[0];
      } else {
        // 2. Senão, busca a palavra imediatamente após conectivos como "para", "sobre", "com", "de", "do", "da"
        const lowerTitle = rawTitle.toLowerCase();
        const introWords = ['para a', 'para o', 'para', 'sobre a', 'sobre o', 'sobre', 'com a', 'com o', 'com', 'de', 'do', 'da'];
        let foundIndex = -1;
        let matchedIntro = '';
        
        for (const intro of introWords) {
          const idx = lowerTitle.lastIndexOf(' ' + intro + ' ');
          if (idx !== -1 && idx > foundIndex) {
            foundIndex = idx;
            matchedIntro = intro;
          }
        }
        
        if (foundIndex !== -1) {
          const afterIntro = rawTitle.substring(foundIndex + matchedIntro.length + 2).trim();
          if (afterIntro) {
            const firstWordAfter = afterIntro.split(/\s+/)[0].replace(/[^a-zA-ZáàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÍÏÓÔÕÖÚÇ]/g, '');
            if (firstWordAfter) {
              customName = firstWordAfter.charAt(0).toUpperCase() + firstWordAfter.slice(1).toLowerCase();
            }
          }
        }
      }
      
      // 3. Fallback absoluto: usa a primeira palavra limpa
      if (!customName) {
        const cleanPrompt = rawTitle.replace(/\[[^\]]+\]/g, '').replace(/\b(historia|história|de|do|da|um|uma|sobre|com|o|a|para|infantil|aventura|desenho|vídeo|livro)\b\s*/gi, '').trim();
        if (cleanPrompt) {
          const firstWord = cleanPrompt.split(/\s+/)[0];
          customName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        }
      }
    }

    if (!parentRole && rawTitle) {
      const lowerTitle = rawTitle.toLowerCase();
      if (lowerTitle.includes('papai') || lowerTitle.includes('pai')) parentRole = 'Papai';
      else if (lowerTitle.includes('mamãe') || lowerTitle.includes('mãe')) parentRole = 'Mamãe';
      else if (lowerTitle.includes('titia') || lowerTitle.includes('tia')) parentRole = 'Titia';
      else if (lowerTitle.includes('titio') || lowerTitle.includes('tio')) parentRole = 'Titio';
      else if (lowerTitle.includes('professora') || lowerTitle.includes('profe')) parentRole = 'Professora';
      else if (lowerTitle.includes('professor')) parentRole = 'Professor';
    }

    // Clean up title for displaying
    let generatedTitle = rawTitle.replace(/\[[^\]]+\]/g, '').trim();
    if (!generatedTitle || generatedTitle === '...') {
      generatedTitle = this.getDefaultTitle(theme);
    }

    const scenes: StoryScene[] = [];
    for (let i = 1; i <= sceneCount; i++) {
      let text = this.getSceneText(theme, ageGroup, i, sceneCount, generatedTitle);
      
      // Dynamic name injection
      if (customName) {
        const isMale = !customName.endsWith('a') || ['davi', 'lucca', 'lucas', 'pedro', 'joao', 'joão', 'gabriel', 'mateus', 'matheus', 'felipe', 'gustavo', 'henrique', 'bernardo', 'heitor', 'samuel', 'miguel'].includes(customName.toLowerCase());
        
        if (isMale) {
          text = text
            .replace(/a pequena coelhinha Lili/g, `o pequeno coelhinho ${customName}`)
            .replace(/A pequena coelhinha Lili/g, `O pequeno coelhinho ${customName}`)
            .replace(/a coelha Lili/g, `o coelho ${customName}`)
            .replace(/A coelha Lili/g, `O coelho ${customName}`)
            .replace(/a destemida coelha Lili/g, `o destemido coelho ${customName}`)
            .replace(/A destemida coelha Lili/g, `O destemido coelho ${customName}`)
            .replace(/coelhinha Lili/g, `coelhinho ${customName}`)
            .replace(/coelha Lili/g, `coelho ${customName}`)
            .replace(/A pequena Lili/g, `O pequeno ${customName}`)
            .replace(/a pequena Lili/g, `o pequeno ${customName}`)
            .replace(/a Lili/g, `o ${customName}`)
            .replace(/A Lili/g, `O ${customName}`)
            .replace(/da Lili/g, `do ${customName}`)
            .replace(/na Lili/g, `no ${customName}`)
            .replace(/pela Lili/g, `pelo ${customName}`)
            .replace(/ela/g, 'ele')
            .replace(/Ela/g, 'Ele')
            .replace(/delas/g, 'deles')
            .replace(/dela/g, 'dele')
            .replace(/destemida/g, 'destemido')
            .replace(/pequena/g, 'pequeno')
            .replace(/Lili/g, customName)
            .replace(/Noé/g, customName)
            .replace(/gotinha Pingo/g, customName)
            .replace(/Pingo/g, customName);
        } else {
          text = text
            .replace(/Noé/g, customName)
            .replace(/coelhinha Lili/g, customName)
            .replace(/coelha Lili/g, customName)
            .replace(/Lili/g, customName)
            .replace(/gotinha Pingo/g, customName)
            .replace(/Pingo/g, customName);
        }
      }
      
      // Dynamic parent character injection
      if (parentRole) {
        text = text
          .replace(/Kiko/g, parentRole)
          .replace(/família/g, parentRole);
      }

      const illustrationSvg = this.generateIllustrationSvg(theme, i, sceneCount, generatedTitle);
      const coloringSvg = this.generateColoringSvg(theme, i, sceneCount, generatedTitle);
      
      scenes.push({
        pageNumber: i,
        text,
        illustrationSvg,
        coloringSvg
      });
    }

    const moralLesson = this.getMoralLesson(theme, generatedTitle);
    const bibleReference = this.getBibleReference(theme, generatedTitle);

    return {
      id: Math.random().toString(36).substr(2, 9),
      title: generatedTitle,
      theme,
      ageGroup,
      createdAt: new Date(),
      scenes,
      moralLesson,
      bibleReference
    };
  }

  private getMoralLesson(theme: StoryTheme, title: string): string {
    if (theme === 'Bíblico') {
      const sub = this.getBiblicalSubTheme(title);
      if (sub === 'david') {
        return "Lição de Vida: Com fé e coragem, nós podemos vencer gigantes! O tamanho do obstáculo não importa se confiamos e fazemos o que é certo.";
      }
      if (sub === 'jonah') {
        return "Lição de Vida: Deus sempre nos dá uma segunda chance e ouve nossas orações sinceras, mesmo nos momentos mais difíceis. Quando errar, peça perdão e siga a direção do bem!";
      }
      if (sub === 'moses') {
        return "Lição de Vida: Tenha coragem e confie! Diante de grandes obstáculos que parecem fechar o seu caminho, a união e a fé abrem caminhos que pareciam impossíveis.";
      }
      return "Lição de Vida: Fazer o que é certo nos protege e traz paz para as nossas vidas. Construa seus valores em terra firme e confie na promessa de dias melhores!";
    }
    if (theme === 'Aventura') {
      return "Lição de Vida: O maior tesouro que podemos encontrar não está em baús de ouro, mas na amizade verdadeira, na cooperação e em ajudar os amigos na jornada.";
    }
    if (theme === 'Livre') {
      return "Homenagem Especial: Expressar gratidão e carinho a quem nos apoia fortalece nossos laços de amor. O carinho e o respeito são as coisas mais preciosas das nossas vidas.";
    }
    return "Lição de Vida: Cada elemento do planeta tem uma função essencial na natureza, assim como você tem no mundo. Preserve nosso meio ambiente e economize água!";
  }

  private getBibleReference(theme: StoryTheme, title: string): string | undefined {
    if (theme !== 'Bíblico') return undefined;
    const sub = this.getBiblicalSubTheme(title);
    if (sub === 'david') return "Primeiro Livro de Samuel, Capítulo 17 (Velho Testamento)";
    if (sub === 'jonah') return "Livro de Jonas, Capítulos 1 ao 4 (Velho Testamento)";
    if (sub === 'moses') return "Livro de Êxodo, Capítulo 14 (Velho Testamento)";
    return "Livro de Gênesis, Capítulos 6 ao 9 (Velho Testamento)";
  }

  private getDefaultTitle(theme: StoryTheme): string {
    switch (theme) {
      case 'Bíblico':
        return 'A Fantástica Jornada da Arca dos Animais';
      case 'Aventura':
        return 'O Enigma da Floresta Encantada';
      case 'Educativo':
        return 'A Incrível Aventura do Ciclo da Água';
      case 'Livre':
        return 'Uma Homenagem Muito Especial';
    }
  }

  private getBiblicalSubTheme(title: string): 'noah' | 'jonah' | 'moses' | 'david' {
    const t = title.toLowerCase();
    if (t.includes('jonas') || t.includes('peixe') || t.includes('baleia') || t.includes('joinas')) return 'jonah';
    if (t.includes('moises') || t.includes('móises') || t.includes('mar') || t.includes('egito') || t.includes('vermelho')) return 'moses';
    if (t.includes('davi') || t.includes('golias')) return 'david';
    return 'noah';
  }

  private getSceneText(theme: StoryTheme, ageGroup: AgeGroup, page: number, _total: number, title: string = ''): string {
    const isSimple = ageGroup === '2-6';
    
    if (theme === 'Bíblico') {
      const sub = this.getBiblicalSubTheme(title);
      
      if (sub === 'david') {
        const texts3_6 = [
          "Davi era um pequeno pastorzinho de ovelhas que confiava muito em Deus.",
          "Ele cuidava das ovelhas de seu pai com muito carinho e coragem nos campos.",
          "Um dia, um gigante muito alto chamado Golias desafiou o exército.",
          "Todos os soldados do rei ficaram com muito medo e fugiram do gigante Golias.",
          "Mas o jovem Davi disse com coragem: 'Eu não tenho medo, Deus está comigo!'",
          "Davi desceu ao riacho e escolheu cinco pedrinhas lisas para sua funda.",
          "Davi girou a funda com força e lançou a pedrinha em direção ao gigante.",
          "Golias caiu no chão, e Davi mostrou que o amor e a fé vencem qualquer gigante!"
        ];

        const texts7_12 = [
          "No reino de Israel, o jovem Davi passava seus dias pastoreando pacientemente as ovelhas de sua família.",
          "Enquanto protegia o rebanho, Davi desenvolveu coragem e pontaria enfrentando ursos e leões selvagens.",
          "Certo dia, um exército oponente desafiou as forças do rei, exigindo um combate singular.",
          "Das forças oponentes surgiu um guerreiro gigante chamado Golias, que media mais de três metros de altura.",
          "Golias zombava das tropas de Israel todas as manhãs, fazendo com que os soldados fugissem com medo.",
          "Davi chegou ao acampamento para trazer mantimentos e ficou indignado ao ver a hesitação do exército.",
          "Apesar de ser apenas um jovem rapaz, Davi voluntariou-se com fé para enfrentar o gigante Golias.",
          "O rei ofereceu sua pesada armadura de bronze, mas Davi recusou por não conseguir se mover livremente.",
          "Davi desceu ao ribeiro próximo, escolheu cinco pedras lisas e colocou-as em seu alforge de pastor.",
          "Armado apenas com seu cajado de madeira e uma funda de couro, Davi avançou em direção ao gigante.",
          "Golias zombou do rapaz, mas Davi respondeu: 'Você vem contra mim com espada, mas eu vou em nome do Senhor'.",
          "Davi girou a funda com precisão, a pedra atingiu a testa de Golias e o gigante caiu derrotado no chão."
        ];

        return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
      }

      if (sub === 'jonah') {
        const texts3_6 = [
          "Jonas era um profeta amigo de Deus que morava em uma cidadezinha.",
          "Um dia, Deus pediu para Jonas ir pregar e fazer o bem na cidade de Nínive.",
          "Mas Jonas ficou com muito medo e tentou fugir de navio pelo mar.",
          "Uma grande tempestade começou e o navio balançava em ondas gigantes!",
          "Para salvar os marinheiros, Jonas decidiu pular na água agitada.",
          "De repente, um peixe gigante apareceu e engoliu Jonas inteirinho!",
          "Dentro da barriga do peixe, Jonas orou a Deus com muito arrependimento.",
          "Deus ouviu, e o peixe cuspiu Jonas na praia para ele seguir sua missão feliz."
        ];

        const texts7_12 = [
          "Jonas era um profeta que recebeu a missão de pregar arrependimento na grande cidade de Nínive.",
          "Com medo de como seria recebido pelas pessoas, Jonas tomou a decisão errada de tentar fugir da presença de Deus.",
          "Ele comprou uma passagem em um navio mercante que navegava em direção a Társis, o lado oposto.",
          "Em alto mar, uma terrível tempestade começou a castigar o navio, ameaçando afundar a tripulação.",
          "Os marinheiros estavam desesperados, e Jonas confessou que a tempestade acontecia por causa de sua fuga.",
          "Jonas pediu para ser lançado ao mar para acalmar a fúria das ondas e salvar a vida dos marinheiros.",
          "Assim que Jonas foi lançado nas águas, a tempestade cessou imediatamente e o oceano acalmou.",
          "Deus enviou um enorme peixe que engoliu Jonas por inteiro para protegê-lo do afogamento.",
          "Durante três dias e três noites, Jonas permaneceu na escuridão da barriga do peixe e orou arrependido.",
          "Deus ouviu as orações sinceras de Jonas e ordenou ao peixe gigante que o levasse em segurança.",
          "O peixe nadou até a margem e cuspiu Jonas suavemente nas areias quentes da praia.",
          "Jonas agradeceu a Deus pela segunda chance e partiu imediatamente para cumprir sua missão em Nínive."
        ];

        return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
      }

      if (sub === 'moses') {
        const texts3_6 = [
          "Moisés era o líder escolhido para guiar o povo de Deus rumo à liberdade.",
          "Eles caminharam muito até chegar diante de um mar enorme chamado Mar Vermelho.",
          "O povo ficou com medo porque o exército do faraó estava vindo atrás deles.",
          "Mas Deus disse a Moisés: 'Não tenham medo, fiquem firmes e vejam o que vou fazer'.",
          "Moisés ergueu seu cajado de madeira em direção às águas do mar.",
          "Um vento forte soprou e, de repente, o mar se abriu ao meio formando duas paredes!",
          "O povo caminhou em terra seca pelo meio do mar aberto e atravessou em segurança.",
          "As águas voltaram a se fechar, e todos celebraram a liberdade com muita alegria e música."
        ];

        const texts7_12 = [
          "Moisés foi escolhido para liderar a libertação de seu povo, que era escravizado no Egito.",
          "Depois de uma longa jornada, eles se viram encurralados diante das águas profundas do Mar Vermelho.",
          "Ao longe, a poeira subia indicando que o exército do Faraó vinha em perseguição para capturá-los.",
          "O povo entrou em desespero, mas Moisés os acalmou dizendo que Deus os protegeria.",
          "Deus ordenou que Moisés estendesse sua mão e seu cajado sobre o Mar Vermelho.",
          "Um forte vento oriental soprou durante toda a noite, dividindo as águas do mar em duas partes.",
          "Duas imensas paredes de água se ergueram à esquerda e à direita, revelando um caminho seco no meio.",
          "Moisés guiou o povo de forma ordenada através daquele caminho seco no fundo do oceano.",
          "Eles caminhavam maravilhados vendo as paredes de água sustentadas de forma milagrosa.",
          "Assim que a última pessoa atravessou em segurança, o exército inimigo tentou segui-los pelo caminho.",
          "Moisés estendeu a mão novamente e as grandes paredes de água desmoronaram sobre o exército.",
          "Livre das correntes da escravidão, o povo celebrou a travessia histórica cantando e dançando na praia."
        ];

        return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
      }

      // Noah (Default)
      const texts3_6 = [
        "Noé era um homem muito bom e amigo de Deus.",
        "Um dia, Deus pediu para Noé construir um barco gigante chamado Arca.",
        "Noé trabalhou muito com sua família para fazer a grande Arca de madeira.",
        "Então, animais de todos os tamanhos começaram a chegar de dois em dois!",
        "Girafas altas, leões corajosos e passarinhos alegres entraram na Arca.",
        "A chuva começou a cair, mas todos estavam bem seguros lá dentro.",
        "Depois de muitos dias, a chuva parou e o sol brilhou lindo no céu.",
        "Um arco-íris super colorido apareceu para mostrar o amor de Deus por todos nós."
      ];

      const texts7_12 = [
        "Em tempos antigos, vivia um homem justo chamado Noé, conhecido por sua bondade e integridade.",
        "Deus revelou a Noé um plano especial: construir uma arca gigante para abrigar a vida terrestre.",
        "Com muita dedicação e paciência, Noé e sua família começaram a cortar as madeiras e estruturar a arca.",
        "Ao finalizar a construção, uma grande marcha animal teve início, vindos de todas as partes do mundo.",
        "Animais grandes e pequenos, aves de rapina e insetos coloridos caminhavam lado a lado de forma pacífica.",
        "Assim que todos entrou, as portas da arca se fecharam sob um céu cinzento carregado de nuvens.",
        "As primeiras gotas de chuva começaram a cair, transformando-se rapidamente em um imenso dilúvio.",
        "A arca flutuava suavemente sobre as águas profundas, protegendo cada ser vivo ali presente.",
        "Após quarenta dias e quarenta noites, as nuvens se dissiparam e a água começou a baixar lentamente.",
        "Noé enviou uma pomba que retornou com um ramo de oliveira, sinalizando terra firme por perto.",
        "Ao abrirem as portas, os animais saíram felizes para habitar a terra renovada.",
        "No céu, um espetacular arco-íris de sete cores selou uma aliança eterna de paz e esperança."
      ];

      return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
    }

    if (theme === 'Aventura') {
      const texts3_6 = [
        "A pequena coelhinha Lili adorava explorar a floresta perto de sua casa.",
        "Ela achou um mapa antigo escondido dentro de uma árvore oca.",
        "O mapa tinha um desenho de uma grande árvore com folhas douradas.",
        "No caminho, Lili encontrou o esquilo Kiko, que decidiu ajudá-la.",
        "Juntos, eles atravessaram uma ponte de troncos sobre um riacho barulhento.",
        "Eles subiram uma colina verde sob o céu azul e ensolarado.",
        "Atrás de um arbusto florido, viram a linda árvore que brilhava forte.",
        "No final do caminho, encontraram um baú cheio de frutas deliciosas e coloridas!"
      ];

      const texts7_12 = [
        "Nas profundezas do Vale das Esmeraldas, a destemida coelha Lili buscava uma nova aventura.",
        "Ao inspecionar o tronco de um carvalho centenário, Lili encontrou um pergaminho contendo um mapa misterioso.",
        "O mapa indicava a localização exata da lendária Árvore de Ouro, esquecida pelo tempo.",
        "Não demorou para que Kiko, um esquilo especialista em ler mapas estelares, se juntasse à expedição.",
        "A primeira pista os levou a um antigo riacho de águas cristalinas, atravessado por troncos antigos.",
        "Com equilíbrio e trabalho em equipe, eles conseguiram cruzar a correnteza sem grandes sustos.",
        "Mais adiante, o caminho tornava-se íngreme e cercado por formações rochosas fascinantes.",
        "Eles alcançaram o topo da Colina dos Ventos, onde puderam avistar todo o horizonte do vale.",
        "Um brilho dourado e suave chamou a atenção de Lili entre a vegetação densa.",
        "Lá estava ela: a majestosa Árvore de Ouro, cujas folhas reluziam como raios de sol.",
        "Na raiz da árvore, encontraram um antigo baú de madeira adornado com conchas.",
        "Ao abri-lo, descobriram que o tesouro eram sementes raras e frutas deliciosas para plantar no vale."
      ];

      return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
    }

    // Educativo (Ciclo da Água)
    const texts3_6 = [
      "Esta é a gotinha Pingo, ela mora em um lindo lago azul.",
      "O sol esquenta a água e Pingo começa a subir no ar como vapor.",
      "Lá no alto, Pingo se junta com outras gotinhas para formar uma nuvem.",
      "A nuvem vai ficando cada vez mais gordinha e pesada com o vento.",
      "As nuvenzinhas cinzentas anunciam que é hora de começar a chover.",
      "Pingo cai do céu alegremente em forma de gotinha de chuva gelada.",
      "Ela cai sobre as plantas e ajuda as flores a crescerem felizes.",
      "Finalmente, Pingo corre pela terra e volta para o seu amado lago azul."
    ];

    const texts7_12 = [
      "Conheça Pingo, uma pequena molécula de água que vive tranquilamente no oceano azul.",
      "Com a energia térmica emitida pelo Sol, a água do oceano aquece e inicia o processo de evaporação.",
      "Pingo sobe lentamente na atmosfera, transformando-se em um vapor invisível e leve.",
      "Nas camadas mais frias da atmosfera, ocorre a condensação, transformando o vapor em gotículas de água.",
      "Milhões de gotículas se unem, dando forma a nuvens majestosas que viajam com a ajuda do vento.",
      "À medida que a umidade aumenta, a nuvem fica saturada e pesada, preparando-se para a precipitação.",
      "Sob a forma de chuva refrescante, Pingo despenca das nuvens em uma emocionante viagem de retorno.",
      "Algumas gotas caem nas montanhas, ajudando a alimentar lençóis freáticos e nascentes de rios.",
      "Pingo escorre pelo solo úmido da floresta, hidratando as raízes das árvores locais.",
      "Os riachos recolhem a água das chuvas, conduzindo-a de volta em direção ao nível do mar.",
      "Pingo agora se junta novamente a bilhões de outras moléculas no vasto oceano azul.",
      "E assim, o maravilhoso e infinito ciclo da água recomeça sob a luz dourada do Sol."
    ];

    // Livre (Homenagem)
    if (theme === 'Livre') {
      const texts3_6 = [
        "Hoje é um dia muito especial para celebrar e agradecer a quem sempre nos ama e protege.",
        "Com um sorriso brilhante e palavras doces, você espalha alegria por onde passa.",
        "Sua paciência e dedicação ensinam que pequenos gestos fazem uma enorme diferença.",
        "Seja nos estudos ou nas brincadeiras, você sempre nos incentiva a dar o nosso melhor.",
        "Nos momentos difíceis, seu abraço quentinho acalma e traz paz como um porto seguro.",
        "Obrigado por todas as brincadeiras, risadas e histórias compartilhadas todos os dias.",
        "Esta história é uma homenagem sincera para demonstrar o tamanho do nosso carinho.",
        "Que seu caminho seja sempre iluminado com muito amor, saúde e realizações felizes!"
      ];

      const texts7_12 = [
        "Existem momentos especiais em que precisamos parar e expressar nossa sincera gratidão.",
        "Hoje dedicamos esta homenagem especial para celebrar sua presença marcante em nossas vidas.",
        "Sua sabedoria e paciência servem como guia diário, inspirando todos ao seu redor.",
        "Cada ensinamento e conselho compartilhado fortalece nossa caminhada rumo ao futuro.",
        "A vida se torna muito mais rica quando compartilhamos sorrisos e momentos marcantes juntos.",
        "Obrigado por sua dedicação inabalável e pelo carinho que você planta em nossos corações.",
        "Nas páginas desta aventura, celebramos a união, a amizade e o respeito mútuo.",
        "Que esta lembrança permaneça como um símbolo de nossa admiração eterna.",
        "Expressar amor a quem nos apoia é o maior presente que podemos dar.",
        "Cada história compartilhada é um tijolo a mais na construção de nossas memórias queridas.",
        "Celebramos hoje a sua vida e toda a dedicação compartilhada com tanta generosidade.",
        "Parabéns por ser essa inspiração diária, trazendo luz e sabedoria a todos nós!"
      ];

      return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
    }

    return isSimple ? texts3_6[page - 1] || "" : texts7_12[page - 1] || "";
  }

  private generateIllustrationSvg(theme: StoryTheme, page: number, total: number, title: string = ''): string {
    const progress = page / total;
    const isNight = progress > 0.8;
    const skyColor = isNight ? 'url(#nightSky)' : 'url(#daySky)';
    
    let extraElements = '';
    
    if (theme === 'Bíblico') {
      const sub = this.getBiblicalSubTheme(title);
      
      if (sub === 'david') {
        extraElements = `
          <!-- David's pasture and sheep -->
          <ellipse cx="200" cy="500" rx="300" ry="80" fill="#aacc00" opacity="0.9" />
          <ellipse cx="600" cy="510" rx="250" ry="70" fill="#80b918" opacity="0.9" />
          
          <!-- Cute sheep -->
          <ellipse cx="500" cy="460" rx="30" ry="20" fill="#FFF" stroke="#CCC" stroke-width="2" />
          <circle cx="475" cy="450" r="10" fill="#FFF" stroke="#CCC" stroke-width="2" />
          <line x1="490" y1="475" x2="490" y2="490" stroke="#000" stroke-width="3" />
          <line x1="510" y1="475" x2="510" y2="490" stroke="#000" stroke-width="3" />
          
          <!-- Five stones -->
          <circle cx="150" cy="480" r="8" fill="#888" stroke="#555" stroke-width="2" />
          <circle cx="165" cy="485" r="7" fill="#999" stroke="#555" stroke-width="2" />
          <circle cx="180" cy="478" r="9" fill="#777" stroke="#555" stroke-width="2" />
        `;
      } else if (sub === 'jonah') {
        extraElements = `
          <!-- Mar e Ondas do Jonas -->
          <path d="M 0 450 Q 200 400 400 450 T 800 450 L 800 600 L 0 600 Z" fill="#1d3557" />
          <path d="M 0 490 Q 200 460 400 490 T 800 490 L 800 600 L 0 600 Z" fill="#457b9d" opacity="0.6" />
          
          <!-- Grande Baleia/Peixe -->
          <ellipse cx="500" cy="460" rx="190" ry="100" fill="#2b2d42" stroke="#1d1e2c" stroke-width="5" />
          <polygon points="670,430 730,370 710,480" fill="#2b2d42" stroke="#1d1e2c" stroke-width="5" />
          <circle cx="360" cy="420" r="14" fill="#FFF" />
          <circle cx="360" cy="420" r="6" fill="#000" />
          <path d="M 330 450 Q 360 470 390 450" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round" />
          
          <!-- Pequeno Navio à distância -->
          <path d="M 120 400 L 220 400 L 200 440 L 140 440 Z" fill="#8B4513" stroke="#5C2E0B" stroke-width="3" />
          <line x1="170" y1="400" x2="170" y2="340" stroke="#000" stroke-width="3" />
          <polygon points="170,340 170,375 215,357" fill="#F1FAEE" stroke="#000" stroke-width="2" />
        `;
      } else if (sub === 'moses') {
        extraElements = `
          <!-- Travessia do Mar Vermelho -->
          <!-- Paredes de água laterais -->
          <path d="M 0 100 Q 120 200 120 480 L 0 480 Z" fill="#457b9d" opacity="0.9" stroke="#1d3557" stroke-width="4" />
          <path d="M 800 100 Q 680 200 680 480 L 800 480 Z" fill="#457b9d" opacity="0.9" stroke="#1d3557" stroke-width="4" />
          
          <!-- Caminho seco no fundo -->
          <ellipse cx="400" cy="480" rx="280" ry="40" fill="#E9C46A" opacity="0.8" />
          <path d="M 120 480 L 680 480 L 800 600 L 0 600 Z" fill="#DDA15E" />
          
          <!-- Cajado de Moisés brilhando -->
          <line x1="280" y1="360" x2="280" y2="460" stroke="#E76F51" stroke-width="6" stroke-linecap="round" />
          <circle cx="280" cy="350" r="15" fill="#F4A261" filter="drop-shadow(0 0 8px yellow)" />
        `;
      } else {
        // Arca de Noé (Default)
        extraElements = `
          <!-- Arca -->
          <path d="M 200 400 L 600 400 L 530 490 L 270 490 Z" fill="#8B4513" stroke="#5C2E0B" stroke-width="6" />
          <rect x="350" y="320" width="100" height="80" fill="#CD853F" stroke="#5C2E0B" stroke-width="4" />
          <polygon points="320,320 400,260 480,320" fill="#DEB887" stroke="#5C2E0B" stroke-width="4" />
          <rect x="385" y="350" width="30" height="50" fill="#8B4513" />
          
          <!-- Casal de Animais Silhuetas -->
          <circle cx="300" cy="385" r="12" fill="#FFA500" />
          <path d="M 290 397 Q 300 375 310 397 Z" fill="#FFA500" />
          <circle cx="500" cy="385" r="10" fill="#90EE90" />
        `;
        if (progress > 0.7) {
          extraElements += `
            <!-- Arco-íris -->
            <path d="M 100 480 A 300 300 0 0 1 700 480" fill="none" stroke="#FF5A5F" stroke-width="14" opacity="0.85" />
            <path d="M 115 480 A 285 285 0 0 1 685 480" fill="none" stroke="#FFB400" stroke-width="14" opacity="0.85" />
            <path d="M 130 480 A 270 270 0 0 1 670 480" fill="none" stroke="#8CE85C" stroke-width="14" opacity="0.85" />
            <path d="M 145 480 A 255 255 0 0 1 655 480" fill="none" stroke="#5CD6FF" stroke-width="14" opacity="0.85" />
          `;
        }
      }
    } else if (theme === 'Aventura') {
      extraElements = `
        <!-- Montanhas de fundo -->
        <polygon points="50,480 250,220 450,480" fill="#2d6a4f" opacity="0.8" />
        <polygon points="350,480 550,260 750,480" fill="#1b4332" opacity="0.9" />
      `;
      if (page >= total - 2) {
        extraElements += `
          <!-- Árvore de Ouro -->
          <rect x="385" y="320" width="30" height="160" fill="#8B5A2B" />
          <circle cx="400" cy="240" r="90" fill="#FFD700" opacity="0.9" filter="drop-shadow(0px 0px 20px gold)" />
          <circle cx="360" cy="220" r="45" fill="#FFE57F" />
          <circle cx="440" cy="250" r="50" fill="#FFE57F" />
          <circle cx="400" cy="200" r="40" fill="#FFF8E1" />
        `;
      } else {
        extraElements += `
          <!-- Árvores Comuns -->
          <rect x="180" y="380" width="15" height="100" fill="#5C2E0B" />
          <polygon points="120,380 188,250 255,380" fill="#40916c" />
          
          <rect x="620" y="380" width="15" height="100" fill="#5C2E0B" />
          <polygon points="560,380 628,240 695,380" fill="#2d6a4f" />
        `;
      }
    } else {
      // Educativo
      extraElements = `
        <!-- Mar e Ondas -->
        <path d="M 0 450 Q 200 420 400 450 T 800 450 L 800 600 L 0 600 Z" fill="#0077b6" />
        <path d="M 0 480 Q 200 450 400 480 T 800 480 L 800 600 L 0 600 Z" fill="#0096c7" opacity="0.6" />
      `;
      if (page >= 2 && page <= 6) {
        extraElements += `
          <!-- Nuvens e Gotas subindo -->
          <circle cx="200" cy="150" r="50" fill="#FFF" opacity="0.95" />
          <circle cx="250" cy="140" r="60" fill="#FFF" opacity="0.95" />
          <circle cx="290" cy="160" r="40" fill="#FFF" opacity="0.95" />
          
          <circle cx="500" cy="120" r="45" fill="#E2EAFC" opacity="0.9" />
          <circle cx="540" cy="110" r="55" fill="#E2EAFC" opacity="0.9" />
          
          <!-- Evaporação (linhas tracejadas) -->
          <path d="M 200 400 L 200 250" stroke="#FFD166" stroke-width="4" stroke-dasharray="8,8" opacity="0.7" />
          <path d="M 400 410 L 400 260" stroke="#FFD166" stroke-width="4" stroke-dasharray="8,8" opacity="0.7" />
        `;
      }
    }

    // Adiciona o Personagem Principal (Lili, Noé ou Pingo)
    let character = '';
    if (theme === 'Bíblico') {
      // Noé
      character = `
        <g transform="translate(180, 360)">
          <!-- Corpo/Roupas -->
          <rect x="-15" y="30" width="30" height="60" rx="10" fill="#D2B48C" stroke="#5C2E0B" stroke-width="3" />
          <!-- Cabeça -->
          <circle cx="0" cy="10" r="22" fill="#FFD1A9" stroke="#5C2E0B" stroke-width="3" />
          <!-- Barba -->
          <path d="M -22 15 Q 0 45 22 15 L 15 35 Q 0 45 -15 35 Z" fill="#F5F5F5" stroke="#CCC" stroke-width="2" />
          <!-- Olhos grandes -->
          <circle cx="-7" cy="5" r="5" fill="#000" />
          <circle cx="-8" cy="4" r="2" fill="#FFF" />
          <circle cx="7" cy="5" r="5" fill="#000" />
          <circle cx="8" cy="4" r="2" fill="#FFF" />
          <!-- Boca feliz -->
          <path d="M -5 14 Q 0 18 5 14" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" />
        </g>
      `;
    } else if (theme === 'Aventura') {
      // Lili a Coelha
      character = `
        <g transform="translate(300, 390)">
          <!-- Corpo -->
          <ellipse cx="0" cy="45" rx="20" ry="25" fill="#FFA8B6" stroke="#C75A6B" stroke-width="3" />
          <circle cx="0" cy="42" r="10" fill="#FFF" />
          <!-- Orelhas grandes de coelho -->
          <ellipse cx="-10" cy="-25" rx="8" ry="25" fill="#FFCAD4" stroke="#C75A6B" stroke-width="3" transform="rotate(-10 -10 -25)" />
          <ellipse cx="-10" cy="-25" rx="4" ry="18" fill="#FFF" transform="rotate(-10 -10 -25)" />
          
          <ellipse cx="10" cy="-25" rx="8" ry="25" fill="#FFCAD4" stroke="#C75A6B" stroke-width="3" transform="rotate(10 10 -25)" />
          <ellipse cx="10" cy="-25" rx="4" ry="18" fill="#FFF" transform="rotate(10 10 -25)" />
          <!-- Cabeça -->
          <circle cx="0" cy="10" r="24" fill="#FFCAD4" stroke="#C75A6B" stroke-width="3" />
          <!-- Olhos grandes de Cartoon -->
          <circle cx="-8" cy="4" r="6" fill="#000" />
          <circle cx="-9" cy="2" r="2.5" fill="#FFF" />
          <circle cx="8" cy="4" r="6" fill="#000" />
          <circle cx="7" cy="2" r="2.5" fill="#FFF" />
          <!-- Narizinho -->
          <polygon points="-3,11 3,11 0,14" fill="#FF4D6D" />
          <!-- Sorriso -->
          <path d="M -6 17 Q 0 22 6 17" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" />
        </g>
      `;
    } else {
      // Gotinha Pingo
      character = `
        <g transform="translate(360, 330)">
          <!-- Gotinha shape (Gota d'água de cartoon) -->
          <path d="M 0 -35 C 30 10 30 35 0 35 C -30 35 -30 10 0 -35 Z" fill="#A0E8FF" stroke="#0096c7" stroke-width="4" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.15))" />
          <path d="M -10 -10 C -15 0 -15 15 -10 20 C -5 20 -8 5 -10 -10 Z" fill="#FFF" opacity="0.5" />
          <!-- Olhos de cartoon super fofos -->
          <circle cx="-7" cy="12" r="6" fill="#000" />
          <circle cx="-8.5" cy="10.5" r="2" fill="#FFF" />
          <circle cx="7" cy="12" r="6" fill="#000" />
          <circle cx="5.5" cy="10.5" r="2" fill="#FFF" />
          <!-- Corado -->
          <circle cx="-13" cy="18" r="4" fill="#FFB3C1" opacity="0.8" />
          <circle cx="13" cy="18" r="4" fill="#FFB3C1" opacity="0.8" />
          <!-- Sorriso de alegria -->
          <path d="M -4 20 Q 0 24 4 20" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" />
        </g>
      `;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="daySky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#A9C9FF" />
      <stop offset="100%" stop-color="#FFEBFF" />
    </linearGradient>
    <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141E30" />
      <stop offset="100%" stop-color="#243B55" />
    </linearGradient>
  </defs>
  
  <!-- Sky -->
  <rect width="800" height="600" fill="${skyColor}" />
  
  <!-- Sol/Lua -->
  ${isNight ? '<circle cx="700" cy="100" r="30" fill="#FFE082" filter="drop-shadow(0 0 8px #FFE082)" />' : '<circle cx="700" cy="100" r="45" fill="#FF9E00" filter="drop-shadow(0 0 12px #FF9E00)" />'}
  
  <!-- Chão Suave -->
  <rect x="0" y="470" width="800" height="130" fill="#74C69D" />
  <path d="M 0 470 Q 200 440 400 470 T 800 470" fill="#52B788" />
  
  ${extraElements}
  
  <!-- Personagem Principal -->
  ${character}
</svg>`;
  }

  private generateColoringSvg(theme: StoryTheme, page: number, total: number, title: string = ''): string {
    const progress = page / total;
    let extraElements = '';

    if (theme === 'Bíblico') {
      const sub = this.getBiblicalSubTheme(title);
      
      if (sub === 'david') {
        extraElements = `
          <!-- David's pasture and sheep (Outline) -->
          <ellipse cx="200" cy="500" rx="300" ry="80" fill="none" stroke="black" stroke-width="3" />
          <ellipse cx="600" cy="510" rx="250" ry="70" fill="none" stroke="black" stroke-width="3" />
          
          <!-- Cute sheep outline -->
          <ellipse cx="500" cy="460" rx="30" ry="20" fill="none" stroke="black" stroke-width="3" />
          <circle cx="475" cy="450" r="10" fill="none" stroke="black" stroke-width="3" />
          <line x1="490" y1="475" x2="490" y2="490" stroke="black" stroke-width="3" />
          <line x1="510" y1="475" x2="510" y2="490" stroke="black" stroke-width="3" />
          
          <!-- Five stones outline -->
          <circle cx="150" cy="480" r="8" fill="none" stroke="black" stroke-width="3" />
          <circle cx="165" cy="485" r="7" fill="none" stroke="black" stroke-width="3" />
          <circle cx="180" cy="478" r="9" fill="none" stroke="black" stroke-width="3" />
        `;
      } else if (sub === 'jonah') {
        extraElements = `
          <!-- Jonas e a Baleia (Contornos para Colorir) -->
          <!-- Linhas do Mar -->
          <path d="M 0 450 Q 200 400 400 450 T 800 450" fill="none" stroke="black" stroke-width="4" />
          <path d="M 0 490 Q 200 460 400 490 T 800 490" fill="none" stroke="black" stroke-width="3" />
          
          <!-- Contorno da Baleia -->
          <ellipse cx="500" cy="460" rx="190" ry="100" fill="none" stroke="black" stroke-width="4" />
          <polygon points="670,430 730,370 710,480" fill="none" stroke="black" stroke-width="4" />
          <circle cx="360" cy="420" r="14" fill="none" stroke="black" stroke-width="3" />
          <circle cx="360" cy="420" r="6" fill="black" />
          <path d="M 330 450 Q 360 470 390 450" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" />
          
          <!-- Contorno do Navio -->
          <path d="M 120 400 L 220 400 L 200 440 L 140 440 Z" fill="none" stroke="black" stroke-width="3" />
          <line x1="170" y1="400" x2="170" y2="340" stroke="black" stroke-width="3" />
          <polygon points="170,340 170,375 215,357" fill="none" stroke="black" stroke-width="2.5" />
        `;
      } else if (sub === 'moses') {
        extraElements = `
          <!-- Travessia de Moisés (Contornos para Colorir) -->
          <!-- Paredes de água laterais -->
          <path d="M 0 100 Q 120 200 120 480 L 0 480" fill="none" stroke="black" stroke-width="4" />
          <path d="M 800 100 Q 680 200 680 480 L 800 480" fill="none" stroke="black" stroke-width="4" />
          
          <!-- Caminho seco no fundo -->
          <ellipse cx="400" cy="480" rx="280" ry="40" fill="none" stroke="black" stroke-width="3" />
          <line x1="120" y1="480" x2="0" y2="600" stroke="black" stroke-width="4" />
          <line x1="680" y1="480" x2="800" y2="600" stroke="black" stroke-width="4" />
          
          <!-- Cajado de Moisés -->
          <line x1="280" y1="360" x2="280" y2="460" stroke="black" stroke-width="4" stroke-linecap="round" />
          <circle cx="280" cy="350" r="15" fill="none" stroke="black" stroke-width="3" />
        `;
      } else {
        // Arca de Noé (Contornos)
        extraElements = `
          <!-- Arca (Contorno) -->
          <path d="M 200 400 L 600 400 L 530 490 L 270 490 Z" fill="none" stroke="black" stroke-width="4" />
          <rect x="350" y="320" width="100" height="80" fill="none" stroke="black" stroke-width="4" />
          <polygon points="320,320 400,260 480,320" fill="none" stroke="black" stroke-width="4" />
          <rect x="385" y="350" width="30" height="50" fill="none" stroke="black" stroke-width="3" />
          
          <!-- Casal Animais (Contorno) -->
          <circle cx="300" cy="385" r="12" fill="none" stroke="black" stroke-width="3" />
          <path d="M 290 397 Q 300 375 310 397" fill="none" stroke="black" stroke-width="3" />
          <circle cx="500" cy="385" r="10" fill="none" stroke="black" stroke-width="3" />
        `;
        if (progress > 0.7) {
          extraElements += `
            <!-- Arco-íris (Contornos) -->
            <path d="M 100 480 A 300 300 0 0 1 700 480" fill="none" stroke="black" stroke-width="3" />
            <path d="M 120 480 A 280 280 0 0 1 680 480" fill="none" stroke="black" stroke-width="3" />
            <path d="M 140 480 A 260 260 0 0 1 660 480" fill="none" stroke="black" stroke-width="3" />
          `;
        }
      }
    } else if (theme === 'Aventura') {
      extraElements = `
        <!-- Montanhas Contorno -->
        <polygon points="50,480 250,220 450,480" fill="none" stroke="black" stroke-width="4" />
        <polygon points="350,480 550,260 750,480" fill="none" stroke="black" stroke-width="4" />
      `;
      if (page >= total - 2) {
        extraElements += `
          <!-- Árvore de Ouro Contorno -->
          <rect x="385" y="320" width="30" height="160" fill="none" stroke="black" stroke-width="4" />
          <circle cx="400" cy="240" r="90" fill="none" stroke="black" stroke-width="4" />
          <circle cx="360" cy="220" r="45" fill="none" stroke="black" stroke-width="3" />
          <circle cx="440" cy="250" r="50" fill="none" stroke="black" stroke-width="3" />
        `;
      }
    } else {
      // Educativo
      extraElements = `
        <!-- Mar Contornos -->
        <path d="M 0 450 Q 200 420 400 450 T 800 450" fill="none" stroke="black" stroke-width="4" />
        <path d="M 0 480 Q 200 450 400 480 T 800 480" fill="none" stroke="black" stroke-width="3" />
      `;
      if (page >= 2 && page <= 6) {
        extraElements += `
          <!-- Nuvem Contorno -->
          <path d="M 170 180 C 150 180 130 160 140 140 C 145 110 180 100 200 120 C 220 100 260 110 270 130 C 290 130 300 150 290 170 C 280 180 200 180 170 180 Z" fill="none" stroke="black" stroke-width="4" />
          
          <!-- Evaporação Contorno -->
          <path d="M 200 400 L 200 250" stroke="black" stroke-width="3" stroke-dasharray="6,6" />
          <path d="M 400 410 L 400 260" stroke="black" stroke-width="3" stroke-dasharray="6,6" />
        `;
      }
    }

    // Personagens em Contorno Preto (Sem preenchimento)
    let characterOutline = '';
    if (theme === 'Bíblico') {
      characterOutline = `
        <g transform="translate(180, 360)">
          <!-- Corpo/Roupas -->
          <rect x="-15" y="30" width="30" height="60" rx="10" fill="none" stroke="black" stroke-width="4" />
          <!-- Cabeça -->
          <circle cx="0" cy="10" r="22" fill="none" stroke="black" stroke-width="4" />
          <!-- Barba -->
          <path d="M -22 15 Q 0 45 22 15 L 15 35 Q 0 45 -15 35 Z" fill="none" stroke="black" stroke-width="3" />
          <!-- Olhos grandes -->
          <circle cx="-7" cy="5" r="5" fill="black" />
          <circle cx="7" cy="5" r="5" fill="black" />
          <!-- Boca feliz -->
          <path d="M -5 14 Q 0 18 5 14" fill="none" stroke="black" stroke-width="3" />
        </g>
      `;
    } else if (theme === 'Aventura') {
      characterOutline = `
        <g transform="translate(300, 390)">
          <!-- Corpo -->
          <ellipse cx="0" cy="45" rx="20" ry="25" fill="none" stroke="black" stroke-width="4" />
          <!-- Orelhas grandes de coelho -->
          <ellipse cx="-10" cy="-25" rx="8" ry="25" fill="none" stroke="black" stroke-width="4" transform="rotate(-10 -10 -25)" />
          <ellipse cx="10" cy="-25" rx="8" ry="25" fill="none" stroke="black" stroke-width="4" transform="rotate(10 10 -25)" />
          <!-- Cabeça -->
          <circle cx="0" cy="10" r="24" fill="none" stroke="black" stroke-width="4" />
          <!-- Olhos grandes -->
          <circle cx="-8" cy="4" r="6" fill="black" />
          <circle cx="8" cy="4" r="6" fill="black" />
          <!-- Narizinho -->
          <polygon points="-3,11 3,11 0,14" fill="black" />
          <!-- Sorriso -->
          <path d="M -6 17 Q 0 22 6 17" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" />
        </g>
      `;
    } else {
      characterOutline = `
        <g transform="translate(360, 330)">
          <!-- Gotinha shape -->
          <path d="M 0 -35 C 30 10 30 35 0 35 C -30 35 -30 10 0 -35 Z" fill="none" stroke="black" stroke-width="4" />
          <!-- Olhos de cartoon -->
          <circle cx="-7" cy="12" r="6" fill="black" />
          <circle cx="7" cy="12" r="6" fill="black" />
          <!-- Sorriso -->
          <path d="M -4 20 Q 0 24 4 20" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" />
        </g>
      `;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <!-- Quadro Externo para Pintura -->
  <rect width="800" height="600" fill="white" stroke="black" stroke-width="5" />
  
  <!-- Sol/Lua -->
  <circle cx="700" cy="100" r="45" fill="none" stroke="black" stroke-width="4" />
  
  <!-- Chão -->
  <path d="M 0 470 Q 200 440 400 470 T 800 470" fill="none" stroke="black" stroke-width="4" />
  <line x1="0" y1="480" x2="800" y2="480" stroke="black" stroke-width="4" />
  
  ${extraElements}
  
  <!-- Personagem Principal Contorno -->
  ${characterOutline}
</svg>`;
  }
}
