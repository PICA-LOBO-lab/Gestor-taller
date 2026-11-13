import { Vehicle } from '../types/workshop';

// Empty by default: the user wants to start entering their own vehicles from scratch
export const INITIAL_VEHICLES: Vehicle[] = [];

// Optional sample templates if user tests or demonstrates the system
export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 'sample-1',
    plate: '4821 LZM',
    model: 'Ford Focus ST-Line 1.0 EcoBoost 125CV',
    clientName: 'Carlos Mendizábal',
    phoneCountryCode: '+34',
    phoneNumber: '619842510',
    orNumber: 'OR-2024-104',
    estimatedBudget: 680,
    status: 'falta_pieza',
    entryDate: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
    statusUpdatedAt: new Date(Date.now() - 29 * 3600 * 1000).toISOString(),
    issueDescription: 'Pérdida intermitente de potencia. Válvula wastegate con holgura.',
    missingPartName: 'Electroválvula actuador turbo original Ford',
    missingPartReference: 'FRD-1984022-B',
    technicianName: 'Javier Morales (Box 3)',
    priority: 'alta',
    fuelType: 'Gasolina',
    history: [
      { status: 'diagnostico', timestamp: new Date(Date.now() - 42 * 3600 * 1000).toISOString(), note: 'Entrada en taller' },
      { status: 'falta_pieza', timestamp: new Date(Date.now() - 29 * 3600 * 1000).toISOString(), note: 'Esperando recambio original' }
    ]
  },
  {
    id: 'sample-2',
    plate: '9312 KLP',
    model: 'Ford Kuga 2.5 Duratec PHEV Titanium',
    clientName: 'Elena Ramos',
    phoneCountryCode: '+34',
    phoneNumber: '622451098',
    orNumber: 'OR-2024-105',
    status: 'diagnostico',
    entryDate: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    statusUpdatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    issueDescription: 'Aviso testigo motor intermitente y pérdida de carga híbrida.',
    technicianName: 'Marcos Soto',
    priority: 'normal',
    fuelType: 'Híbrido',
    history: [
      { status: 'diagnostico', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Entrada para diagnosis electrónica' }
    ]
  },
  {
    id: 'sample-3',
    plate: '1450 MRB',
    model: 'Ford Transit Custom 2.0 EcoBlue 130CV',
    clientName: 'Talleres y Reformas Gómez',
    phoneCountryCode: '+34',
    phoneNumber: '650119283',
    orNumber: 'OR-2024-106',
    estimatedBudget: 420,
    status: 'presupuesto',
    entryDate: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    statusUpdatedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    issueDescription: 'Revisión periódica de mantenimiento y sustitución de pastillas de freno delanteras.',
    technicianName: 'Pedro Alarcón',
    priority: 'normal',
    fuelType: 'Diésel',
    history: [
      { status: 'diagnostico', timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), note: 'Inspección completada' },
      { status: 'presupuesto', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Presupuesto emitido al cliente' }
    ]
  },
  {
    id: 'sample-4',
    plate: '7021 HGT',
    model: 'Ford Puma 1.0 EcoBoost mHEV 155CV',
    clientName: 'Lucía Navarro',
    phoneCountryCode: '+34',
    phoneNumber: '678330912',
    orNumber: 'OR-2024-107',
    status: 'reparacion',
    entryDate: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    statusUpdatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    issueDescription: 'Cambio de amortiguadores delanteros y alineación de dirección.',
    technicianName: 'David Gil (Box 1)',
    priority: 'normal',
    fuelType: 'Híbrido',
    history: [
      { status: 'presupuesto', timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Presupuesto aceptado' },
      { status: 'reparacion', timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), note: 'En elevador para cambio de amortiguación' }
    ]
  },
  {
    id: 'sample-5',
    plate: '3349 DPK',
    model: 'Ford Fiesta 1.1 Ti-VCT Trend',
    clientName: 'Alberto Serrano',
    phoneCountryCode: '+34',
    phoneNumber: '691230485',
    orNumber: 'OR-2024-103',
    status: 'listo',
    entryDate: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    statusUpdatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    issueDescription: 'Sustitución de batería de 12V e inspección pre-ITV satisfactoria.',
    technicianName: 'Marcos Soto',
    priority: 'normal',
    fuelType: 'Gasolina',
    history: [
      { status: 'reparacion', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), note: 'Batería montada y comprobada' },
      { status: 'listo', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Lavado de cortesía y listo para entrega' }
    ]
  }
];
