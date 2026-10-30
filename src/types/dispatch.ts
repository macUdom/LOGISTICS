export type OperationalStatus = 'ON TIME' | 'DELAYED' | 'SLA RISK' | 'CRITICAL' | 'IDLE';

export type PriorityLevel = 'P0 - CRITICAL' | 'P1 - HIGH' | 'P2 - STANDARD' | 'P3 - LOW';

export type VehicleType = 'E-Cargo Van' | 'Heavy Transit' | 'Rapid Moto' | 'Autonomous Pod' | 'Drone Wing';

export type CargoType = 'COLD CHAIN' | 'HIGH VALUE' | 'HAZARDOUS' | 'STANDARD' | 'MEDICAL';

export interface RouteStop {
  id: string;
  type: 'PICKUP' | 'DROP';
  label: string;
  address: string;
  client: string;
  eta: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
  signatureRequired: boolean;
  coords: [number, number]; // [lat, lng]
}

export interface CourierUnit {
  id: string;
  callsign: string;
  name: string;
  avatar: string;
  status: OperationalStatus;
  vehicleType: VehicleType;
  plate: string;
  battery: number; // 0 - 100%
  speed: number; // km/h
  cargoBayTemp: number; // °C
  cargoBayTargetTemp: number; // °C
  coords: [number, number]; // [lat, lng]
  heading: number; // degrees 0-360
  currentSector: string;
  activeOrderId: string | null;
  completedDropsToday: number;
  slaAdherence: number; // % e.g. 98.4
  signalDbm: number; // e.g. -68 dBm
  latencyMs: number;
  phone: string;
  notes: string;
  breadcrumbs: Array<[number, number]>;
}

export interface DispatchOrder {
  id: string;
  trackingCode: string;
  title: string;
  priority: PriorityLevel;
  status: OperationalStatus;
  courierId: string;
  sector: string;
  originName: string;
  destinationName: string;
  destAddress: string;
  slaDeadline: string; // ISO string
  timeRemainingSec: number;
  cargoType: CargoType;
  cargoWeightKg: number;
  stops: RouteStop[];
  trajectory: Array<[number, number]>;
  progressPct: number;
  specialInstructions?: string;
  createdAt: string;
}

export interface IncidentAlert {
  id: string;
  code: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  courierId: string;
  orderId?: string;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  sector: string;
  recommendedAction: string;
}

export interface SectorZone {
  id: string;
  name: string;
  code: string;
  color: string;
  polygon: Array<[number, number]>; // [lat, lng]
  center: [number, number];
  capacityLimit: number;
  activeCouriers: number;
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  avgSpeed: number;
  slaHealth: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  type: 'PACKET' | 'EVENT' | 'WARN' | 'HEARTBEAT';
  courierId: string;
  message: string;
  latency: number;
}
