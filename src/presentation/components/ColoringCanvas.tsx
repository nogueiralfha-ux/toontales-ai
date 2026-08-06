import React, { useRef, useState, useEffect } from 'react';

interface ColoringCanvasProps {
  coloringSvg: string;
  storyTitle: string;
  pageNumber: number;
  coloringUrl?: string;
}

type PaletteType = 'floresta' | 'oceano' | 'espaco' | 'fada';

const PALETTES: Record<PaletteType, { name: string; colors: string[] }> = {
  floresta: {
    name: '🌲 Floresta Lúdica',
    colors: ['#2D5A27', '#4E9F3D', '#8ECA62', '#D8E2DC', '#E8C547', '#A0522D', '#D2B48C', '#8B4513', '#FFF']
  },
  oceano: {
    name: '🌊 Fundo do Mar',
    colors: ['#0077B6', '#0096C7', '#03045E', '#90E0EF', '#00B4D8', '#FF80A0', '#FFB3C6', '#FFE5EC', '#FFF']
  },
  espaco: {
    name: '🚀 Galáxia e Estrelas',
    colors: ['#7209B7', '#3F37C9', '#4CC9F0', '#F72585', '#B5179E', '#FFB703', '#FB8500', '#240046', '#FFF']
  },
  fada: {
    name: '🧚 Castelo Encantado',
    colors: ['#FFC6FF', '#BDB2FF', '#9BF6FF', '#CAFFBF', '#FDFFB6', '#FFADAD', '#FFD6A5', '#FFF0F5', '#FFF']
  }
};

type ToolType = 'brush' | 'crayon' | 'spray' | 'eraser';

const BRUSH_SIZES = [4, 8, 16, 24];

export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({ coloringSvg, storyTitle, pageNumber, coloringUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activePalette, setActivePalette] = useState<PaletteType>('floresta');
  const [selectedColor, setSelectedColor] = useState(PALETTES.floresta.colors[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas with SVG background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width || 800;
      canvas.height = rect.height || 600;

      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save initial state to history (limit history to 15 entries)
      const initialState = canvas.toDataURL();
      setHistory([initialState]);
      setHistoryIndex(0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [coloringSvg]);

  // Adjust selected color if it is not in the newly selected palette
  useEffect(() => {
    const currentColors = PALETTES[activePalette].colors;
    if (!currentColors.includes(selectedColor)) {
      setSelectedColor(currentColors[0]);
    }
  }, [activePalette, selectedColor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Set Tool properties
    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.globalCompositeOperation = 'source-over'; // Draw white over
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'spray') {
      // Draw spray paint dots
      ctx.fillStyle = selectedColor;
      const density = 25;
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * brushSize * 1.2;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        ctx.fillRect(coords.x + offsetX, coords.y + offsetY, 1.5, 1.5);
      }
    } else if (activeTool === 'crayon') {
      // Draw crayon texture effect (low opacity line with slight offsets)
      ctx.strokeStyle = selectedColor;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = brushSize;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      // Jitter secondary dots for rough cera texture
      ctx.fillStyle = selectedColor;
      const jitterCount = Math.floor(brushSize / 2);
      for (let i = 0; i < jitterCount; i++) {
        const offsetRange = brushSize / 2;
        const rx = coords.x + (Math.random() - 0.5) * offsetRange;
        const ry = coords.y + (Math.random() - 0.5) * offsetRange;
        ctx.fillRect(rx, ry, 1, 1);
      }
      ctx.globalAlpha = 1.0; // Reset
    } else {
      // Normal brush or eraser
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save to history (Keep maximum of 15 undo states to prevent leaks)
    const dataUrl = canvas.toDataURL();
    const slicedHistory = history.slice(Math.max(0, historyIndex - 14), historyIndex + 1);
    slicedHistory.push(dataUrl);
    setHistory(slicedHistory);
    setHistoryIndex(slicedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevIndex = historyIndex - 1;
    const img = new Image();
    img.src = history[prevIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(prevIndex);
    };
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextIndex = historyIndex + 1;
    const img = new Image();
    img.src = history[nextIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(nextIndex);
    };
  };

  const handleClear = () => {
    if (!window.confirm("Deseja apagar sua pintura inteira e recomeçar?")) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save state
    const dataUrl = canvas.toDataURL();
    const slicedHistory = history.slice(Math.max(0, historyIndex - 14), historyIndex + 1);
    slicedHistory.push(dataUrl);
    setHistory(slicedHistory);
    setHistoryIndex(slicedHistory.length - 1);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Combine current canvas drawing and the SVG outline overlay
    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = canvas.width;
    mergeCanvas.height = canvas.height;
    const mctx = mergeCanvas.getContext('2d');
    if (!mctx) return;

    // Draw background painted canvas
    mctx.drawImage(canvas, 0, 0);

    // Draw outline on top
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      mctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `${storyTitle.replace(/\s+/g, '_')}_pintura_cena_${pageNumber}.png`;
      link.href = mergeCanvas.toDataURL('image/png');
      link.click();
      if (!coloringUrl) URL.revokeObjectURL(img.src);
    };

    if (coloringUrl) {
      img.src = coloringUrl;
    } else {
      const svgBlob = new Blob([coloringSvg], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(svgBlob);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Imprimir Contorno - ToonTales AI</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            svg { max-width: 100%; max-height: 100%; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${coloringSvg}
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl max-w-4xl mx-auto">
      {/* Top Header Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 font-serif">Estúdio de Pintura</h3>
          <p className="text-slate-500 text-sm">Colorindo a Cena {pageNumber} de "{storyTitle}"</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-extrabold rounded-xl text-sm transition-all shadow-sm"
          >
            ↩ Desfazer
          </button>
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-extrabold rounded-xl text-sm transition-all shadow-sm"
          >
            ↪ Refazer
          </button>
          <button 
            onClick={handleClear} 
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold rounded-xl text-sm transition-all shadow-sm"
          >
            🗑️ Limpar Tudo
          </button>
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-sm transition-all shadow-sm"
          >
            🖨️ Imprimir Papel (PDF)
          </button>
          <button 
            onClick={handleDownload} 
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black rounded-xl text-sm transition-all shadow-md"
          >
            💾 Salvar Obra de Arte
          </button>
        </div>
      </div>

      {/* Main Grid: Tools + Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        
        {/* Left Sidebar Toolbox */}
        <div className="flex flex-col gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          
          {/* Tool Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ferramentas</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTool('brush')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  activeTool === 'brush' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🖌️</span> Pincel
              </button>
              <button
                onClick={() => setActiveTool('crayon')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  activeTool === 'crayon' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🖍️</span> Giz Cera
              </button>
              <button
                onClick={() => setActiveTool('spray')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  activeTool === 'spray' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>💨</span> Spray
              </button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                  activeTool === 'eraser' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🧽</span> Borracha
              </button>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Palette Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paletas</span>
            <select
              value={activePalette}
              onChange={(e) => setActivePalette(e.target.value as PaletteType)}
              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500"
            >
              <option value="floresta">🌲 Floresta Lúdica</option>
              <option value="oceano">🌊 Fundo do Mar</option>
              <option value="espaco">🚀 Galáxia e Estrelas</option>
              <option value="fada">🧚 Castelo Encantado</option>
            </select>

            {/* Colors Grid */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {PALETTES[activePalette].colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    if (activeTool === 'eraser') setActiveTool('brush');
                  }}
                  style={{ backgroundColor: color }}
                  className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${
                    selectedColor === color && activeTool !== 'eraser' 
                      ? 'border-slate-800 scale-110 shadow-md' 
                      : 'border-white shadow-sm'
                  }`}
                />
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Brush Sizes */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tamanho</span>
            <div className="flex justify-between gap-1.5">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all ${
                    brushSize === size ? 'bg-slate-800 text-white' : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-150'
                  }`}
                >
                  <div 
                    style={{ 
                      width: size/2 + 2, 
                      height: size/2 + 2, 
                      backgroundColor: size === brushSize ? '#FFF' : '#777' 
                    }} 
                    className="rounded-full" 
                  />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Canvas & SVG Overlay */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-[4/3] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-inner cursor-crosshair"
        >
          {/* Drawing Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute top-0 left-0 w-full h-full"
          />

          {/* Outline Overlay (Mix Blend Multiply so black lines stay on top) */}
          {coloringUrl ? (
            <img 
              src={coloringUrl} 
              alt="Contorno"
              className="absolute top-0 left-0 w-full h-full pointer-events-none select-none"
              style={{ mixBlendMode: 'multiply' }}
            />
          ) : (
            <div 
              className="absolute top-0 left-0 w-full h-full pointer-events-none select-none"
              style={{ mixBlendMode: 'multiply' }}
              dangerouslySetInnerHTML={{ __html: coloringSvg }}
            />
          )}
        </div>

      </div>
    </div>
  );
};
