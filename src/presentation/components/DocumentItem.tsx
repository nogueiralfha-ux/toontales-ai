import React from 'react';
import { Document } from '../../domain/entities/Document';

interface DocumentItemProps {
  document: Document;
  onDelete: (id: string) => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ document: doc, onDelete }) => {
  const isExpiringSoon = () => {
    if (!doc.expiryDate) return false;
    const diffTime = doc.expiryDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30; // 30 dias de aviso
  };

  const isExpired = () => {
    if (!doc.expiryDate) return false;
    return doc.expiryDate.getTime() < new Date().getTime();
  };

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = doc.content;
    link.download = doc.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const getFriendlySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="doc-item">
      <div className="doc-info">
        <span className={`doc-badge badge-${doc.category.toLowerCase()}`}>
          {doc.category}
        </span>
        <div>
          <h3 className="doc-name">{doc.name}</h3>
          <div className="doc-meta">
            <span>Tamanho: {getFriendlySize(doc.size)}</span>
            {doc.expiryDate && (
              <span
                className={`doc-expiry ${isExpired() ? 'expires-soon' : isExpiringSoon() ? 'expires-soon' : ''}`}
                style={isExpired() ? { color: 'hsl(var(--destructive))' } : {}}
              >
                {isExpired()
                  ? '⚠️ Expirado'
                  : isExpiringSoon()
                  ? `⚠️ Vence em ${doc.expiryDate.toLocaleDateString()}`
                  : `Vence em ${doc.expiryDate.toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="doc-actions">
        <button
          className="action-btn"
          onClick={handleDownload}
          aria-label={`Baixar arquivo "${doc.name}"`}
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          className="action-btn delete"
          onClick={() => onDelete(doc.id)}
          aria-label={`Excluir arquivo "${doc.name}"`}
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
