import { Document } from '../../domain/entities/Document';

export interface DocumentRepository {
  save(document: Document): Promise<Document>;
  findAll(): Promise<Document[]>;
  delete(id: string): Promise<void>;
}
