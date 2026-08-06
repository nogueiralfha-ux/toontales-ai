export interface UserSession {
  email: string;
  role: 'admin' | 'user';
  expiresAt: string;
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

  saveSession(email: string, role: 'admin' | 'user') {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours expiration
    const session: UserSession = { email, role, expiresAt };
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
