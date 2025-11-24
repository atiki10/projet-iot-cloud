export interface Coordinates {
  lat: number;
  lon: number;
}

export interface TrackingData {
  temperature: number;
  humidity: number;
  coordinates: Coordinates;
  timestamp: string;
  packageId: string;
}

export interface PackageData {
  id: string;
  username: string; // L'utilisateur à qui le colis est assigné
  departureLocation: string;
  pickupLocation: string;
}

export interface User {
  username: string;
  role: string;
}
// Interface correspondant au modèle EnrichedEvent du backend
export interface EnrichedEvent {
  eventId: string;
  deviceId: string;
  shipmentId: string;
  eventType: string;
  eventTimestamp: string;
  receivedTimestamp: string;
  longitude: number;
  latitude: number;
  temperature: number;
  humidity: number;
  firmwareVersion?: string;
  transmissionMethod?: string;
  metadata?: Record<string, any>;
}
