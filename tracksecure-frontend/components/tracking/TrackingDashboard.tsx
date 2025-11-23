import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchTrackingData, getPackages, getPackagesForUser, getAddressFromCoordinates } from '../../services/trackingService';
// polling used instead of websocket for debugging/proxy-free operation
import { TrackingData, PackageData } from '../../types';
import DashboardCard from '../DashboardCard';
import MapCard from '../MapCard';
import { ThermometerIcon, DropletIcon, MapPinIcon, PackageIcon, ExclamationTriangleIcon } from '../Icons';

// Helper: remove any property named 'timestamp' (or containing 'timestamp') recursively
function removeTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(removeTimestamps);
  if (typeof obj !== 'object') return obj;

  const out: any = {};
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (lower === 'timestamp' || lower.includes('timestamp')) {
      continue;
    }
    out[key] = removeTimestamps(obj[key]);
  }
  return out;
}

function isEqualIgnoringTimestamps(a: any, b: any): boolean {
  try {
    const sa = removeTimestamps(a);
    const sb = removeTimestamps(b);
    return JSON.stringify(sa) === JSON.stringify(sb);
  } catch (e) {
    return false;
  }
}



interface TrackingDashboardProps {
  selectedPackageIdFromAdmin?: string;
  onBackToAdmin?: () => void;
}

const TrackingDashboard: React.FC<TrackingDashboardProps> = ({ selectedPackageIdFromAdmin, onBackToAdmin }) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [address, setAddress] = useState<string>("Chargement de l'adresse...");

  useEffect(() => {
    if (user) {
      const fetcher = onBackToAdmin ? getPackages : () => getPackagesForUser(user.username);
      fetcher()
        .then(pkgs => {
          setPackages(pkgs);
          if (selectedPackageIdFromAdmin) {
            setSelectedPackageId(selectedPackageIdFromAdmin);
          } else if (pkgs.length > 0 && !selectedPackageId) {
            setSelectedPackageId(pkgs[0].id);
          }
        });
    }
  }, [user, onBackToAdmin, selectedPackageIdFromAdmin]);


  const loadTrackingData = async () => {
    if (!selectedPackageId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTrackingData(selectedPackageId);
      setTrackingData(prev => {
        if (!prev) {
          return data;
        }
        // If only timestamps changed, skip updating state to avoid rerenders
        if (isEqualIgnoringTimestamps(prev, data)) {
          console.debug('Polling: only timestamps changed, skipping state update');
          return prev;
        }
        return data;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPackageId) {
      // initial snapshot
      loadTrackingData();

      // Replace WebSocket live updates with simple AJAX polling for environments
      // where WebSocket proxying is problematic. Poll every 5 seconds.
      const POLL_INTERVAL = 5000; // ms
      setWsConnected(true); // indicate 'Live' (polling)

      const timer = window.setInterval(() => {
        try {
          loadTrackingData();
        } catch (e) {
          console.error('Polling error', e);
        }
      }, POLL_INTERVAL);

      return () => {
        clearInterval(timer);
        setWsConnected(false);
      };
    } else {
      setTrackingData(null);
    }
  }, [selectedPackageId]);

  // Effect to fetch address when coordinates change
  useEffect(() => {
    if (trackingData?.coordinates) {
      getAddressFromCoordinates(trackingData.coordinates.lat, trackingData.coordinates.lon)
        .then(addr => setAddress(addr));
    }
  }, [trackingData?.coordinates.lat, trackingData?.coordinates.lon]);

  return (
    <div>
      <div className="flex items-start mb-6">
        {onBackToAdmin && (
          <button onClick={onBackToAdmin} className="mr-2 mt-1 flex-shrink-0 p-2 rounded-full hover:bg-gray-200 transition-colors" title="Retour à la liste">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <h1 className="text-3xl font-bold text-slate-800">Tableau de bord de suivi</h1>
      </div>

      <div className="mb-6">
        <label htmlFor="package-select" className="block text-sm font-medium text-gray-700 mb-2">Sélectionnez un colis :</label>
        <select
          id="package-select"
          value={selectedPackageId || ''}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
          disabled={packages.length === 0}
        >
          {packages.length > 0 ? (
            packages.map(p => <option key={p.id} value={p.id}>{p.id}</option>)
          ) : (
            <option>Aucun colis trouvé</option>
          )}
        </select>
      </div>

      {isLoading && !trackingData && <div className="text-center text-gray-600 py-4">Chargement des données...</div>}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg" role="alert">
          <div className="flex">
            <div className="py-1">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-4" />
            </div>
            <div>
              <p className="font-bold text-red-800">Erreur de connexion</p>
              <p className="text-sm text-red-700">Les données n'ont pas pu être reçues.</p>
            </div>
          </div>
        </div>
      )}


      {trackingData ? (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-700 text-center sm:text-left">Données en temps réel pour <span className="text-emerald-600">{trackingData.packageId}</span></h2>
            <div className="flex items-center space-x-3">
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${wsConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                {wsConnected ? 'Live' : 'Déconnecté'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              icon={<ThermometerIcon className="h-8 w-8 text-red-500" />}
              title="Température"
              value={`${trackingData.temperature.toFixed(1)}°C`}
              footerText={`Dernière mise à jour : ${new Date(trackingData.timestamp).toLocaleTimeString()}`}
            />
            <DashboardCard
              icon={<DropletIcon className="h-8 w-8 text-blue-500" />}
              title="Humidité"
              value={`${trackingData.humidity.toFixed(1)}%`}
              footerText="Niveau optimal"
            />
            <DashboardCard
              icon={<MapPinIcon className="h-8 w-8 text-green-500" />}
              title="Localisation"
              value={address}
              footerText="Adresse actuelle"
            />
          </div>
          <div className="mt-6">
            <MapCard coordinates={trackingData.coordinates} />
          </div>
        </>
      ) : !isLoading && !error && (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow">
          <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun colis sélectionné</h3>
          <p className="mt-1 text-sm text-gray-500">Veuillez sélectionner un colis pour afficher ses données de suivi.</p>
        </div>
      )}
    </div>
  );
};

export default TrackingDashboard;
