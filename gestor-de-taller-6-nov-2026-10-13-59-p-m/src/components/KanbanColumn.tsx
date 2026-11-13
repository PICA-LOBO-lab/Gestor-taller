import React, { useState } from 'react';
import { ColumnConfig, ColumnId, Vehicle } from '../types/workshop';
import { VehicleCard } from './VehicleCard';
import { isExceeded48Hours } from '../utils/formatters';
import { AlertTriangle, Inbox } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnConfig;
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onMoveStatus: (vehicleId: string, nextStatus: ColumnId) => void;
  onDropVehicle: (vehicleId: string, targetColumn: ColumnId) => void;
  onOpenWhatsApp?: (vehicle: Vehicle) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  vehicles,
  onSelectVehicle,
  onMoveStatus,
  onDropVehicle,
  onOpenWhatsApp
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const columnAlerts = vehicles.filter(v => isExceeded48Hours(v)).length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const vehicleId = e.dataTransfer.getData('text/plain');
    if (vehicleId) {
      onDropVehicle(vehicleId, column.id);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, vehicleId: string) => {
    e.dataTransfer.setData('text/plain', vehicleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Special styling for critical columns
  const isFaltaPiezaCol = column.id === 'falta_pieza';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full rounded-xl transition-all duration-150 ${
        isDragOver
          ? 'bg-blue-50/80 ring-2 ring-[#002C6C]/40 border-dashed border-[#002C6C]'
          : isFaltaPiezaCol && columnAlerts > 0
          ? 'bg-rose-50/40 border border-rose-200'
          : 'bg-slate-50/80 border border-slate-200/90'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-200/80">
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0">
            {/* Color Accent Indicator */}
            <div className={`w-2.5 h-2.5 rounded-full ${
              column.id === 'abrir_or' ? 'bg-purple-600' :
              column.id === 'diagnostico' ? 'bg-blue-600' :
              column.id === 'presupuesto' ? 'bg-amber-500' :
              column.id === 'reparacion' ? 'bg-indigo-600' :
              column.id === 'falta_pieza' ? 'bg-rose-600' : 'bg-emerald-600'
            }`} />
            
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {column.title}
            </h3>
          </div>

          {/* Count Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {columnAlerts > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200" title={`${columnAlerts} vehículos con más de 48h`}>
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span className="font-mono tabular-nums">{columnAlerts}</span>
              </span>
            )}

            <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-xs font-mono font-bold border border-slate-200 shadow-2xs">
              {vehicles.length}
            </span>
          </div>

        </div>

        {/* Subheader: Column Summary */}
        <div className="mt-2 text-[11px] text-slate-500">
          <span className="truncate block">{column.description}</span>
        </div>
      </div>

      {/* Cards Scrollable Body */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-250px)] min-h-[140px]">
        {vehicles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 px-4 text-center text-slate-400">
            <Inbox className="w-8 h-8 stroke-[1.5] mb-2 opacity-50" />
            <p className="text-xs font-medium text-slate-500">Sin vehículos</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Arrastra o mueve un vehículo aquí</p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
              onMoveStatus={onMoveStatus}
              onDragStart={handleCardDragStart}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          ))
        )}
      </div>

    </div>
  );
};
