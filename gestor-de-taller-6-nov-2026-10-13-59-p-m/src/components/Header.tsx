import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, KANBAN_COLUMNS } from '../types/workshop';
import { formatElapsedTime } from '../utils/formatters';
import { Plus, RotateCcw, AlertTriangle, Bell, CheckCircle2, ChevronRight, X, Globe } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onResetData: () => void;
  onLoadSamples?: () => void;
  onOpenShareModal: () => void;
  hasVehicles: boolean;
  alertCount: number;
  alertVehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  showAlertsOnly: boolean;
  onToggleAlertsOnly: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onResetData,
  onLoadSamples,
  onOpenShareModal,
  hasVehicles,
  alertCount,
  alertVehicles,
  onSelectVehicle,
  showAlertsOnly,
  onToggleAlertsOnly,
  isSyncing
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#002C6C] text-white shadow-md border-b border-[#001D47]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Ford Oval Icon */}
            <div className="w-10 h-7 bg-white/10 rounded-full border border-white/20 flex items-center justify-center font-bold tracking-tighter text-blue-100 text-xs shadow-inner">
              <span className="italic font-serif text-sm">Ford</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight whitespace-nowrap">
                Taller Oficial Ford
              </span>
              <span className="text-[11px] text-blue-200 hidden sm:inline">
                Control de Taller, Alertas & Mensajes WhatsApp
              </span>
            </div>
          </div>

          {/* Zone 2: Notifications Bell & 48h Filters */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notification Bell with Badge */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-lg transition-colors flex items-center justify-center ${
                  alertCount > 0
                    ? 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-400/40'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
                title="Notificaciones de vehículos (+48h)"
              >
                <Bell className={`w-4 h-4 ${alertCount > 0 ? 'animate-bounce text-rose-300' : ''}`} />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-[#002C6C] shadow-sm">
                    {alertCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-900 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Alertas Internas (+48h)
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {alertCount} {alertCount === 1 ? 'vehículo' : 'vehículos'}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alertVehicles.length === 0 ? (
                      <div className="py-6 px-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">¡Todo al día!</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ningún vehículo supera las 48 horas sin avance.
                        </p>
                      </div>
                    ) : (
                      alertVehicles.map((v) => {
                        const col = KANBAN_COLUMNS.find(c => c.id === v.status);
                        const time = formatElapsedTime(v.statusUpdatedAt);
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              onSelectVehicle(v);
                              setIsNotificationsOpen(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-red-100 text-red-700 border border-red-300">
                                  {v.plate}
                                </span>
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {v.model}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                                <span>Fase: <strong className="text-slate-700">{col?.shortTitle}</strong></span>
                                <span>·</span>
                                <span className="text-rose-600 font-mono font-bold">Lleva {time}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Device Cloud Sync Button */}
            <button
              onClick={onOpenShareModal}
              title="Abrir en otro PC (trabajo / casa) o móvil con sincronización automática"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white/10 hover:bg-white/20 text-blue-100 transition-colors border border-white/20"
            >
              <Globe className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-300' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">Multi-dispositivo</span>
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </button>

            {/* Filter Toggle for >48h */}
            <button
              onClick={onToggleAlertsOnly}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                showAlertsOnly
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                  : alertCount > 0
                  ? 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-400/40'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
              title="Filtrar vehículos con más de 48h en espera"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-rose-300' : ''}`} />
              <span className="hidden sm:inline">Alertas &gt;48h</span>
              <span className="font-mono tabular-nums font-bold px-1.5 py-0.2 bg-rose-950/60 rounded text-[11px]">
                {alertCount}
              </span>
            </button>

            {/* Load sample vehicles or reset workshop data */}
            {!hasVehicles && onLoadSamples && (
              <button
                onClick={onLoadSamples}
                title="Cargar vehículos de ejemplo para probar las alertas y mensajes WhatsApp"
                className="px-2.5 py-1.5 text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors text-xs flex items-center gap-1.5 font-medium border border-white/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cargar ejemplos</span>
              </button>
            )}

            {hasVehicles && (
              <button
                onClick={onResetData}
                title="Vaciar todos los vehículos del taller para empezar de cero"
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-md transition-colors text-xs hidden md:flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Vaciar taller</span>
              </button>
            )}
          </div>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#002C6C] bg-white rounded-lg hover:bg-blue-50 active:scale-98 transition-all shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Añadir Vehículo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
