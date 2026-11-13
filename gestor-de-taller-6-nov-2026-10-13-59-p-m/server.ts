import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Central persistence file on server disk
  const DATA_DIR = path.join(__dirname, 'server_data');
  const DATA_FILE = path.join(DATA_DIR, 'workshop_vehicles.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const readVehicles = () => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading server data file:', e);
    }
    return [];
  };

  const writeVehicles = (vehicles: unknown[]) => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(vehicles, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error writing server data file:', e);
      return false;
    }
  };

  // API Endpoints for cross-device synchronization
  app.get('/api/vehicles', (_req, res) => {
    const vehicles = readVehicles();
    res.json({ vehicles, serverTime: new Date().toISOString() });
  });

  app.post('/api/vehicles', (req, res) => {
    const newVehicle = req.body;
    if (!newVehicle || !newVehicle.id) {
      return res.status(400).json({ error: 'Vehículo inválido' });
    }
    const vehicles = readVehicles();
    const updated = [newVehicle, ...vehicles.filter((v: { id: string }) => v.id !== newVehicle.id)];
    writeVehicles(updated);
    res.status(201).json({ vehicle: newVehicle, serverTime: new Date().toISOString() });
  });

  app.put('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const updatedVehicle = req.body;
    const vehicles = readVehicles();
    const index = vehicles.findIndex((v: { id: string }) => v.id === id);
    if (index === -1) {
      vehicles.unshift(updatedVehicle);
    } else {
      vehicles[index] = { ...vehicles[index], ...updatedVehicle };
    }
    writeVehicles(vehicles);
    res.json({ vehicle: updatedVehicle, serverTime: new Date().toISOString() });
  });

  app.put('/api/vehicles', (req, res) => {
    const { vehicles } = req.body;
    if (Array.isArray(vehicles)) {
      writeVehicles(vehicles);
      return res.json({ success: true, count: vehicles.length, serverTime: new Date().toISOString() });
    }
    res.status(400).json({ error: 'Array de vehículos requerido' });
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const vehicles = readVehicles();
    const filtered = vehicles.filter((v: { id: string }) => v.id !== id);
    writeVehicles(filtered);
    res.json({ success: true, serverTime: new Date().toISOString() });
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Vite middlewares in development or static dist in production
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Concesionario Autoforma Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
