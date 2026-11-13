import React, { useState } from 'react';
import { Vehicle } from '../types/workshop';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Laptop, 
  Smartphone, 
  RefreshCw, 
  Download, 
  Upload, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ShareDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  onImportBackup: (importedVehicles: Vehicle[]) => void;
}

export const ShareDeviceModal: React.FC<ShareDeviceModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onManualSync,
  isSyncing,
  lastSyncTime,
  onImportBackup
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("download", `copia_seguridad_taller_${dateStamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert(`Se han importado ${parsed.length} vehículos correctamente.`);
          onClose();
        } else {
          alert('El archivo no contiene una lista válida de vehículos.');
        }
      } catch (err) {
        alert('Error al leer el archivo de copia de seguridad.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#002C6C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Acceso Multi-Dispositivo
              </h3>
              <p className="text-xs text-blue-200">
                Usa el taller desde tu casa, el trabajo o el móvil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                Sincronización en la Nube Activa
              </h4>
              <p className="text-xs text-blue-900 leading-relaxed">
                El programa guarda todos los datos en el servidor central. Puedes abrir esta misma dirección en el <strong>ordenador de tu casa</strong>, en el <strong>ordenador del trabajo</strong>, en tu tablet o en tu móvil. 
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-blue-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cualquier cambio de fase o aviso de WhatsApp se sincroniza automáticamente.</span>
              </div>
            </div>
          </div>

          {/* Web Access Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Enlace directo de acceso:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#002C6C] hover:bg-blue-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              💡 Puedes enviarte este enlace por correo, WhatsApp o guardarlo en los Marcadores/Favoritos de tu navegador en el trabajo.
            </p>
          </div>

          {/* Sync Status Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-slate-600">
                {isSyncing ? 'Sincronizando con el servidor...' : 'Servidor conectado'}
                {lastSyncTime && !isSyncing && (
                  <span className="text-slate-400 text-[11px] ml-1">
                    (última comprobación: {lastSyncTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-2.5 py-1 text-xs font-semibold text-blue-900 hover:text-[#002C6C] bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar ahora</span>
            </button>
          </div>

          {/* Backup & Restore section */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Copias de Seguridad (Opcional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#002C6C] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Descargar copia</span>
                  <span className="text-[10px] text-slate-500 block">Guardar archivo de respaldo</span>
                </div>
              </button>

              <label className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Restaurar copia</span>
                  <span className="text-[10px] text-slate-500 block">Cargar desde archivo .json</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#002C6C] hover:bg-blue-900 rounded-lg transition-colors shadow-2xs"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
