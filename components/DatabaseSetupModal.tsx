import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, X } from 'lucide-react';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- Copia y pega esto en el SQL Editor de Supabase para crear la tabla
create table if not exists public.books (
  id uuid primary key,
  title text,
  author text,
  pages text,
  dimensions text,
  price text,
  selected boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar seguridad (RLS)
alter table public.books enable row level security;

-- Política para permitir acceso público total (lectura y escritura)
-- Ajusta esto según tus necesidades de seguridad
create policy "Public Access" 
on public.books 
for all 
using (true) 
with check (true);`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-red-100 bg-red-50">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-red-600" />
            Configuración de Base de Datos Requerida
          </h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <p className="text-slate-700 mb-4">
            No se encontró la tabla <strong>'books'</strong> en tu proyecto de Supabase. 
            La aplicación no puede crear tablas automáticamente por seguridad.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Pasos para solucionar:
            </h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 ml-2">
              <li>Ve a tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-blue-900">Supabase Dashboard</a>.</li>
              <li>Abre la sección <strong>SQL Editor</strong> en la barra lateral.</li>
              <li>Crea una <strong>New Query</strong>.</li>
              <li>Copia el código de abajo y pégalo en el editor.</li>
              <li>Haz clic en <strong>Run</strong>.</li>
              <li>Vuelve aquí y recarga la página.</li>
            </ol>
          </div>

          <div className="relative">
            <div className="absolute top-2 right-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar SQL'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-700 pt-10">
              {sqlCode}
            </pre>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
                Usar solo Localmente (Sin guardar)
            </button>
        </div>
      </div>
    </div>
  );
};
