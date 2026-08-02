export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // Conteúdo encriptado/ofuscado em Base64
  category: 'Contrato' | 'Comprovante' | 'Identidade' | 'Outros';
  expiryDate?: Date;
  createdAt: Date;
}
