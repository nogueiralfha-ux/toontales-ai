export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
export type UserRole = 'SUPER_ADMIN' | 'CLUB_ADMIN' | 'PLAYER';

export interface CharacterStats {
  speed: number;
  power: number;
  technique: number;
  precision: number;
  defense: number;
  stamina: number;
  agility: number;
}

export interface SpecialAbility {
  name: string;
  description: string;
  bonusStat: keyof CharacterStats;
  multiplier: number;
}

export interface Character {
  id: string;
  name: string;
  vegetable: string;
  gender: 'M' | 'F' | 'O';
  rarity: Rarity;
  level: number;
  xp: number;
  overall: number;
  stats: CharacterStats;
  specialAbility: SpecialAbility;
  personality: string;
  clubId: string | null;
  availableSports: string[];
  visualId: string;
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  active: boolean;
  sportIds: string[];
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'MISS' | 'SAVE' | 'FOUL' | 'CARD' | 'START' | 'END' | 'INFO';
  description: string;
  playerName?: string;
  clubName?: string;
}

export interface Match {
  id: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  status: 'SCHEDULED' | 'PLAYING' | 'FINISHED';
  events: MatchEvent[];
  possession: number; // 0 to 100
  shotsHome: number;
  shotsAway: number;
  passesHome: number;
  passesAway: number;
}

export interface Standing {
  clubId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface UserWallet {
  coins: number;
  gems: number;
  energy: number;
  lastEnergyRefill: number; // timestamp
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'characters' | 'skins' | 'uniforms' | 'accessories' | 'balls' | 'stadiums' | 'celebrations' | 'emotes';
  price: number;
  currency: 'coins' | 'gems';
  rarity: Rarity;
  description: string;
  visualId: string;
  purchased: boolean;
  metadata?: any;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'SEASON';
  target: number;
  current: number;
  completed: boolean;
  rewardType: 'coins' | 'gems' | 'xp';
  rewardAmount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface UserProfile {
  email: string;
  username: string;
  role: UserRole;
  level: number;
  xp: number;
  favoriteClubId: string | null;
  wins: number;
  losses: number;
  draws: number;
  trophies: number;
  wallet: UserWallet;
  inventory: {
    characters: string[]; // Character IDs
    skins: string[];
    uniforms: string[];
    accessories: string[];
    stadiums: string[];
    balls: string[];
    emotes: string[];
  };
}
