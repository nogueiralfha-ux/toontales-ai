import React from 'react';
import { Document } from '../../domain/entities/Document';
import { DocumentItem } from './DocumentItem';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  if (documents.length === 0) {
    return <p className="empty-state">Nenhum documento arquivado. Utilize a área de upload acima.</p>;
  }

  return (
    <div className="doc-list">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
};
