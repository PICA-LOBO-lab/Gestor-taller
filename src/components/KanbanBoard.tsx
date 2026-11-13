import React, { useState } from 'react';
import { ColumnId, KANBAN_COLUMNS, Vehicle } from '../types/workshop';
import { KanbanColumn } from './KanbanColumn';
import { isExceeded48Hours } from '../utils/formatters';
import { Search, Filter, AlertTriangle, Layers, X } from 'lucide-react';

interface KanbanBoardProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onMoveStatus: (vehicleId: string, nextStatus: ColumnId) => void;
  onDropVehicle: (vehicleId: string, targetColumn: ColumnId) => void;
  showAlertsOnly: boolean;
  onToggleAlertsOnly: () => void;
  onOpenWhatsApp?: (vehicle: Vehicle) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  vehicles,
  onSelectVehicle,
  onMoveStatus,
  onDropVehicle,
  showAlertsOnly,
  onToggleAlertsOnly,
  onOpenWhatsApp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileColumn, setActiveMobileColumn] = useState<ColumnId | 'all'>('all');

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    // Alert filter
    if (showAlertsOnly && !isExceeded48Hours(v)) {
      return false;
    }
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchPlate = v.plate.toLowerCase().includes(q);
      const matchName = v.clientName ? v.clientName.toLowerCase().includes(q) : false;
      const matchModel = v.model.toLowerCase().includes(q);
      const matchOr = v.orNumber ? v.orNumber.toLowerCase().includes(q) : false;
      const matchPart = v.missingPartName?.toLowerCase().includes(q);
      const matchNotes = v.issueDescription?.toLowerCase().includes(q);
      return matchPlate || matchName || matchModel || matchOr || matchPart || matchNotes;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* Board Controls: Search & Mobile Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por matrícula, cliente, modelo o avería..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002C6C] focus:border-transparent bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {showAlertsOnly && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mostrando sólo alertas &gt;48h</span>
                <button
                  onClick={onToggleAlertsOnly}
                  className="hover:text-rose-950 ml-1 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Mobile View Switcher */}
            <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveMobileColumn('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeMobileColumn === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              {KANBAN_COLUMNS.map((col) => {
                const count = filteredVehicles.filter(v => v.status === col.id).length;
                return (
                  <button
                    key={col.id}
                    onClick={() => setActiveMobileColumn(col.id)}
                    className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                      activeMobileColumn === col.id
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{col.shortTitle}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto min-h-0 bg-slate-100/70">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 min-w-[320px] xl:min-w-[1400px] h-full items-start">
          {KANBAN_COLUMNS.map((column) => {
            // Mobile visibility
            const isVisibleOnMobile = 
              activeMobileColumn === 'all' || activeMobileColumn === column.id;

            const columnVehicles = filteredVehicles.filter(
              (v) => v.status === column.id
            );

            return (
              <div 
                key={column.id} 
                className={`${isVisibleOnMobile ? 'block' : 'hidden lg:block'} h-full min-h-[300px]`}
              >
                <KanbanColumn
                  column={column}
                  vehicles={columnVehicles}
                  onSelectVehicle={onSelectVehicle}
                  onMoveStatus={onMoveStatus}
                  onDropVehicle={onDropVehicle}
                  onOpenWhatsApp={onOpenWhatsApp}
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
