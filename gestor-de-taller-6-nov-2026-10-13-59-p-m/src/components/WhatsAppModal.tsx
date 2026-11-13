import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types/workshop';
import { 
  WHATSAPP_TEMPLATES, 
  WhatsAppTemplateId, 
  generateWhatsAppMessage, 
  buildWhatsAppUrl,
  getTemplateForStatus
} from '../utils/whatsapp';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Search, 
  Wrench, 
  PackageX, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

// Authentic WhatsApp SVG icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="0" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  initialTemplate?: WhatsAppTemplateId;
  onRecordHistory?: (vehicleId: string, note: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  initialTemplate,
  onRecordHistory
}) => {
  if (!isOpen || !vehicle) return null;

  const defaultTemplate = initialTemplate || getTemplateForStatus(vehicle.status);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateId>(defaultTemplate);
  const [messageText, setMessageText] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [missingPartName, setMissingPartName] = useState(vehicle.missingPartName || '');
  const [copied, setCopied] = useState(false);
  const [logToHistory, setLogToHistory] = useState(true);

  // Sync template changes to message content
  useEffect(() => {
    const text = generateWhatsAppMessage(selectedTemplate, {
      ...vehicle,
      missingPartName: missingPartName || vehicle.missingPartName
    }, {
      customNote: customNote
    });
    setMessageText(text);
  }, [selectedTemplate, vehicle, missingPartName, customNote]);

  // Update when vehicle changes
  useEffect(() => {
    setSelectedTemplate(initialTemplate || getTemplateForStatus(vehicle.status));
    setMissingPartName(vehicle.missingPartName || '');
    setCustomNote('');
  }, [vehicle, initialTemplate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    const url = buildWhatsAppUrl(vehicle.phoneCountryCode, vehicle.phoneNumber, messageText);
    
    // Record in history if requested
    if (logToHistory && onRecordHistory) {
      const templateMeta = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplate);
      const label = templateMeta?.shortLabel || selectedTemplate;
      onRecordHistory(
        vehicle.id,
        `WhatsApp enviado al cliente (${label}): "${templateMeta?.summaryText || 'Aviso enviado'}"`
      );
    }

    // Open WhatsApp
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const getTemplateIcon = (id: WhatsAppTemplateId) => {
    switch (id) {
      case 'diagnostico':
        return <Search className="w-4 h-4 text-blue-600" />;
      case 'reparacion':
        return <Wrench className="w-4 h-4 text-indigo-600" />;
      case 'falta_pieza':
        return <PackageX className="w-4 h-4 text-rose-600" />;
      case 'presupuesto':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'listo':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* WhatsApp Header */}
        <div className="px-5 py-3.5 bg-[#075E54] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
              <WhatsAppIcon className="w-5 h-5 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight truncate">
                  Mensaje WhatsApp al Cliente
                </h3>
                <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Autoforma
                </span>
              </div>
              <p className="text-xs text-emerald-100 truncate">
                Información del estado del vehículo en 1 clic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle & Client Contact Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* European License Plate */}
            <div className="inline-flex items-center rounded overflow-hidden h-7 border border-slate-300 bg-white shadow-2xs">
              <div className="px-1.5 h-full flex flex-col items-center justify-center text-[8px] font-bold tracking-tighter bg-[#002C6C] text-white border-r border-blue-900">
                <span>★</span>
                <span className="text-[9px] leading-none">E</span>
              </div>
              <div className="px-2 font-mono font-bold tracking-wider text-xs text-slate-900">
                {vehicle.plate}
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {vehicle.model}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {vehicle.clientName ? `Cliente: ${vehicle.clientName}` : 'Cliente no especificado'}
              </span>
            </div>
          </div>

          {/* Destination Phone */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-900">
              {vehicle.phoneCountryCode} {vehicle.phoneNumber}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-900">
          
          {/* Section: Select what you want to explain to the customer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>¿Qué deseas comunicar al cliente?</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Selecciona la situación
              </span>
            </div>

            {/* The 5 Key Situation Buttons explicitly requested by the user */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {WHATSAPP_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/40 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {getTemplateIcon(tpl.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${
                          isSelected ? 'text-emerald-950 font-extrabold' : 'text-slate-800'
                        }`}>
                          {tpl.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional field: If "Falta de piezas" is selected, allow updating missing part */}
          {selectedTemplate === 'falta_pieza' && (
            <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 animate-in fade-in">
              <label className="text-xs font-bold text-rose-900 block mb-1">
                Pieza o recambio pendiente que falta:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={missingPartName}
                  onChange={(e) => setMissingPartName(e.target.value)}
                  placeholder="Ej. Correa de distribución, bomba de agua, alternador..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-rose-700 mt-1">
                Si escribes el nombre del recambio, se incluirá automáticamente en el mensaje de WhatsApp.
              </p>
            </div>
          )}

          {/* Optional extra note */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Añadir nota adicional personalizada (Opcional):
              </label>
            </div>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ej. Puedes recogerlo hoy hasta las 19:30 h / Pregunta por Javier en recepción"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Realistic WhatsApp Chat Bubble Preview & Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vista Previa del Mensaje (Editable):</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>

            {/* WhatsApp simulated chat canvas */}
            <div className="bg-[#EFEAE2] p-3 sm:p-4 rounded-xl border border-slate-300 shadow-inner relative overflow-hidden">
              {/* WhatsApp background wallpaper subtle pattern indicator */}
              <div className="max-w-xl mx-auto">
                <div className="bg-[#D9FDD3] text-slate-900 rounded-lg p-3.5 shadow-sm border border-emerald-200/60 relative">
                  <textarea
                    rows={8}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-y border-0 p-0 text-slate-900"
                    placeholder="Escribe el mensaje..."
                  />
                  
                  {/* WhatsApp message metadata footer */}
                  <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-500 select-none">
                    <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 italic">
              * Puedes editar el texto directamente en el cuadro de arriba antes de enviarlo.
            </p>
          </div>

          {/* History logging toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <input
              type="checkbox"
              id="logHistory"
              checked={logToHistory}
              onChange={(e) => setLogToHistory(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="logHistory" className="text-xs text-slate-600 select-none">
              Registrar este envío en el historial de fases del vehículo (quedará constancia con fecha y hora).
            </label>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
            <WhatsAppIcon className="w-4 h-4 fill-emerald-600 shrink-0" />
            <span>Se abrirá WhatsApp con el mensaje ya redactado</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
              <span>Abrir WhatsApp y Enviar</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
