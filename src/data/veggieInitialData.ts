import { Character, Club, Mission, Achievement, ShopItem } from '../domain/veggieTypes';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'carrot_carl',
    name: 'Carla Cenoura (Cenourinha)',
    vegetable: 'Carrot',
    gender: 'F',
    rarity: 'RARE',
    level: 1,
    xp: 0,
    overall: 78,
    stats: { speed: 88, power: 72, technique: 75, precision: 76, defense: 68, stamina: 80, agility: 85 },
    specialAbility: { name: 'Arrancada de Raiz', description: 'Ganha um bônus massivo de velocidade ao atacar.', bonusStat: 'speed', multiplier: 1.3 },
    personality: 'Hiperativa, focada e muito veloz com rabo de cavalo de folhas verdes.',
    clubId: 'carrot_united',
    availableSports: ['veggie_cup'],
    visualId: 'carrot_female_football'
  },
  {
    id: 'potato_pat',
    name: 'Patrício "Paredão" Batata',
    vegetable: 'Potato',
    gender: 'M',
    rarity: 'COMMON',
    level: 1,
    xp: 0,
    overall: 74,
    stats: { speed: 50, power: 85, technique: 60, precision: 55, defense: 88, stamina: 90, agility: 52 },
    specialAbility: { name: 'Escudo de Amido', description: 'Bloqueia passes adversários sem esforço.', bonusStat: 'defense', multiplier: 1.25 },
    personality: 'Calmo, sólido, confiável e muito forte fisicamente.',
    clubId: 'potato_warriors',
    availableSports: ['veggie_cup'],
    visualId: 'potato_male_football'
  },
  {
    id: 'broccoli_brock',
    name: 'Paula Brócolis (Brocolina)',
    vegetable: 'Broccoli',
    gender: 'F',
    rarity: 'EPIC',
    level: 1,
    xp: 0,
    overall: 82,
    stats: { speed: 70, power: 78, technique: 86, precision: 82, defense: 80, stamina: 82, agility: 75 },
    specialAbility: { name: 'Passe de Copa', description: 'Cria assistências perfeitas com efeito calculado.', bonusStat: 'technique', multiplier: 1.35 },
    personality: 'Estrategista genial com cabelo curto afro feito de pequenos brócolis verdes.',
    clubId: 'broccoli_fc',
    availableSports: ['veggie_cup'],
    visualId: 'broccoli_female_football'
  },
  {
    id: 'tomato_tina',
    name: 'Tina Tomate Doce',
    vegetable: 'Tomato',
    gender: 'F',
    rarity: 'LEGENDARY',
    level: 1,
    xp: 0,
    overall: 88,
    stats: { speed: 82, power: 80, technique: 90, precision: 92, defense: 60, stamina: 78, agility: 89 },
    specialAbility: { name: 'Curva Suculenta', description: 'Chutes em curva que enganam a defesa e o goleiro.', bonusStat: 'precision', multiplier: 1.4 },
    personality: 'Carismática estrela do time com uniforme de cano alto azul e amarelo.',
    clubId: 'tomato_stars',
    availableSports: ['veggie_cup'],
    visualId: 'tomato_female_football'
  },
  {
    id: 'corn_cob',
    name: 'Coronel Milho',
    vegetable: 'Corn',
    gender: 'M',
    rarity: 'COMMON',
    level: 1,
    xp: 0,
    overall: 72,
    stats: { speed: 65, power: 76, technique: 68, precision: 70, defense: 70, stamina: 72, agility: 65 },
    specialAbility: { name: 'Pulo do Grão', description: 'Salto explosivo para vencer disputas aéreas de cabeça.', bonusStat: 'power', multiplier: 1.2 },
    personality: 'Disciplinado, líder experiente e muito focado em quadra.',
    clubId: 'potato_warriors',
    availableSports: ['veggie_cup'],
    visualId: 'corn_male_football'
  },
  {
    id: 'pepper_pepe',
    name: 'Pimentão Veloz',
    vegetable: 'Hot Pepper',
    gender: 'M',
    rarity: 'EPIC',
    level: 1,
    xp: 0,
    overall: 80,
    stats: { speed: 92, power: 65, technique: 78, precision: 80, defense: 50, stamina: 75, agility: 93 },
    specialAbility: { name: 'Drible Ardente', description: 'Confunde defensores com fintas rápidas e giros.', bonusStat: 'agility', multiplier: 1.35 },
    personality: 'Focado, explosivo e extremamente competitivo.',
    clubId: 'tomato_stars',
    availableSports: ['veggie_cup'],
    visualId: 'pepper_male_football'
  },
  {
    id: 'cucumber_cris',
    name: 'Pepino Tenista (Pepina)',
    vegetable: 'Cucumber',
    gender: 'F',
    rarity: 'COMMON',
    level: 1,
    xp: 0,
    overall: 73,
    stats: { speed: 78, power: 62, technique: 74, precision: 72, defense: 68, stamina: 78, agility: 75 },
    specialAbility: { name: 'Bote Gelado', description: 'Desarmes limpos e precisos na lateral.', bonusStat: 'defense', multiplier: 1.2 },
    personality: 'Super descontraída, sempre jogando com viseira e tranças verdes.',
    clubId: 'carrot_united',
    availableSports: ['veggie_cup'],
    visualId: 'cucumber_female_football'
  },
  {
    id: 'onion_olivia',
    name: 'Olívia Cebola',
    vegetable: 'Onion',
    gender: 'F',
    rarity: 'RARE',
    level: 1,
    xp: 0,
    overall: 77,
    stats: { speed: 70, power: 75, technique: 82, precision: 74, defense: 72, stamina: 76, agility: 78 },
    specialAbility: { name: 'Gás Lacrimogêneo', description: 'Desestabiliza o oponente fazendo perder a posse de bola.', bonusStat: 'technique', multiplier: 1.3 },
    personality: 'Dramática, joga com muita raça e vibração.',
    clubId: 'broccoli_fc',
    availableSports: ['veggie_cup'],
    visualId: 'onion_female_football'
  }
];

export const INITIAL_CLUBS: Club[] = [
  { id: 'carrot_united', name: 'Cenoura FC', logo: '🥕', primaryColor: '#FF6B35', secondaryColor: '#4CAF50', active: true, sportIds: ['veggie_cup'] },
  { id: 'broccoli_fc', name: 'Brócolis Esporte Clube', logo: '🥦', primaryColor: '#2E7D32', secondaryColor: '#81C784', active: true, sportIds: ['veggie_cup'] },
  { id: 'tomato_stars', name: 'Tomate Estrela', logo: '🍅', primaryColor: '#E53935', secondaryColor: '#FFFFFF', active: true, sportIds: ['veggie_cup'] },
  { id: 'potato_warriors', name: 'Guerreiros da Batata', logo: '🥔', primaryColor: '#8D6E63', secondaryColor: '#FFD54F', active: true, sportIds: ['veggie_cup'] }
];

export const INITIAL_MISSIONS: Mission[] = [
  { id: 'mission_daily_play', title: 'Início dos Treinos', description: 'Jogue 1 Partida na Veggie Cup.', type: 'DAILY', target: 1, current: 0, completed: false, rewardType: 'coins', rewardAmount: 100 },
  { id: 'mission_daily_goals', title: 'Caçador de Gols', description: 'Marque 3 gols em partidas.', type: 'DAILY', target: 3, current: 0, completed: false, rewardType: 'gems', rewardAmount: 5 },
  { id: 'mission_weekly_wins', title: 'Horta Dominante', description: 'Vença 5 partidas esta semana.', type: 'WEEKLY', target: 5, current: 0, completed: false, rewardType: 'coins', rewardAmount: 500 }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_match', title: 'Primeira Partida', description: 'Complete seu primeiro jogo na Veggie Cup.', unlocked: false, icon: '⚽' },
  { id: 'first_goal', title: 'Primeiro Grito', description: 'Marque seu primeiro gol no torneio.', unlocked: false, icon: '🥅' },
  { id: 'first_win', title: 'Primeira Vitória', description: 'Vença sua primeira partida de futebol.', unlocked: false, icon: '🏆' }
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'shop_garlic_garrison', name: 'Garrison Alho (Mitológico)', category: 'characters', price: 1500, currency: 'coins', rarity: 'MYTHIC', description: 'O lendário meio-campista com aura de tempero.', visualId: 'garlic_male_football', purchased: false },
  { id: 'shop_skin_carl_cyber', name: 'Skin Cenoura Cyber', category: 'skins', price: 50, currency: 'gems', rarity: 'LEGENDARY', description: 'Estética neon brilhante para a Carla Cenoura.', visualId: 'skin_carl_cyber', purchased: false }
];
