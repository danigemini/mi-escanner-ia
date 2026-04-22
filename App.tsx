import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Book, ScannedBookData } from './types';
import { analyzeBooksImage } from './services/geminiService';
import { supabase, TABLE_NAME } from './services/supabaseClient';
import { ImageInput } from './components/ImageInput';
import { BookTable } from './components/BookTable';
import { OutputPanel } from './components/OutputPanel';
import { Spinner } from './components/Spinner';
import { BulkImportModal } from './components/BulkImportModal';
import { DatabaseSetupModal } from './components/DatabaseSetupModal';
import { Library, AlertCircle, Database, ScanLine, Share2, Save, Cloud, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  
  // Ref to scroll to table after scanning
  const tableRef = useRef<HTMLDivElement>(null);

  // --- SUPABASE LOGIC ---
  
  // Load initial data
  useEffect(() => {
    const fetchBooks = async () => {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn("Supabase Fetch Error:", error);
        if (error.code === 'PGRST205') { // Table not found error code
            setIsSetupModalOpen(true);
        }
      } else if (data) {
        setBooks(data as Book[]);
      }
      setIsSyncing(false);
    };

    fetchBooks();
  }, []);

  // Sync Helper
  const syncBooksToCloud = async (booksToSync: Book[]) => {
    setIsSyncing(true);
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(booksToSync, { onConflict: 'id' });
    
    if (error) {
        console.error("Error syncing:", error);
        if (error.code === 'PGRST205') {
             setIsSetupModalOpen(true);
        }
    }
    setIsSyncing(false);
  };

  const deleteBookFromCloud = async (id: string) => {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
      if (error && error.code === 'PGRST205') {
          setIsSetupModalOpen(true);
      }
  };

  // --- APP LOGIC ---

  const handleImageSelected = useCallback(async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const scannedData: ScannedBookData[] = await analyzeBooksImage(base64Image);
      
      const baseTime = Date.now();
      const newBooks: Book[] = scannedData.map((item, index) => ({
        id: uuidv4(),
        title: item.title,
        author: item.author,
        pages: '',
        dimensions: '', 
        price: '',
        selected: true,
        // Add milliseconds to ensure strict ordering if multiple items are added at once
        created_at: new Date(baseTime + index * 10).toISOString()
      }));

      // Update State
      setBooks(prev => {
          const updated = [...prev, ...newBooks];
          // Sync new items to cloud
          syncBooksToCloud(newBooks); 
          return updated;
      });

    } catch (err) {
      setError("Hubo un error analizando la imagen. Por favor intenta con una foto más clara.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Update a single field (Local State Only until explicit save to avoid spamming DB)
  const handleUpdateBook = (id: string, field: keyof Book, value: string | boolean) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, [field]: value } : book
    ));
  };

  const handleSaveAll = () => {
      syncBooksToCloud(books);
  };

  const handleDeleteBook = (id: string) => {
    deleteBookFromCloud(id);
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  const handleSelectAll = (select: boolean) => {
    setBooks(prev => prev.map(book => ({ ...book, selected: select })));
  };

  const handleAddManualBook = () => {
    const newBook: Book = {
        id: uuidv4(),
        title: "",
        author: "",
        pages: "",
        dimensions: "",
        price: "",
        selected: true,
        created_at: new Date().toISOString()
    };
    setBooks(prev => [...prev, newBook]);
    // Optionally sync this empty row immediately
    syncBooksToCloud([newBook]);
  };

  const handleBulkImport = (importedBooks: Book[]) => {
      setBooks(prev => [...prev, ...importedBooks]);
      syncBooksToCloud(importedBooks);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <BulkImportModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        onImport={handleBulkImport} 
      />

      <DatabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Library className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              BookSpine <span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {isSyncing ? (
                 <span className="text-xs text-indigo-500 animate-pulse flex items-center gap-1">
                     <Cloud className="w-3 h-3" /> Guardando...
                 </span>
             ) : (
                 <span className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600 flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    {books.length} Libros
                 </span>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* SECCION 1: INPUT / ESCÁNER */}
        <section id="scanner-section" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-md">
                    <ScanLine className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">1. Escanear Libros</h2>
            </div>
            
            {isAnalyzing ? (
                 <div className="py-12 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse">
                    <Spinner label="Analizando imagen y procesando datos..." />
                </div>
            ) : (
                <ImageInput 
                    onImageSelected={handleImageSelected} 
                    isLoading={isAnalyzing} 
                    compact={books.length > 0} 
                />
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Error de análisis</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}
        </section>

        {/* SECCION 2: BASE DE DATOS */}
        <section id="database-section" className="space-y-4" ref={tableRef}>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-md">
                        <Database className="w-5 h-5 text-indigo-700" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">2. Base de Datos (Inventario)</h2>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                     {books.length > 0 && (
                         <>
                            <button 
                                onClick={handleSaveAll}
                                className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded border border-indigo-200 transition-colors font-medium"
                                title="Guardar cambios de texto en la nube"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Guardar Cambios
                            </button>
                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                            <button 
                                onClick={() => {
                                    if(window.confirm('¿Estás seguro de borrar toda la base de datos de la nube?')) {
                                        books.forEach(b => deleteBookFromCloud(b.id)); 
                                        setBooks([]);
                                    }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                            >
                                Borrar Todo
                            </button>
                         </>
                    )}
                </div>
            </div>

            {books.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="mb-4">La base de datos está vacía.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleAddManualBook}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            + Fila Manual
                        </button>
                         <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="text-slate-600 hover:text-slate-800 font-medium text-sm border border-slate-300 hover:bg-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Cargar Texto Masivo
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <BookTable 
                        books={books} 
                        onUpdate={handleUpdateBook} 
                        onDelete={handleDeleteBook}
                        onSelectAll={handleSelectAll}
                        onAddManual={handleAddManualBook}
                    />
                    <div className="flex justify-end -mt-4 mb-6">
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-4 py-2"
                        >
                            <FileText className="w-3 h-3" />
                            Cargar Texto Masivo
                        </button>
                    </div>
                </>
            )}
        </section>

        {/* SECCION 3: SALIDA / GENERADOR */}
        <section id="output-section" className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="bg-emerald-100 p-1.5 rounded-md">
                    <Share2 className="w-5 h-5 text-emerald-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">3. Generar Salida</h2>
            </div>
            
            {books.filter(b => b.selected).length === 0 ? (
                 <div className="bg-slate-200/50 rounded-xl p-6 text-center text-slate-500 italic text-sm">
                    Selecciona libros en la tabla de arriba para generar el texto de venta.
                 </div>
            ) : (
                <OutputPanel books={books} />
            )}
        </section>

      </main>
    </div>
  );
};

export default App;