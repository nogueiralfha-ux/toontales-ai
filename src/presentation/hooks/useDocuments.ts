import { useState, useEffect } from 'react';
import { Document } from '../../domain/entities/Document';
import { LocalStorageDocumentRepository } from '../../data/repositories/LocalStorageDocumentRepository';

const repository = new LocalStorageDocumentRepository();

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await repository.findAll();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar documentos.');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    category: 'Contrato' | 'Comprovante' | 'Identidade' | 'Outros',
    expiryDate?: Date
  ) => {
    // 1. Validações de Segurança
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB limite LocalStorage
    if (file.size > maxSizeBytes) {
      throw new Error('O arquivo excede o limite de 2MB seguro para armazenamento local.');
    }

    const blockedExtensions = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && blockedExtensions.includes(fileExtension)) {
      throw new Error('Tipo de arquivo não permitido por razões de segurança.');
    }

    // 2. Leitura do arquivo para Base64
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = reader.result as string;

          const newDoc: Document = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            content: base64Content,
            category,
            expiryDate,
            createdAt: new Date(),
          };

          await repository.save(newDoc);
          setDocuments((prev) => [...prev, newDoc]);
          resolve();
        } catch (err: any) {
          setError(err.message);
          reject(err);
        }
      };
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo.'));
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteDocument = async (id: string) => {
    try {
      await repository.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError('Erro ao excluir documento.');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    clearError: () => setError(null),
  };
};
