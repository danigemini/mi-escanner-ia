import React, { useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageInputProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
  compact?: boolean; // New prop to control visual style
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, isLoading, compact = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
      // Reset input value to allow selecting same file again if needed
      event.target.value = '';
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  // COMPACT MODE: A smaller bar to add more books without taking up space
  if (compact) {
      return (
        <div className="w-full bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-full">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-medium text-slate-800">Agregar más libros</h3>
                    <p className="text-xs text-slate-500 hidden sm:block">Sube otra foto para acumular en la lista.</p>
                </div>
            </div>
            
            <div className="flex gap-2">
                 <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                 <button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Subir Foto</span>
                </button>

                 <label className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 py-2 px-4 rounded-lg text-sm font-medium transition-colors h-full">
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Cámara</span>
                    </div>
                     <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                 </label>
            </div>
        </div>
      );
  }

  // HERO MODE: Big centered box for initial state
  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 bg-white shadow-sm hover:border-indigo-400 transition-colors">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-5 bg-indigo-50 rounded-full shadow-inner">
            <ImageIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-slate-800">Comenzar Inventario</h3>
            <p className="text-slate-500 mt-2">Sube una foto de una pila de libros o usa tu cámara para escanear los lomos y extraer la información automáticamente.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-2">
             <button
              onClick={handleUploadClick}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>Subir Archivo</span>
            </button>
            
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

             <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-3 px-6 rounded-lg font-medium transition-colors shadow-sm h-full">
                    <Camera className="w-5 h-5" />
                    <span>Usar Cámara</span>
                </div>
                 <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
};