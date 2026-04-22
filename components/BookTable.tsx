import React from 'react';
import { Book } from '../types';
import { Trash2, CheckSquare, Square, PlusCircle } from 'lucide-react';

interface BookTableProps {
  books: Book[];
  onUpdate: (id: string, field: keyof Book, value: string | boolean) => void;
  onDelete: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onAddManual: () => void;
}

export const BookTable: React.FC<BookTableProps> = ({ books, onUpdate, onDelete, onSelectAll, onAddManual }) => {
  const allSelected = books.length > 0 && books.every(b => b.selected);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <button 
                    onClick={() => onSelectAll(!allSelected)}
                    className="flex items-center justify-center text-slate-500 hover:text-indigo-600"
                >
                    {allSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                </button>
              </th>
              <th className="px-4 py-3 min-w-[200px]">Libro</th>
              <th className="px-4 py-3 min-w-[150px]">Autor</th>
              <th className="px-4 py-3 w-28">Páginas</th>
              <th className="px-4 py-3 w-32">Dimensiones (cm)</th>
              <th className="px-4 py-3 w-32">Precio (Bs.)</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((book) => (
              <tr key={book.id} className={`hover:bg-slate-50 transition-colors ${book.selected ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-4 py-3 align-middle text-center">
                   <button 
                    onClick={() => onUpdate(book.id, 'selected', !book.selected)}
                    className="flex items-center justify-center"
                   >
                     {book.selected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                     ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                     )}
                   </button>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={book.title}
                    onChange={(e) => onUpdate(book.id, 'title', e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all font-medium text-slate-900"
                    placeholder="Título del libro"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={book.author}
                    onChange={(e) => onUpdate(book.id, 'author', e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all text-slate-600"
                    placeholder="Autor"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={book.pages}
                    onChange={(e) => onUpdate(book.id, 'pages', e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all text-slate-600 text-center"
                    placeholder="0"
                  />
                </td>
                 <td className="px-2 py-2">
                  <input
                    type="text"
                    value={book.dimensions}
                    onChange={(e) => onUpdate(book.id, 'dimensions', e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all text-slate-600 text-center"
                    placeholder="Ej. 15x21"
                  />
                </td>
                 <td className="px-2 py-2">
                  <input
                    type="text"
                    value={book.price}
                    onChange={(e) => onUpdate(book.id, 'price', e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 outline-none transition-all text-slate-600 text-right font-medium"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => onDelete(book.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Stats / Add Button */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
            onClick={onAddManual}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors w-full sm:w-auto justify-center"
        >
            <PlusCircle className="w-4 h-4" />
            Generar una entrada de datos (Manual)
        </button>
        <span className="text-xs text-slate-500">
            {books.length} libros en total ({books.filter(b => b.selected).length} seleccionados)
        </span>
      </div>
    </div>
  );
};