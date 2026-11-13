import React, { useState } from 'react';
import { Vehicle, COUNTRY_CODES, ColumnId } from '../types/workshop';
import { X, Plus, User } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  existingVehicles: Vehicle[];
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle
}) => {
  if (!isOpen) return null;

  const [phoneCountryCode, setPhoneCountryCode] = useState('+34');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [initialStatus, setInitialStatus] = useState<ColumnId>('diagnostico');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!plate.trim()) newErrors.plate = 'La matrícula es obligatoria';
    if (!model.trim()) newErrors.model = 'Indica la marca y modelo';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'El teléfono de contacto es obligatorio';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      plate: plate.trim().toUpperCase(),
      model: model.trim(),
      clientName: clientName.trim() || undefined,
      phoneCountryCode,
      phoneNumber: phoneNumber.replace(/[^0-9]/g, ''),
      status: initialStatus,
      entryDate: new Date().toISOString(),
      statusUpdatedAt: new Date().toISOString(),
      issueDescription: issueDescription.trim(),
      history: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          note: 'Vehículo recepcionado en el taller'
        }
      ]
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#002C6C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Añadir Vehículo
              </h3>
              <p className="text-xs text-blue-200">
                Alta rápida para control en el taller y avisos WhatsApp
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Matrícula */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Matrícula *
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => {
                setPlate(e.target.value.toUpperCase());
                if (errors.plate) setErrors({ ...errors, plate: '' });
              }}
              placeholder="Ej. 1234 ABC"
              className={`w-full px-3 py-2 font-mono font-bold uppercase text-sm rounded-lg border ${
                errors.plate ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
              } focus:ring-2 focus:ring-[#002C6C] focus:outline-none`}
            />
            {errors.plate && <p className="text-[11px] text-rose-600 mt-1">{errors.plate}</p>}
          </div>

          {/* Marca / Modelo (Input libre) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Marca y Modelo *
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                if (errors.model) setErrors({ ...errors, model: '' });
              }}
              placeholder="Ej. Ford Focus, Transit, Kuga..."
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.model ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
              } focus:ring-2 focus:ring-[#002C6C] focus:outline-none`}
            />
            {errors.model && <p className="text-[11px] text-rose-600 mt-1">{errors.model}</p>}
          </div>

          {/* Nombre Cliente (Opcional, para personalizar WhatsApp) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre del Cliente (Opcional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej. Carlos Martínez (se usará en los mensajes WhatsApp)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#002C6C] focus:outline-none"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Teléfono de Contacto (WhatsApp) *
            </label>
            <div className="flex gap-2">
              <select
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className="w-24 px-2 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-mono shrink-0"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.flag} {item.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                }}
                placeholder="612345678"
                className={`flex-1 px-3 py-2 text-sm font-mono rounded-lg border ${
                  errors.phoneNumber ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                } focus:ring-2 focus:ring-[#002C6C] focus:outline-none`}
              />
            </div>
            {errors.phoneNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Fase inicial */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Fase inicial en taller
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInitialStatus('abrir_or')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  initialStatus === 'abrir_or'
                    ? 'bg-purple-100 text-purple-900 border-purple-400 ring-2 ring-purple-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Abrir OR (sin orden)
              </button>
              <button
                type="button"
                onClick={() => setInitialStatus('diagnostico')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  initialStatus === 'diagnostico'
                    ? 'bg-blue-100 text-blue-900 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Entrada / Diagnóstico
              </button>
            </div>
          </div>

          {/* Avería / Motivo (Opcional) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Motivo de Entrada / Avería (Opcional)
            </label>
            <textarea
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Descripción de la avería, síntoma o trabajo a realizar..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#002C6C] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#002C6C] hover:bg-blue-900 rounded-lg shadow-sm transition-all"
            >
              Añadir al Tablero
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
