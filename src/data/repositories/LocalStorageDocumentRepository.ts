import { Document } from '../../domain/entities/Document';
import { DocumentRepository } from '../protocols/DocumentRepository';

export class LocalStorageDocumentRepository implements DocumentRepository {
  private readonly storageKey = '@LocalSecure:documents';

  // Ofuscação simples local para proteção contra inspeção casual do LocalStorage
  private encrypt(text: string): string {
    return btoa(
      text
        .split('')
        .map((char) => String.fromCharCode(char.charCodeAt(0) ^ 42))
        .join('')
    );
  }

  private decrypt(encoded: string): string {
    try {
      const decoded = atob(encoded);
      return decoded
        .split('')
        .map((char) => String.fromCharCode(char.charCodeAt(0) ^ 42))
        .join('');
    } catch {
      return '';
    }
  }

  async save(document: Document): Promise<Document> {
    const documents = await this.findAll();
    const encryptedContent = this.encrypt(document.content);

    const docToSave = {
      ...document,
      content: encryptedContent,
    };

    // Remove documento existente se for atualização
    const filtered = documents.filter((d) => d.id !== document.id);
    filtered.push(docToSave);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Limite de cota de armazenamento local excedido. Tente remover arquivos antigos.');
      }
      throw new Error('Falha ao salvar o documento localmente.');
    }

    return document;
  }

  async findAll(): Promise<Document[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data);

      return parsed.map((doc: any) => ({
        ...doc,
        content: this.decrypt(doc.content),
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
        createdAt: new Date(doc.createdAt),
      }));
    } catch (error) {
      console.error('Falha ao recuperar documentos do armazenamento local', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const documents = await this.findAll();
    const filtered = documents.filter((d) => d.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
}
