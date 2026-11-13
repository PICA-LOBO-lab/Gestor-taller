import React from 'react';
import { Vehicle, ColumnId, KANBAN_COLUMNS } from '../types/workshop';
import { 
  formatElapsedTime, 
  isExceeded48Hours
} from '../utils/formatters';
import { WhatsAppIcon } from './WhatsAppModal';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  User, 
  PackageX, 
  Bell 
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
  onMoveStatus: (vehicleId: string, nextStatus: ColumnId) => void;
  onDragStart?: (e: React.DragEvent, vehicleId: string) => void;
  onOpenWhatsApp?: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onSelect,
  onMoveStatus,
  onDragStart,
  onOpenWhatsApp
}) => {
  const isAlertOver48h = isExceeded48Hours(vehicle);
  const timeInColumn = formatElapsedTime(vehicle.statusUpdatedAt);

  // Column navigation helpers
  const currentColumnIndex = KANBAN_COLUMNS.findIndex(c => c.id === vehicle.status);
  const canMoveLeft = currentColumnIndex > 0;
  const canMoveRight = currentColumnIndex < KANBAN_COLUMNS.length - 1;
  const prevColumn = canMoveLeft ? KANBAN_COLUMNS[currentColumnIndex - 1] : null;
  const nextColumn = canMoveRight ? KANBAN_COLUMNS[currentColumnIndex + 1] : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, vehicle.id)}
      onClick={() => onSelect(vehicle)}
      className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer select-none ${
        isAlertOver48h
          ? 'bg-rose-50/90 border-rose-400 hover:border-rose-500 shadow-sm ring-2 ring-rose-300/70 hover:shadow-md'
          : 'bg-white border-slate-200 hover:border-blue-400/80 shadow-xs hover:shadow-md'
      }`}
    >
      {/* 48-Hour Alert Notification Header */}
      {isAlertOver48h && (
        <div className="mb-2.5 flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Bell className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
            <span className="truncate">Atención: +48h sin avance</span>
          </div>
          <span className="font-mono tabular-nums text-[10px] bg-rose-700/80 px-1.5 py-0.5 rounded text-white font-bold shrink-0">
            {timeInColumn}
          </span>
        </div>
      )}

      {/* Header: License Plate & Time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        
        {/* European / Spanish Plate Badge (Turns RED when >48h) */}
        <div className={`inline-flex items-center rounded overflow-hidden h-7 transition-all ${
          isAlertOver48h
            ? 'border-2 border-red-600 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-400'
            : 'border border-slate-300 bg-white text-slate-900 shadow-xs'
        }`}>
          <div className={`px-1.5 h-full flex flex-col items-center justify-center text-[8px] font-bold tracking-tighter shrink-0 border-r ${
            isAlertOver48h
              ? 'bg-red-700 text-white border-red-800'
              : 'bg-[#002C6C] text-white border-blue-900'
          }`}>
            <span>★</span>
            <span className="text-[9px] leading-none">E</span>
          </div>
          <div className={`px-2 font-mono font-bold tracking-wider text-xs whitespace-nowrap ${
            isAlertOver48h ? 'text-red-700 font-extrabold' : 'text-slate-900'
          }`}>
            {vehicle.plate}
          </div>
        </div>

        {/* Time in column */}
        <span className={`text-[11px] font-medium flex items-center gap-1 ${
          isAlertOver48h ? 'text-rose-700 font-bold' : 'text-slate-500'
        }`}>
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="font-mono tabular-nums">{timeInColumn}</span>
        </span>
      </div>

      {/* Brand & Model */}
      <div className="mb-2">
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#002C6C] transition-colors leading-snug line-clamp-1">
          {vehicle.model}
        </h4>
      </div>

      {/* Client Name (if entered) & Phone + WhatsApp Action */}
      <div className="space-y-1 text-xs text-slate-600 mb-2.5 pt-1.5 border-t border-slate-100">
        {vehicle.clientName && (
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800 truncate">{vehicle.clientName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-mono tabular-nums truncate">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            {vehicle.phoneCountryCode} {vehicle.phoneNumber}
          </span>

          {/* Quick WhatsApp Button right on the card */}
          {onOpenWhatsApp && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWhatsApp(vehicle);
              }}
              title="Avisar por WhatsApp sobre el estado actual"
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] transition-colors active:scale-95 shrink-0"
            >
              <WhatsAppIcon className="w-3 h-3 fill-emerald-600" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      {/* Missing Part Details (if any) */}
      {vehicle.missingPartName && (
        <div className="mb-2.5 px-2 py-1.5 rounded bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px]">
          <div className="flex items-start gap-1">
            <PackageX className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
            <p className="font-medium truncate">{vehicle.missingPartName}</p>
          </div>
        </div>
      )}

      {/* Notes / Reason */}
      {vehicle.issueDescription && (
        <p className="text-[11px] text-slate-500 line-clamp-2 mb-2.5 bg-slate-50 p-1.5 rounded">
          {vehicle.issueDescription}
        </p>
      )}

      {/* Quick Move Navigation Arrows & Details */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        
        {/* Left move arrow */}
        <button
          disabled={!canMoveLeft}
          onClick={(e) => {
            e.stopPropagation();
            if (prevColumn) onMoveStatus(vehicle.id, prevColumn.id);
          }}
          title={prevColumn ? `Mover a ${prevColumn.shortTitle}` : 'Primera columna'}
          className={`p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
            !canMoveLeft ? 'opacity-20 cursor-not-allowed' : ''
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-slate-400 font-medium px-1 truncate text-center flex-1">
          Ver ficha / Avisar
        </span>

        {/* Right move arrow */}
        <button
          disabled={!canMoveRight}
          onClick={(e) => {
            e.stopPropagation();
            if (nextColumn) onMoveStatus(vehicle.id, nextColumn.id);
          }}
          title={nextColumn ? `Mover a ${nextColumn.shortTitle}` : 'Última columna'}
          className={`p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
            !canMoveRight ? 'opacity-20 cursor-not-allowed' : ''
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
