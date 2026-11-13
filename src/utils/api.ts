import { Vehicle } from '../types/workshop';

export interface ServerSyncResponse {
  vehicles: Vehicle[];
  serverTime?: string;
}

/**
 * Fetch all vehicles stored on the central server
 */
export async function fetchServerVehicles(): Promise<Vehicle[] | null> {
  try {
    const res = await fetch('/api/vehicles', {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data: ServerSyncResponse = await res.json();
    return Array.isArray(data.vehicles) ? data.vehicles : null;
  } catch (error) {
    console.warn('Could not sync from server (offline or local mode):', error);
    return null;
  }
}

/**
 * Save or update a single vehicle on the central server
 */
export async function saveVehicleToServer(vehicle: Vehicle): Promise<boolean> {
  try {
    const res = await fetch(`/api/vehicles/${encodeURIComponent(vehicle.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicle)
    });
    return res.ok;
  } catch (error) {
    console.warn('Failed to save vehicle to server:', error);
    return false;
  }
}

/**
 * Sync the entire list of vehicles to the central server
 */
export async function syncAllVehiclesToServer(vehicles: Vehicle[]): Promise<boolean> {
  try {
    const res = await fetch('/api/vehicles', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vehicles })
    });
    return res.ok;
  } catch (error) {
    console.warn('Failed to sync all vehicles to server:', error);
    return false;
  }
}

/**
 * Delete a vehicle from the central server
 */
export async function deleteVehicleFromServer(vehicleId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.warn('Failed to delete vehicle from server:', error);
    return false;
  }
}
