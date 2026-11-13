import React from 'react';
import { Vehicle } from '../types/workshop';
import { isExceeded48Hours } from '../utils/formatters';
import { Car, Clock, AlertTriangle, CheckCircle2, ShieldAlert, FilePlus2 } from 'lucide-react';

interface MetricsBarProps {
  vehicles: Vehicle[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ vehicles }) => {
  const totalVehicles = vehicles.length;
  const sinOrVehicles = vehicles.filter(v => v.status === 'abrir_or').length;
  const inRepair = vehicles.filter(v => v.status === 'reparacion').length;
  const missingParts = vehicles.filter(v => v.status === 'falta_pieza').length;
  const readyVehicles = vehicles.filter(v => v.status === 'listo').length;
  const alertsOver48h = vehicles.filter(v => isExceeded48Hours(v)).length;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Total En Taller */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-md bg-blue-100/70 text-[#002C6C] flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                En Taller
              </p>
              <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {totalVehicles}
              </p>
            </div>
          </div>

          {/* Sin OR / Abrir OR */}
          <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
            sinOrVehicles > 0
              ? 'bg-purple-50/80 border-purple-200'
              : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
              sinOrVehicles > 0 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <FilePlus2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className={`text-[11px] font-medium uppercase tracking-wider truncate ${
                sinOrVehicles > 0 ? 'text-purple-800 font-semibold' : 'text-slate-500'
              }`}>
                Abrir OR
              </p>
              <p className={`text-base font-bold font-mono tabular-nums ${
                sinOrVehicles > 0 ? 'text-purple-700' : 'text-slate-900'
              }`}>
                {sinOrVehicles}
              </p>
            </div>
          </div>

          {/* En Box / Reparación */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-md bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                En Box / Obra
              </p>
              <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {inRepair}
              </p>
            </div>
          </div>

          {/* Falta Pieza */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-md bg-rose-100/70 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                Falta Pieza
              </p>
              <p className="text-base font-bold text-rose-700 font-mono tabular-nums">
                {missingParts}
              </p>
            </div>
          </div>

          {/* Alertas >48h */}
          <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
            alertsOver48h > 0
              ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-200'
              : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
              alertsOver48h > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className={`text-[11px] font-medium uppercase tracking-wider truncate ${
                alertsOver48h > 0 ? 'text-rose-800 font-semibold' : 'text-slate-500'
              }`}>
                Alertas &gt;48h
              </p>
              <p className={`text-base font-bold font-mono tabular-nums ${
                alertsOver48h > 0 ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {alertsOver48h}
              </p>
            </div>
          </div>

          {/* Listos Entrega */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-md bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                Listos Entrega
              </p>
              <p className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                {readyVehicles}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
