import React, { useState } from 'react';
import { Vehicle, ColumnId, KANBAN_COLUMNS } from '../types/workshop';
import { 
  formatElapsedTime, 
  isExceeded48Hours,
  buildPhoneCallLink
} from '../utils/formatters';
import { WhatsAppTemplateId, WHATSAPP_TEMPLATES } from '../utils/whatsapp';
import { WhatsAppIcon } from './WhatsAppModal';
import { 
  X, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Car, 
  User, 
  History, 
  Trash2, 
  FastForward,
  Bell,
  Search,
  Wrench,
  PackageX,
  FileText,
  Send,
  MessageSquare
} from 'lucide-react';

interface VehicleDetailDrawerProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onMoveStatus: (vehicleId: string, targetStatus: ColumnId) => void;
  onOpenWhatsApp?: (vehicle: Vehicle, templateId?: WhatsAppTemplateId) => void;
}

export const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
  vehicle,
  isOpen,
  onClose,
  onUpdateVehicle,
  onDeleteVehicle,
  onMoveStatus,
  onOpenWhatsApp
}) => {
  if (!isOpen || !vehicle) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [modelInput, setModelInput] = useState(vehicle.model || '');
  const [clientInput, setClientInput] = useState(vehicle.clientName || '');
  const [phoneInput, setPhoneInput] = useState(vehicle.phoneNumber || '');
  const [missingPartInput, setMissingPartInput] = useState(vehicle.missingPartName || '');
  const [notesInput, setNotesInput] = useState(vehicle.issueDescription || '');

  const isAlertOver48h = isExceeded48Hours(vehicle);
  const timeInColumn = formatElapsedTime(vehicle.statusUpdatedAt);
  const callUrl = buildPhoneCallLink(vehicle);

  const handleSaveEdits = () => {
    onUpdateVehicle({
      ...vehicle,
      model: modelInput.trim() || vehicle.model,
      clientName: clientInput.trim() || undefined,
      phoneNumber: phoneInput.replace(/[^0-9]/g, '') || vehicle.phoneNumber,
      missingPartName: missingPartInput.trim() || undefined,
      issueDescription: notesInput.trim()
    });
    setIsEditing(false);
  };

  // Acknowledge the 48h alert (postpones the reminder by 48h)
  const handleAcknowledgeAlert = () => {
    const nowIso = new Date().toISOString();
    onUpdateVehicle({
      ...vehicle,
      lastAlertAcknowledgedAt: nowIso,
      history: [
        ...(vehicle.history || []),
        {
          status: vehicle.status,
          timestamp: nowIso,
          note: 'Alerta de 48h revisada (reloj pospuesto 48h)'
        }
      ]
    });
  };

  // Simulate >48h for quick testing & demonstration
  const handleToggleSimulate48Hours = () => {
    const isCurrentlyOld = isExceeded48Hours(vehicle);
    const newTimestamp = isCurrentlyOld 
      ? new Date().toISOString() // reset to now
      : new Date(Date.now() - 50 * 3600 * 1000).toISOString(); // 50h ago

    onUpdateVehicle({
      ...vehicle,
      statusUpdatedAt: newTimestamp,
      lastAlertAcknowledgedAt: undefined
    });
  };

  const currentColumn = KANBAN_COLUMNS.find(c => c.id === vehicle.status);

  // Check if WhatsApp has been sent recently
  const lastWhatsAppEntry = vehicle.history?.slice().reverse().find(h => h.note?.includes('WhatsApp'));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* European License Plate (turns RED if >48h) */}
            <div className={`inline-flex items-center rounded overflow-hidden h-8 transition-all ${
              isAlertOver48h
                ? 'border-2 border-red-600 bg-red-50 shadow-xs ring-1 ring-red-400'
                : 'border border-slate-300 bg-white shadow-xs'
            }`}>
              <div className={`px-2 h-full flex flex-col items-center justify-center text-[9px] font-bold tracking-tighter shrink-0 border-r ${
                isAlertOver48h
                  ? 'bg-red-700 text-white border-red-800'
                  : 'bg-[#002C6C] text-white border-blue-900'
              }`}>
                <span>★</span>
                <span className="text-[10px] leading-none">E</span>
              </div>
              <div className={`px-2.5 font-mono font-bold tracking-wider text-sm whitespace-nowrap ${
                isAlertOver48h ? 'text-red-700 font-extrabold' : 'text-slate-900'
              }`}>
                {vehicle.plate}
              </div>
            </div>
            
            <span className="text-xs font-semibold text-slate-700 truncate">
              {vehicle.model}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* 48-Hour Alert Notification Box */}
          {isAlertOver48h && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 flex flex-col gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 animate-bounce">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-rose-900">
                      Alerta +48 Horas sin avance
                    </h4>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {timeInColumn}
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    Este vehículo lleva más de 48 horas en <strong className="font-semibold">{currentColumn?.title}</strong>. La matrícula se muestra en rojo en el tablero para alertarte.
                  </p>
                </div>
              </div>

              {/* Action to acknowledge alert or notify client via WhatsApp */}
              <div className="pt-2 border-t border-rose-200/80 flex flex-wrap items-center justify-between gap-2">
                {onOpenWhatsApp && (
                  <button
                    onClick={() => onOpenWhatsApp(vehicle)}
                    className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span>Avisar al cliente por WhatsApp</span>
                  </button>
                )}
                
                <button
                  onClick={handleAcknowledgeAlert}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Marcar revisado (posponer 48h)</span>
                </button>
              </div>
            </div>
          )}

          {/* Vehicle Core Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#002C6C]" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {vehicle.model}
                  </h3>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Estado actual
                </span>
                <span className="text-xs font-bold text-[#002C6C] mt-0.5 inline-block">
                  {currentColumn?.title}
                </span>
                <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5 font-mono tabular-nums">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {timeInColumn}
                </div>
              </div>
            </div>

            {/* Client and Phone Card */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {vehicle.clientName ? (
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">Cliente</span>
                    <span className="text-sm font-semibold text-slate-900 truncate block">
                      {vehicle.clientName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Sin nombre de cliente asignado
                </div>
              )}

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center gap-2 mr-1">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Teléfono</span>
                    <a 
                      href={callUrl}
                      className="text-sm font-semibold font-mono tabular-nums text-blue-700 hover:underline"
                    >
                      {vehicle.phoneCountryCode} {vehicle.phoneNumber}
                    </a>
                  </div>
                </div>

                {/* Call Button */}
                <a
                  href={callUrl}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#002C6C] hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Llamar directamente"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-700" />
                  <span className="hidden sm:inline">Llamar</span>
                </a>

                {/* Direct WhatsApp Button */}
                {onOpenWhatsApp && (
                  <button
                    onClick={() => onOpenWhatsApp(vehicle)}
                    className="p-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
                    title="Enviar mensaje WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DEDICATED WHATSAPP NOTIFICATION HUB: 5 SPECIFIC SCENARIOS */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white rounded-2xl p-4 border border-emerald-300/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                    Avisos al Cliente por WhatsApp
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Mensajes preconfigurados para informar al instante
                  </p>
                </div>
              </div>

              {onOpenWhatsApp && (
                <button
                  onClick={() => onOpenWhatsApp(vehicle)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Redactar</span>
                </button>
              )}
            </div>

            {/* The 5 Key Quick Action Buttons */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-slate-600">
                Selecciona qué deseas explicarle al cliente:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* 1. Diagnosis */}
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp && onOpenWhatsApp(vehicle, 'diagnostico')}
                  className="p-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/80 hover:border-blue-300 text-left transition-all shadow-2xs group flex items-start gap-2"
                >
                  <div className="p-1 rounded-md bg-blue-100 text-blue-700 mt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 block truncate">
                      1. Aún en diagnosis
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 block">
                      Localizando el origen de la avería
                    </span>
                  </div>
                </button>

                {/* 2. Reparación */}
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp && onOpenWhatsApp(vehicle, 'reparacion')}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/80 hover:border-indigo-300 text-left transition-all shadow-2xs group flex items-start gap-2"
                >
                  <div className="p-1 rounded-md bg-indigo-100 text-indigo-700 mt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 block truncate">
                      2. Aún se está reparando
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 block">
                      Trabajos mecánicos en marcha en box
                    </span>
                  </div>
                </button>

                {/* 3. Falta de recambios */}
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp && onOpenWhatsApp(vehicle, 'falta_pieza')}
                  className="p-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/80 hover:border-rose-300 text-left transition-all shadow-2xs group flex items-start gap-2"
                >
                  <div className="p-1 rounded-md bg-rose-100 text-rose-700 mt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                    <PackageX className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-rose-900 block truncate">
                      3. Faltan piezas recambios
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 block">
                      A la espera de repuesto oficial
                    </span>
                  </div>
                </button>

                {/* 4. Esperando respuesta presupuesto */}
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp && onOpenWhatsApp(vehicle, 'presupuesto')}
                  className="p-2.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50/80 hover:border-amber-300 text-left transition-all shadow-2xs group flex items-start gap-2"
                >
                  <div className="p-1 rounded-md bg-amber-100 text-amber-700 mt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900 block truncate">
                      4. Esperando presupuesto
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 block">
                      Presupuesto listo pendiente de OK
                    </span>
                  </div>
                </button>

              </div>

              {/* 5. Listo para venir a por él (Prominent full-width button) */}
              <button
                type="button"
                onClick={() => onOpenWhatsApp && onOpenWhatsApp(vehicle, 'listo')}
                className="w-full p-2.5 rounded-xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100/80 text-left transition-all shadow-xs group flex items-center justify-between gap-3 mt-1"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-emerald-950 block truncate">
                      5. Vehículo terminado (¡Puede venir a por él!)
                    </span>
                    <span className="text-[11px] text-emerald-700 block truncate">
                      Reparación terminada, listo para recoger en taller
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 shadow-2xs">
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>Avisar</span>
                </div>
              </button>

            </div>

            {/* Last WhatsApp status log if available */}
            {lastWhatsAppEntry && (
              <div className="p-2 rounded-lg bg-white/80 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold">Último WhatsApp enviado: </span>
                  <span className="text-slate-600">{lastWhatsAppEntry.note}</span>
                  <span className="font-mono text-slate-400 ml-1">
                    ({formatElapsedTime(lastWhatsAppEntry.timestamp)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stage Mover */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Mover a otra Fase de Trabajo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {KANBAN_COLUMNS.map((col) => {
                const isCurrent = col.id === vehicle.status;
                return (
                  <button
                    key={col.id}
                    onClick={() => onMoveStatus(vehicle.id, col.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                      isCurrent
                        ? 'bg-[#002C6C] text-white shadow-sm ring-2 ring-blue-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {col.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Fields: Model, Notes & Missing Part */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Datos del Vehículo & Avería
              </span>
              <button
                onClick={() => {
                  if (isEditing) handleSaveEdits();
                  else setIsEditing(true);
                }}
                className="text-xs font-semibold text-[#002C6C] hover:underline"
              >
                {isEditing ? 'Guardar Cambios' : 'Modificar Datos'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Marca y Modelo
                  </label>
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Nombre del Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={clientInput}
                    onChange={(e) => setClientInput(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Pieza Pendiente (si aplica)
                  </label>
                  <input
                    type="text"
                    value={missingPartInput}
                    onChange={(e) => setMissingPartInput(e.target.value)}
                    placeholder="Ej. Bomba de agua, filtro, etc."
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Motivo / Avería / Notas
                  </label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#002C6C] hover:bg-blue-900 rounded-md"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {vehicle.missingPartName && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    <span className="font-bold block">Pieza pendiente:</span>
                    <span>{vehicle.missingPartName}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block mb-1 font-medium">Motivo / Avería:</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    {vehicle.issueDescription || 'Sin notas registradas.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Test / Simulation Tool for 48 Hours */}
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <FastForward className="w-4 h-4 text-blue-700" />
              <span>
                Tiempo en fase: <strong>{timeInColumn}</strong>
              </span>
            </div>
            <button
              onClick={handleToggleSimulate48Hours}
              className="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-white hover:bg-blue-50 border border-slate-300 rounded shadow-2xs"
            >
              {isAlertOver48h ? 'Reiniciar reloj a ahora' : 'Simular >48h para ver matrícula roja'}
            </button>
          </div>

          {/* History / Timeline Log */}
          {vehicle.history && vehicle.history.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Historial de Fases & Comunicaciones</span>
              </span>
              <div className="space-y-2">
                {vehicle.history.map((item, index) => {
                  const col = KANBAN_COLUMNS.find(c => c.id === item.status);
                  const isWhatsAppLog = item.note?.includes('WhatsApp');
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start gap-2 text-xs p-2.5 rounded-lg border ${
                        isWhatsAppLog 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <span className="font-mono text-slate-400 shrink-0 text-[11px] pt-0.5">
                        {formatElapsedTime(item.timestamp)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {isWhatsAppLog && (
                            <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800">
                            {col?.title || item.status}
                          </span>
                        </div>
                        {item.note && (
                          <p className={`text-[11px] mt-0.5 leading-relaxed ${
                            isWhatsAppLog ? 'text-emerald-900 font-medium' : 'text-slate-600'
                          }`}>
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delete Action */}
          <div className="pt-4 border-t border-slate-200">
            {isConfirmingDelete ? (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-center justify-between gap-3 animate-in fade-in">
                <span className="text-xs font-semibold text-rose-800">
                  ¿Eliminar vehículo {vehicle.plate}?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onDeleteVehicle(vehicle.id);
                      onClose();
                    }}
                    className="px-3.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs transition-colors"
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar del tablero</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
