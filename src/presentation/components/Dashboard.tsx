import React from 'react';
import { Document } from '../../domain/entities/Document';

interface DashboardProps {
  documents: Document[];
}

export const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  const totalCount = documents.length;

  const expiringSoonCount = documents.filter((doc) => {
    if (!doc.expiryDate) return false;
    const diffTime = doc.expiryDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const expiredCount = documents.filter((doc) => {
    if (!doc.expiryDate) return false;
    return doc.expiryDate.getTime() < new Date().getTime();
  }).length;

  const totalSizeBytes = documents.reduce((sum, doc) => sum + doc.size, 0);
  const totalSizeKB = (totalSizeBytes / 1024).toFixed(1);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Documentos</span>
        <span className="stat-value">{totalCount}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Armazenamento</span>
        <span className="stat-value">{totalSizeKB} KB</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Próximos do Vencimento</span>
        <span className="stat-value" style={{ color: expiringSoonCount > 0 ? 'hsl(var(--warning))' : 'inherit' }}>
          {expiringSoonCount}
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Vencidos / Expirados</span>
        <span className="stat-value" style={{ color: expiredCount > 0 ? 'hsl(var(--destructive))' : 'inherit' }}>
          {expiredCount}
        </span>
      </div>
    </div>
  );
};
