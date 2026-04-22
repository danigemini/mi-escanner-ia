import React, { useState } from 'react';
import { Book } from '../types';
import { Copy, Check, Download } from 'lucide-react';

interface OutputPanelProps {
  books: Book[];
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ books }) => {
  const [copied, setCopied] = useState(false);

  const selectedBooks = books.filter(b => b.selected);

  if (selectedBooks.length === 0) return null;

  const generateOutput = () => {
    return selectedBooks.map(b => {
        // Format: - LIBRO, AUTOR, PAGINAS: _ , DIMENSIONES: b x h (cm), PRECIO Bs.
        const title = b.title || 'Sin Título';
        const author = b.author || 'Desconocido';
        const pages = b.pages ? b.pages : '_';
        const dims = b.dimensions ? b.dimensions : 'b x h';
        const price = b.price || '';

        return `- ${title}, ${author}, PAGINAS: ${pages}, DIMENSIONES: ${dims} (cm), PRECIO Bs. ${price}`;
    }).join('\n');
  };

  const outputText = generateOutput();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadCSV = () => {
    // 1. Define Headers
    const headers = ["Título", "Autor", "Páginas", "Dimensiones (cm)", "Precio (Bs.)"];
    
    // 2. Map Data and escape quotes for CSV format
    const rows = selectedBooks.map(b => [
        `"${(b.title || '').replace(/"/g, '""')}"`,
        `"${(b.author || '').replace(/"/g, '""')}"`,
        `"${(b.pages || '').replace(/"/g, '""')}"`,
        `"${(b.dimensions || '').replace(/"/g, '""')}"`,
        `"${(b.price || '').replace(/"/g, '""')}"`
    ]);

    // 3. Join with commas and newlines
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    // 4. Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg text-slate-100 sticky bottom-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="bg-emerald-500 w-2 h-6 rounded-full inline-block"></span>
          Respuesta Generada
        </h3>
        
        <div className="flex gap-2 w-full sm:w-auto">
             <button
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-all border border-slate-600"
              title="Descargar tabla en formato CSV"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-700">
        <pre className="whitespace-pre-wrap text-slate-300">{outputText}</pre>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-right">
        Basado en {selectedBooks.length} libros seleccionados
      </p>
    </div>
  );
};