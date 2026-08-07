import { saveUserToFirestore } from './firebaseConfig';

export interface UserSession {
  email: string;
  role: 'admin' | 'user';
  expiresAt: string;
  name?: string;
}

export interface RegisteredUser {
  email: string;
  passwordHash: string;
  name: string;
  whatsapp: string;
  createdAt: string;
}

const APP_SALT = 'toontales-secure-salt-2026';

export const AuthService = {
  // Simple custom signature to prevent basic devtools role manipulation
  generateSignature(session: UserSession): string {
    const data = `${session.email}:${session.role}:${session.expiresAt}:${APP_SALT}`;
    // Simple hash function (cyrb53 or similar helper)
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < data.length; i++) {
      ch = data.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  },

  // Simple string hash helper to store password obfuscated
  hashPassword(password: string): string {
    let h = 0;
    for (let i = 0; i < password.length; i++) {
      h = Math.imul(31, h) + password.charCodeAt(i) | 0;
    }
    return h.toString(16);
  },

  getRegisteredUsers(): RegisteredUser[] {
    try {
      const saved = localStorage.getItem('toontales_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  async registerUser(email: string, password: string, name: string, whatsapp: string): Promise<{ success: boolean; message: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedWhatsapp = whatsapp.trim();
    if (!trimmedEmail || !password || !name || !trimmedWhatsapp) {
      return { success: false, message: 'Todos os campos são obrigatórios.' };
    }

    const users = this.getRegisteredUsers();
    if (users.some(u => u.email === trimmedEmail) || trimmedEmail === 'nogueiralfha@gmail.com') {
      return { success: false, message: 'Este endereço de e-mail já está cadastrado.' };
    }

    // Gravar no Firestore
    try {
      await saveUserToFirestore(trimmedEmail, name.trim(), trimmedWhatsapp);
    } catch (firebaseErr: any) {
      console.error("Falha ao sincronizar com Firestore:", firebaseErr);
      return { 
        success: false, 
        message: `[V4-LEADS] Erro ao salvar na nuvem (Firebase): ${firebaseErr.message || firebaseErr}.` 
      };
    }

    const newUser: RegisteredUser = {
      email: trimmedEmail,
      passwordHash: this.hashPassword(password),
      name: name.trim(),
      whatsapp: trimmedWhatsapp,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('toontales_registered_users', JSON.stringify(users));

    return { success: true, message: 'Conta criada com sucesso!' };
  },

  saveSession(email: string, role: 'admin' | 'user', name?: string) {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours expiration
    const session: UserSession = { email, role, expiresAt, name };
    const signature = this.generateSignature(session);
    
    localStorage.setItem('toontales_session', JSON.stringify({ session, signature }));
  },

  getSession(): UserSession | null {
    try {
      const saved = localStorage.getItem('toontales_session');
      if (!saved) return null;

      const { session, signature } = JSON.parse(saved);
      
      // Verify signature
      const expectedSignature = this.generateSignature(session);
      if (signature !== expectedSignature) {
        console.warn("Assinatura de sessão inválida! Possível tentativa de manipulação.");
        this.clearSession();
        return null;
      }

      // Check expiration
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (e) {
      this.clearSession();
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem('toontales_session');
  }
};

