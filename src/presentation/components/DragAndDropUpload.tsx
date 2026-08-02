import React, { useState, useRef } from 'react';

interface DragAndDropUploadProps {
  onUpload: (file: File, category: 'Contrato' | 'Comprovante' | 'Identidade' | 'Outros', expiryDate?: Date) => Promise<void>;
}

export const DragAndDropUpload: React.FC<DragAndDropUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState<'Contrato' | 'Comprovante' | 'Identidade' | 'Outros'>('Contrato');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    try {
      setLoading(true);
      setLocalError(null);
      await onUpload(
        file,
        category,
        expiryDate ? new Date(expiryDate) : undefined
      );
      setExpiryDate('');
    } catch (err: any) {
      setLocalError(err.message || 'Falha ao processar arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        aria-label="Área de upload de documentos. Arraste e solte ou clique para selecionar."
        onKeyDown={(e) => e.key === 'Enter' && triggerFileInput()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={loading}
        />
        <div className="upload-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="upload-text">
          {loading ? 'Processando arquivo...' : 'Arraste e solte o arquivo ou clique aqui'}
        </p>
        <p className="upload-sub">PDF, PNG, JPG, TXT (Max: 2MB)</p>
      </div>

      {localError && (
        <div style={{ color: 'hsl(346, 84%, 61%)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
          ⚠️ {localError}
        </div>
      )}

      <div className="meta-form">
        <div className="form-group">
          <label className="form-label" htmlFor="doc-category">Categoria do Documento</label>
          <select
            id="doc-category"
            className="form-select"
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="Contrato">Contrato</option>
            <option value="Comprovante">Comprovante</option>
            <option value="Identidade">Identidade</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="doc-expiry">Data de Vencimento (Opcional)</label>
          <input
            id="doc-expiry"
            className="form-input"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};
