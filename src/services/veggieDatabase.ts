import { Character, Club, Mission, Achievement, ShopItem, UserProfile, Standing } from '../domain/veggieTypes';
import { INITIAL_CHARACTERS, INITIAL_CLUBS, INITIAL_MISSIONS, INITIAL_ACHIEVEMENTS, INITIAL_SHOP_ITEMS } from '../data/veggieInitialData';

const STORAGE_KEYS = {
  USERS: 'veggieworld_users',
  CURRENT_USER_EMAIL: 'veggieworld_current_user_email',
  CHARACTERS: 'veggieworld_characters',
  CLUBS: 'veggieworld_clubs',
  MISSIONS: 'veggieworld_missions',
  ACHIEVEMENTS: 'veggieworld_achievements',
  SHOP: 'veggieworld_shop',
  STANDINGS: 'veggieworld_standings',
  MATCHES: 'veggieworld_matches'
};

interface UserAccount {
  email: string;
  passwordHash: string; // senha simples em texto para o MVP local
  profile: UserProfile;
}

export class VeggieDatabase {
  
  static init(): void {
    // Inicialização da lista global de usuários
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const defaultUsers: Record<string, UserAccount> = {};
      
      // Criação da conta do Super Administrador por padrão
      const superAdminEmail = 'nogueiralfha@gmail.com';
      defaultUsers[superAdminEmail] = {
        email: superAdminEmail,
        passwordHash: 'missionario405',
        profile: {
          email: superAdminEmail,
          username: 'Administrador Geral',
          role: 'SUPER_ADMIN',
          level: 10,
          xp: 0,
          favoriteClubId: 'carrot_united',
          wins: 0,
          losses: 0,
          draws: 0,
          trophies: 0,
          wallet: {
            coins: 99999,
            gems: 999,
            energy: 100,
            lastEnergyRefill: Date.now()
          },
          inventory: {
            characters: ['carrot_carl', 'potato_pat', 'broccoli_brock', 'tomato_tina', 'corn_cob', 'pepper_pepe', 'cucumber_cris', 'onion_olivia'],
            skins: [],
            uniforms: [],
            accessories: [],
            stadiums: [],
            balls: [],
            emotes: []
          }
        }
      };
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CHARACTERS)) {
      localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(INITIAL_CHARACTERS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
      localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(INITIAL_CLUBS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.MISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(INITIAL_MISSIONS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SHOP)) {
      localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(INITIAL_SHOP_ITEMS));
    }

    this.checkAndRecoverEnergy();
    this.initLeague();
  }

  // LOGIN MOCKADO
  static login(email: string, passwordHash: string): { success: boolean; message: string; profile?: UserProfile } {
    this.init();
    const users: Record<string, UserAccount> = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    const user = users[email.toLowerCase().trim()];
    
    if (!user || user.passwordHash !== passwordHash) {
      return { success: false, message: 'E-mail ou senha incorretos!' };
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, email.toLowerCase().trim());
    return { success: true, message: 'Conectado com sucesso!', profile: user.profile };
  }

  // CADASTRO MOCKADO - Todos novos usuários são CLUB_ADMIN (gerenciam seu próprio clube de coração)
  static register(email: string, passwordHash: string, username: string, favoriteClubId: string): { success: boolean; message: string } {
    this.init();
    const users: Record<string, UserAccount> = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    const normalizedEmail = email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      return { success: false, message: 'Este e-mail já está cadastrado!' };
    }

    const newProfile: UserProfile = {
      email: normalizedEmail,
      username,
      role: 'CLUB_ADMIN', // Cada usuário que se cadastrar vira gestor/administrador de seu time favorito
      level: 1,
      xp: 0,
      favoriteClubId,
      wins: 0,
      losses: 0,
      draws: 0,
      trophies: 0,
      wallet: {
        coins: 1000,
        gems: 10,
        energy: 100,
        lastEnergyRefill: Date.now()
      },
      inventory: {
        characters: ['carrot_carl', 'potato_pat', 'broccoli_brock', 'cucumber_cris'], // Elenco inicial padrão
        skins: [],
        uniforms: [],
        accessories: [],
        stadiums: [],
        balls: [],
        emotes: []
      }
    };

    users[normalizedEmail] = {
      email: normalizedEmail,
      passwordHash,
      profile: newProfile
    };

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true, message: 'Usuário cadastrado com sucesso!' };
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
  }

  static getProfile(): UserProfile {
    this.checkAndRecoverEnergy();
    const currentEmail = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
    if (!currentEmail) {
      // Retorna perfil de visitante padrão para evitar quebras se não logado
      return {
        email: '',
        username: 'Visitante',
        role: 'PLAYER',
        level: 1,
        xp: 0,
        favoriteClubId: 'carrot_united',
        wins: 0,
        losses: 0,
        draws: 0,
        trophies: 0,
        wallet: { coins: 0, gems: 0, energy: 0, lastEnergyRefill: Date.now() },
        inventory: { characters: [], skins: [], uniforms: [], accessories: [], stadiums: [], balls: [], emotes: [] }
      };
    }
    const users: Record<string, UserAccount> = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    return users[currentEmail.toLowerCase()].profile;
  }

  static saveProfile(profile: UserProfile): void {
    const currentEmail = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
    if (!currentEmail) return;

    const users: Record<string, UserAccount> = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    users[currentEmail.toLowerCase()].profile = profile;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getCharacters(): Character[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARACTERS) || '[]');
  }

  static saveCharacters(characters: Character[]): void {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  }

  static getClubs(): Club[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLUBS) || '[]');
  }

  static saveClubs(clubs: Club[]): void {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  }

  static getMissions(): Mission[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSIONS) || '[]');
  }

  static saveMissions(missions: Mission[]): void {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  }

  static getAchievements(): Achievement[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || '[]');
  }

  static saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  static getShopItems(): ShopItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOP) || '[]');
  }

  static saveShopItems(items: ShopItem[]): void {
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(items));
  }

  static getStandings(): Standing[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STANDINGS) || '[]');
  }

  static saveStandings(standings: Standing[]): void {
    localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(standings));
  }

  static checkAndRecoverEnergy(): void {
    const currentEmail = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
    if (!currentEmail) return;

    const users: Record<string, UserAccount> = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    const user = users[currentEmail.toLowerCase()];
    if (!user) return;
    
    const profile = user.profile;
    const now = Date.now();
    const elapsedMs = now - profile.wallet.lastEnergyRefill;
    const recoveryInterval = 120 * 1000;

    if (elapsedMs >= recoveryInterval && profile.wallet.energy < 100) {
      const recovered = Math.floor(elapsedMs / recoveryInterval);
      profile.wallet.energy = Math.min(100, profile.wallet.energy + recovered);
      profile.wallet.lastEnergyRefill = now - (elapsedMs % recoveryInterval);
      
      users[currentEmail.toLowerCase()].profile = profile;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  static initLeague(): void {
    if (!localStorage.getItem(STORAGE_KEYS.STANDINGS)) {
      const clubs = this.getClubs().filter(c => c.active);
      const standings: Standing[] = clubs.map(club => ({
        clubId: club.id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));
      this.saveStandings(standings);
    }
  }

  static addRewards(coins: number, gems: number, xp: number): void {
    const profile = this.getProfile();
    profile.wallet.coins += coins;
    profile.wallet.gems += gems;
    profile.xp += xp;

    const xpNeeded = profile.level * 1000;
    if (profile.xp >= xpNeeded) {
      profile.xp -= xpNeeded;
      profile.level += 1;
    }

    this.saveProfile(profile);
  }

  static consumeEnergy(amount: number): boolean {
    const profile = this.getProfile();
    if (profile.wallet.energy < amount) return false;
    profile.wallet.energy -= amount;
    this.saveProfile(profile);
    return true;
  }

  static buyShopItem(itemId: string): { success: boolean; message: string } {
    const profile = this.getProfile();
    const shopItems = this.getShopItems();
    const itemIndex = shopItems.findIndex(i => i.id === itemId);

    if (itemIndex === -1) return { success: false, message: 'Item não encontrado' };
    const item = shopItems[itemIndex];

    if (item.purchased) return { success: false, message: 'Item já adquirido' };

    if (item.currency === 'coins') {
      if (profile.wallet.coins < item.price) return { success: false, message: 'Moedas insuficientes' };
      profile.wallet.coins -= item.price;
    } else {
      if (profile.wallet.gems < item.price) return { success: false, message: 'Gemas insuficientes' };
      profile.wallet.gems -= item.price;
    }

    item.purchased = true;
    shopItems[itemIndex] = item;
    this.saveShopItems(shopItems);

    if (item.category === 'characters') {
      if (!profile.inventory.characters.includes(item.visualId)) {
        profile.inventory.characters.push(item.visualId);
      }
    } else if (item.category === 'skins') {
      profile.inventory.skins.push(item.visualId);
    } else if (item.category === 'uniforms') {
      profile.inventory.uniforms.push(item.visualId);
    } else if (item.category === 'stadiums') {
      profile.inventory.stadiums.push(item.visualId);
    }

    this.saveProfile(profile);
    this.triggerAchievement('veggie_legend');
    return { success: true, message: 'Purchase successful!' };
  }

  static updateMissionProgress(missionId: string, amount: number): void {
    const missions = this.getMissions();
    const m = missions.find(x => x.id === missionId);
    if (m && !m.completed) {
      m.current = Math.min(m.target, m.current + amount);
      if (m.current >= m.target) {
        m.completed = true;
        this.addRewards(
          m.rewardType === 'coins' ? m.rewardAmount : 0,
          m.rewardType === 'gems' ? m.rewardAmount : 0,
          m.rewardType === 'xp' ? m.rewardAmount : 0
        );
      }
      this.saveMissions(missions);
    }
  }

  static triggerAchievement(achievementId: string): void {
    const achievements = this.getAchievements();
    const ach = achievements.find(x => x.id === achievementId);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString();
      this.saveAchievements(achievements);
      this.addRewards(200, 2, 100);
    }
  }
}
