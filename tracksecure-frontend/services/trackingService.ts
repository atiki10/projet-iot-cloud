import { TrackingData, PackageData, EnrichedEvent } from '../types';

// Simuler une table de colis en mémoire avec l'assignation utilisateur
const packages: PackageData[] = [
    { id: 'PKG-12345', username: 'user', departureLocation: 'Entrepôt A,agadir', pickupLocation: 'Client X, taounate' },
    { id: 'PKG-ABCDE', username: 'user', departureLocation: 'Entrepôt B, azrou', pickupLocation: 'Client Y, fes' },
];

/**
 * Récupère les dernières données de suivi depuis le backend Spring Boot.
 */
export const fetchTrackingData = async (packageId: string): Promise<TrackingData> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/sensor/latest`);

    if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut: ${response.status}`);
    }
    const backendData: EnrichedEvent = await response.json();

    const transformedData: TrackingData = {
        temperature: backendData.dhtData.temperature,
        humidity: backendData.dhtData.humidity,
        coordinates: {
            lat: backendData.gpsData.latitude,
            lon: backendData.gpsData.longitude,
        },
        timestamp: backendData.dhtData.timestamp || new Date().toISOString(),
        packageId: packageId,
    };

    return transformedData;
};

/**
 * Récupère l'adresse à partir des coordonnées GPS via Nominatim (OpenStreetMap)
 * avec un fallback sur BigDataCloud si Nominatim échoue.
 */
export const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    // Ignorer les coordonnées par défaut (0, 0)
    if (lat === 0 && lon === 0) {
        return "En attente de signal GPS...";
    }

    // Méthode 1 : Nominatim (OpenStreetMap)
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);

        if (response.ok) {
            const data = await response.json();
            if (data.address) {
                const parts = [];
                if (data.address.country) parts.push(data.address.country);
                if (data.address.city || data.address.town || data.address.village) parts.push(data.address.city || data.address.town || data.address.village);
                if (data.address.suburb || data.address.neighbourhood || data.address.road) parts.push(data.address.suburb || data.address.neighbourhood || data.address.road);
                return parts.join(', ');
            }
        }
    } catch (error) {
        console.warn("Nominatim a échoué, tentative avec BigDataCloud...", error);
    }

    // Méthode 2 (Secours) : BigDataCloud API (Gratuit, pas de clé requise pour usage basique)
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`);

        if (response.ok) {
            const data = await response.json();
            // Format: Pays, Ville, Localité
            const parts = [];
            if (data.countryName) parts.push(data.countryName);
            if (data.city || data.locality) parts.push(data.city || data.locality);
            if (data.principalSubdivision) parts.push(data.principalSubdivision);

            return parts.join(', ');
        }
    } catch (error) {
        console.error("BigDataCloud a aussi échoué:", error);
    }

    // Méthode 3 (Ultime Secours) : Détection locale approximative
    // Si tout échoue, on regarde si les coordonnées correspondent à Agadir
    // Agadir est environ à Lat 30.3 - 30.5 et Lon -9.4 - -9.7
    if (lat > 30.3 && lat < 30.5 && lon > -9.7 && lon < -9.4) {
        return "Agadir, Souss-Massa, Maroc";
    }

    return "Adresse indisponible (Erreur réseau)";
};

/**
 * Simule la création d'un nouveau colis et l'assigne à un utilisateur.
 */
export const createPackage = (packageId: string, username: string, departureLocation: string, pickupLocation: string): Promise<PackageData> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (packages.some(p => p.id === packageId)) {
                return reject(new Error('Ce numéro de colis existe déjà.'));
            }
            if (!packageId.trim()) {
                return reject(new Error('Le numéro de colis ne peut pas être vide.'));
            }
            if (!username) {
                return reject(new Error('Un utilisateur doit être sélectionné.'));
            }
            if (!departureLocation.trim() || !pickupLocation.trim()) {
                return reject(new Error('Les lieux de départ et de prise en charge sont requis.'));
            }
            const newPackage = { id: packageId, username, departureLocation, pickupLocation };
            packages.push(newPackage);
            resolve(newPackage);
        }, 300);
    });
};

/**
 * Récupère la liste de tous les colis (pour l'admin).
 */
export const getPackages = (): Promise<PackageData[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...packages]);
        }, 200);
    });
};

/**
 * Récupère les colis pour un utilisateur spécifique.
 */
export const getPackagesForUser = (username: string): Promise<PackageData[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(packages.filter(p => p.username === username));
        }, 200);
    });
};
