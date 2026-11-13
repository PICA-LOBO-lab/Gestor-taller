export type ColumnId = 
  | 'abrir_or'
  | 'diagnostico'
  | 'presupuesto'
  | 'reparacion'
  | 'falta_pieza'
  | 'listo';

export interface ColumnConfig {
  id: ColumnId;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  badgeColor: string;
  accentBg: string;
}

export interface StatusHistoryEntry {
  status: ColumnId;
  timestamp: string; // ISO string
  note?: string;
}

export interface Vehicle {
  id: string;
  plate: string; // e.g. "4920 MNB"
  model: string; // User typed brand/model, e.g. "Ford Focus"
  clientName?: string;
  phoneCountryCode: string; // e.g. "+34"
  phoneNumber: string; // e.g. "612345678"
  orNumber?: string;
  estimatedBudget?: number;
  status: ColumnId;
  entryDate: string; // ISO string
  statusUpdatedAt: string; // ISO string
  issueDescription: string;
  missingPartName?: string;
  missingPartReference?: string;
  technicianName?: string;
  history: StatusHistoryEntry[];
  priority?: 'normal' | 'alta' | 'urgente';
  fuelType?: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  lastAlertAcknowledgedAt?: string;
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'abrir_or',
    title: 'Abrir OR',
    shortTitle: 'Abrir OR',
    description: 'En taller pendiente de abrir orden',
    color: 'border-purple-400 text-purple-700',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentBg: 'bg-purple-500/10'
  },
  {
    id: 'diagnostico',
    title: 'Entrada / Diagnóstico',
    shortTitle: 'Diagnóstico',
    description: 'Recepción inicial y diagnosis',
    color: 'border-blue-400 text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentBg: 'bg-blue-500/10'
  },
  {
    id: 'presupuesto',
    title: 'Esperando Presupuesto',
    shortTitle: 'Presupuesto',
    description: 'Aprobación o tasación pericial',
    color: 'border-amber-400 text-amber-700',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentBg: 'bg-amber-500/10'
  },
  {
    id: 'reparacion',
    title: 'En Reparación',
    shortTitle: 'En Taller',
    description: 'Trabajos mecánicos en curso',
    color: 'border-indigo-400 text-indigo-700',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentBg: 'bg-indigo-500/10'
  },
  {
    id: 'falta_pieza',
    title: 'Falta Pieza (Retrasado)',
    shortTitle: 'Falta Pieza',
    description: 'Pendiente de recambio original',
    color: 'border-rose-400 text-rose-700',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentBg: 'bg-rose-500/10'
  },
  {
    id: 'listo',
    title: 'Listo para Entrega',
    shortTitle: 'Terminado',
    description: 'Reparación finalizada',
    color: 'border-emerald-400 text-emerald-700',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentBg: 'bg-emerald-500/10'
  }
];

export const COUNTRY_CODES = [
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+1', country: 'EE.UU. / Can.', flag: '🇺🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' }
];
