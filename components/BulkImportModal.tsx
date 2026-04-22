import React, { useState } from 'react';
import { X, FileText, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Book } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (books: Book[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleProcess = () => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const newBooks: Book[] = [];
    const baseTime = Date.now();

    lines.forEach((line, index) => {
      // Expected format loosely: "- TITLE, AUTHOR, PAGINAS: X, DIMENSIONES: X, PRECIO Bs. X"
      // or simply: "TITLE, AUTHOR..."
      
      let cleanLine = line.trim();
      if (cleanLine.startsWith('-')) cleanLine = cleanLine.substring(1).trim();

      // Extract parts by comma, but be careful as titles/authors might have commas? 
      // For simplicity in this regex-less approach, we assume commas separate main fields until keywords appear.
      
      // Strategy: Extract known labeled fields first from the end backwards or via regex
      
      const pagesMatch = cleanLine.match(/PAGINAS:\s*([^,]+)/i);
      const dimsMatch = cleanLine.match(/DIMENSIONES:\s*([^,]+)/i); // capturar hasta coma o paréntesis
      const priceMatch = cleanLine.match(/PRECIO\s*(?:Bs\.?)?\s*([0-9.]+)/i);

      let pages = pagesMatch ? pagesMatch[1].trim() : '';
      let dimensions = dimsMatch ? dimsMatch[1].replace('(cm)', '').trim() : '';
      let price = priceMatch ? priceMatch[1].trim() : '';

      // Clean the string of the extracted parts to find Title and Author
      let remaining = cleanLine
        .replace(/PAGINAS:\s*[^,]+,?/i, '')
        .replace(/DIMENSIONES:\s*[^,]+(?:\(cm\))?,?/i, '')
        .replace(/PRECIO\s*(?:Bs\.?)?\s*[0-9.]+,?/i, '')
        .trim();
        
      // Remove trailing commas
      if (remaining.endsWith(',')) remaining = remaining.slice(0, -1);

      // Split remaining by comma to get Title and Author
      const parts = remaining.split(',').map(s => s.trim());
      const title = parts[0] || '';
      const author = parts.slice(1).join(', ') || ''; // Join rest as author in case author has commas

      if (title) {
        newBooks.push({
            id: uuidv4(),
            title,
            author,
            pages,
            dimensions,
            price,
            selected: true,
            // Ensure unique timestamp sequence for bulk added items
            created_at: new Date(baseTime + index * 10).toISOString()
        });
      }
    });

    onImport(newBooks);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Carga Masiva de Texto
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-auto">
          <p className="text-sm text-slate-500 mb-3">
            Pega aquí tu lista de libros. El formato ideal es similar a la salida generada:
            <br />
            <code className="text-xs bg-slate-100 p-1 rounded block mt-1 text-slate-700">
              - Título, Autor, PAGINAS: 100, DIMENSIONES: 15x21, PRECIO Bs. 50
            </code>
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="- El Principito, Antoine de Saint-Exupéry, PAGINAS: 96, DIMENSIONES: 15x21 (cm), PRECIO Bs. 30&#10;- 1984, George Orwell..."
            className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm resize-none"
          />
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleProcess}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <span>Procesar y Cargar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};