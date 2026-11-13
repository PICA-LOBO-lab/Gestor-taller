/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, ColumnId, KANBAN_COLUMNS } from './types/workshop';
import { isExceeded48Hours } from './utils/formatters';
import { WhatsAppTemplateId } from './utils/whatsapp';
import { SAMPLE_VEHICLES } from './data/initialVehicles';
import { 
  fetchServerVehicles, 
  saveVehicleToServer, 
  syncAllVehiclesToServer, 
  deleteVehicleFromServer 
} from './utils/api';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { VehicleDetailDrawer } from './components/VehicleDetailDrawer';
import { AddVehicleModal } from './components/AddVehicleModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ShareDeviceModal } from './components/ShareDeviceModal';
import { Plus, X } from 'lucide-react';

const STORAGE_KEY = 'ford_workshop_vehicles_v1';

export default function App() {
  // 1. Initial State: Load from cache first for instant rendering
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((v: Vehicle) => !v.id.startsWith('ford-v'));
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved workshop data', e);
    }
    return [];
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cloud & Multi-device sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // WhatsApp modal state
  const [whatsAppVehicle, setWhatsAppVehicle] = useState<Vehicle | null>(null);
  const [whatsAppInitialTemplate, setWhatsAppInitialTemplate] = useState<WhatsAppTemplateId | undefined>(undefined);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Sync to local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [vehicles]);

  // Central Server Synchronizer (Cross-device sync across Home PC, Work PC, Mobile)
  const syncWithServer = useCallback(async (isInitial = false) => {
    try {
      setIsSyncing(true);
      const serverVehicles = await fetchServerVehicles();
      
      if (serverVehicles !== null) {
        if (serverVehicles.length > 0) {
          // Server has data (e.g. edited from work PC), update local state
          setVehicles((current) => {
            const currentStr = JSON.stringify(current);
            const serverStr = JSON.stringify(serverVehicles);
            return currentStr === serverStr ? current : serverVehicles;
          });
        } else if (isInitial && vehicles.length > 0) {
          // If server was empty on start but local has vehicles, initialize server
          await syncAllVehiclesToServer(vehicles);
        }
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [vehicles]);

  // Start background multi-device synchronization
  useEffect(() => {
    let mounted = true;
    syncWithServer(true);

    // 1. Periodic background sync every 8 seconds (picks up changes made from work or home)
    const interval = setInterval(() => {
      if (mounted) {
        syncWithServer(false);
      }
    }, 8000);

    // 2. Immediate sync when user refocuses browser window (e.g. switches to work tab or opens PC)
    const handleWindowFocus = () => {
      if (mounted) {
        syncWithServer(false);
      }
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [syncWithServer]);

  // Find currently selected vehicle
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;

  // Move status handler
  const handleMoveStatus = (vehicleId: string, nextStatus: ColumnId) => {
    let updatedVehicle: Vehicle | null = null;

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          if (v.status === nextStatus) return v;

          const targetCol = KANBAN_COLUMNS.find((c) => c.id === nextStatus);
          const nowIso = new Date().toISOString();
          
          const newHistory = [
            ...(v.history || []),
            {
              status: nextStatus,
              timestamp: nowIso,
              note: `Movido a ${targetCol?.title}`
            }
          ];

          updatedVehicle = {
            ...v,
            status: nextStatus,
            statusUpdatedAt: nowIso,
            lastAlertAcknowledgedAt: undefined,
            history: newHistory
          };

          return updatedVehicle;
        }
        return v;
      })
    );

    if (updatedVehicle) {
      saveVehicleToServer(updatedVehicle);
    }

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const targetCol = KANBAN_COLUMNS.find((c) => c.id === nextStatus);
    
    if (vehicle && targetCol) {
      showToast(`${vehicle.plate} movido a ${targetCol.shortTitle}`);
    }
  };

  const handleDropVehicle = (vehicleId: string, targetColumn: ColumnId) => {
    handleMoveStatus(vehicleId, targetColumn);
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : v))
    );
    saveVehicleToServer(updated);
    showToast(`Vehículo ${updated.plate} actualizado`);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    deleteVehicleFromServer(vehicleId);

    if (selectedVehicleId === vehicleId) {
      setSelectedVehicleId(null);
    }
    if (whatsAppVehicle?.id === vehicleId) {
      setWhatsAppVehicle(null);
    }
    showToast('Vehículo retirado del tablero');
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    saveVehicleToServer(newVehicle);
    showToast(`Vehículo ${newVehicle.plate} registrado con éxito`);
  };

  const handleLoadSamples = () => {
    setVehicles(SAMPLE_VEHICLES);
    syncAllVehiclesToServer(SAMPLE_VEHICLES);
    showToast('Vehículos de ejemplo cargados y sincronizados');
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas vaciar todos los vehículos del taller para empezar de cero?')) {
      localStorage.removeItem(STORAGE_KEY);
      setVehicles([]);
      setSelectedVehicleId(null);
      setWhatsAppVehicle(null);
      syncAllVehiclesToServer([]);
      showToast('Tablero vaciado en todos tus dispositivos.');
    }
  };

  const handleOpenWhatsApp = (vehicle: Vehicle, templateId?: WhatsAppTemplateId) => {
    setWhatsAppVehicle(vehicle);
    setWhatsAppInitialTemplate(templateId);
  };

  const handleRecordWhatsAppHistory = (vehicleId: string, note: string) => {
    const nowIso = new Date().toISOString();
    let updatedTarget: Vehicle | null = null;

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          updatedTarget = {
            ...v,
            history: [
              ...(v.history || []),
              {
                status: v.status,
                timestamp: nowIso,
                note
              }
            ]
          };
          return updatedTarget;
        }
        return v;
      })
    );

    if (updatedTarget) {
      saveVehicleToServer(updatedTarget);
    }
    showToast('Comunicación WhatsApp registrada en el historial');
  };

  const handleImportBackup = (importedVehicles: Vehicle[]) => {
    setVehicles(importedVehicles);
    syncAllVehiclesToServer(importedVehicles);
    showToast(`${importedVehicles.length} vehículos restaurados y sincronizados.`);
  };

  // Vehicles exceeding 48h
  const alertVehicles = vehicles.filter((v) => isExceeded48Hours(v));
  const alertCount = alertVehicles.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-[#002C6C] selection:text-white">
      
      {/* Official Workshop Header with Multi-Device Cloud Indicator */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
        onLoadSamples={handleLoadSamples}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        hasVehicles={vehicles.length > 0}
        alertCount={alertCount}
        alertVehicles={alertVehicles}
        onSelectVehicle={(v) => setSelectedVehicleId(v.id)}
        showAlertsOnly={showAlertsOnly}
        onToggleAlertsOnly={() => setShowAlertsOnly(!showAlertsOnly)}
        isSyncing={isSyncing}
      />

      {/* Workshop KPIs & Overview Strip */}
      <MetricsBar vehicles={vehicles} />

      {/* Kanban Board Container */}
      <main className="flex-1 flex flex-col min-h-0">
        <KanbanBoard
          vehicles={vehicles}
          onSelectVehicle={(v) => setSelectedVehicleId(v.id)}
          onMoveStatus={handleMoveStatus}
          onDropVehicle={handleDropVehicle}
          showAlertsOnly={showAlertsOnly}
          onToggleAlertsOnly={() => setShowAlertsOnly(!showAlertsOnly)}
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#002C6C] text-white shadow-xl hover:bg-blue-900 active:scale-95 transition-transform"
          aria-label="Añadir vehículo"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Slide-over Detail Drawer */}
      <VehicleDetailDrawer
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicleId(null)}
        onUpdateVehicle={handleUpdateVehicle}
        onDeleteVehicle={handleDeleteVehicle}
        onMoveStatus={handleMoveStatus}
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* Quick Intake Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVehicle={handleAddVehicle}
        existingVehicles={vehicles}
      />

      {/* WhatsApp Message Composer Modal */}
      <WhatsAppModal
        isOpen={Boolean(whatsAppVehicle)}
        vehicle={whatsAppVehicle}
        initialTemplate={whatsAppInitialTemplate}
        onClose={() => setWhatsAppVehicle(null)}
        onRecordHistory={handleRecordWhatsAppHistory}
      />

      {/* Multi-Device & Cloud Sync Info Modal */}
      <ShareDeviceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        vehicles={vehicles}
        onManualSync={() => syncWithServer(false)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onImportBackup={handleImportBackup}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-medium shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
