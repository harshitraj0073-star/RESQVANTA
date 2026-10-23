import * as THREE from "three";

/**
 * Standard WGS84 Geographic Coordinate Interface
 */
export interface GeoCoordinate {
  lat: number; // -90 to +90 degrees
  lon: number; // -180 to +180 degrees
  altKm?: number;
}

export interface CityResponder {
  id: string;
  name: string;
  category: "MEDICAL" | "POLICE" | "FIRE" | "NDRF";
  phone: string;
  distanceKm: number;
  etaMin: number;
  dLat: number;
  dLon: number;
}

export interface GroundedCity {
  id: string;
  name: string;
  shortName: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  altitudeKm: number;
  weather: {
    tempC: number;
    condition: string;
    windKmh: number;
    windDirection: string;
    visibilityKm: number;
  };
  responders: CityResponder[];
}

/**
 * Illustrative Indian Command Sectors & Reference Emergency Facilities
 * NOTE: Used as demonstration benchmarks for spatial triage simulation.
 * In production, telemetry is retrieved from authentic municipal ERSS APIs.
 */
export const GROUNDED_CITIES: GroundedCity[] = [
  {
    id: "pune",
    name: "Pune",
    shortName: "Pune HQ",
    state: "Maharashtra",
    country: "India",
    lat: 18.5204,
    lon: 73.8567,
    altitudeKm: 0.56,
    weather: {
      tempC: 27,
      condition: "Fair Skies",
      windKmh: 9,
      windDirection: "NW",
      visibilityKm: 9.8,
    },
    responders: [
      {
        id: "pune-police",
        name: "112 ERSS Police & PCR Tactical Unit (Shivajinagar HQ)",
        category: "POLICE",
        phone: "112",
        distanceKm: 0.8,
        etaMin: 2,
        dLat: 0.0055,
        dLon: 0.0042,
      },
      {
        id: "pune-trauma",
        name: "Level-1 Trauma Center (Sassoon / Sancheti Hospital)",
        category: "MEDICAL",
        phone: "108",
        distanceKm: 1.4,
        etaMin: 4,
        dLat: -0.0085,
        dLon: 0.0095,
      },
      {
        id: "pune-fire",
        name: "Central HazMat Rescue Station (Deccan Gymkhana)",
        category: "FIRE",
        phone: "101",
        distanceKm: 2.1,
        etaMin: 5,
        dLat: 0.012,
        dLon: -0.011,
      },
      {
        id: "pune-ndrf",
        name: "NDRF 5th Battalion Rapid Disaster Response",
        category: "NDRF",
        phone: "1070",
        distanceKm: 3.4,
        etaMin: 8,
        dLat: -0.018,
        dLon: -0.015,
      },
    ],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    shortName: "Mumbai Control",
    state: "Maharashtra",
    country: "India",
    lat: 19.076,
    lon: 72.8777,
    altitudeKm: 0.014,
    weather: {
      tempC: 30,
      condition: "Coastal Humid",
      windKmh: 14,
      windDirection: "WSW",
      visibilityKm: 8.5,
    },
    responders: [
      {
        id: "mumbai-police",
        name: "Mumbai Police Commissionerate & 112 Control Room",
        category: "POLICE",
        phone: "112",
        distanceKm: 1.1,
        etaMin: 3,
        dLat: 0.007,
        dLon: 0.005,
      },
      {
        id: "mumbai-trauma",
        name: "KEM Hospital Emergency & Trauma Care (Parel)",
        category: "MEDICAL",
        phone: "108",
        distanceKm: 1.8,
        etaMin: 5,
        dLat: -0.009,
        dLon: 0.008,
      },
      {
        id: "mumbai-fire",
        name: "Mumbai Fire Brigade HQ (Byculla Command)",
        category: "FIRE",
        phone: "101",
        distanceKm: 2.4,
        etaMin: 6,
        dLat: 0.014,
        dLon: -0.012,
      },
      {
        id: "mumbai-ndrf",
        name: "NDRF Regional Response Centre (Andheri)",
        category: "NDRF",
        phone: "1070",
        distanceKm: 4.2,
        etaMin: 9,
        dLat: -0.022,
        dLon: -0.018,
      },
    ],
  },
  {
    id: "delhi",
    name: "New Delhi",
    shortName: "New Delhi 112",
    state: "NCR",
    country: "India",
    lat: 28.6139,
    lon: 77.209,
    altitudeKm: 0.216,
    weather: {
      tempC: 28,
      condition: "Clear Atmosphere",
      windKmh: 8,
      windDirection: "NE",
      visibilityKm: 9.0,
    },
    responders: [
      {
        id: "delhi-police",
        name: "Delhi Police Integrated Command & 112 Dispatch",
        category: "POLICE",
        phone: "112",
        distanceKm: 0.9,
        etaMin: 2,
        dLat: 0.006,
        dLon: 0.004,
      },
      {
        id: "delhi-trauma",
        name: "AIIMS Jai Prakash Narayan Apex Trauma Centre",
        category: "MEDICAL",
        phone: "108",
        distanceKm: 1.6,
        etaMin: 4,
        dLat: -0.011,
        dLon: 0.007,
      },
      {
        id: "delhi-fire",
        name: "Delhi Fire Service HQ (Connaught Place)",
        category: "FIRE",
        phone: "101",
        distanceKm: 1.9,
        etaMin: 5,
        dLat: 0.013,
        dLon: -0.009,
      },
      {
        id: "delhi-ndrf",
        name: "NDRF HQ Crisis Operations Centre",
        category: "NDRF",
        phone: "1070",
        distanceKm: 3.1,
        etaMin: 7,
        dLat: -0.016,
        dLon: -0.014,
      },
    ],
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    shortName: "Bengaluru Grid",
    state: "Karnataka",
    country: "India",
    lat: 12.9716,
    lon: 77.5946,
    altitudeKm: 0.92,
    weather: {
      tempC: 25,
      condition: "Pleasant Plateau Breeze",
      windKmh: 11,
      windDirection: "E",
      visibilityKm: 10.0,
    },
    responders: [
      {
        id: "blr-police",
        name: "Bengaluru City Police Command (Infantry Road)",
        category: "POLICE",
        phone: "112",
        distanceKm: 0.7,
        etaMin: 2,
        dLat: 0.0045,
        dLon: 0.0035,
      },
      {
        id: "blr-trauma",
        name: "Victoria Hospital Emergency Trauma Block",
        category: "MEDICAL",
        phone: "108",
        distanceKm: 1.5,
        etaMin: 4,
        dLat: -0.008,
        dLon: 0.006,
      },
      {
        id: "blr-fire",
        name: "Karnataka Fire & Emergency Command (High Grounds)",
        category: "FIRE",
        phone: "101",
        distanceKm: 2.2,
        etaMin: 5,
        dLat: 0.011,
        dLon: -0.008,
      },
      {
        id: "blr-ndrf",
        name: "NDRF 10th Battalion Detachment",
        category: "NDRF",
        phone: "1070",
        distanceKm: 3.8,
        etaMin: 8,
        dLat: -0.019,
        dLon: -0.016,
      },
    ],
  },
  {
    id: "kolkata",
    name: "Kolkata",
    shortName: "Kolkata Node",
    state: "West Bengal",
    country: "India",
    lat: 22.5726,
    lon: 88.3639,
    altitudeKm: 0.009,
    weather: {
      tempC: 29,
      condition: "Delta Warm",
      windKmh: 10,
      windDirection: "SSE",
      visibilityKm: 8.8,
    },
    responders: [
      {
        id: "kol-police",
        name: "Kolkata Police HQ & 112 Dial Centre (Lalbazar)",
        category: "POLICE",
        phone: "112",
        distanceKm: 1.0,
        etaMin: 3,
        dLat: 0.0065,
        dLon: 0.0045,
      },
      {
        id: "kol-trauma",
        name: "SSKM Hospital Trauma Care Centre (Bhowanipore)",
        category: "MEDICAL",
        phone: "108",
        distanceKm: 1.7,
        etaMin: 5,
        dLat: -0.01,
        dLon: 0.007,
      },
      {
        id: "kol-fire",
        name: "West Bengal Fire HQ (Free School Street)",
        category: "FIRE",
        phone: "101",
        distanceKm: 2.0,
        etaMin: 5,
        dLat: 0.012,
        dLon: -0.01,
      },
      {
        id: "kol-ndrf",
        name: "NDRF 2nd Battalion Rapid Action Unit (Haringhata)",
        category: "NDRF",
        phone: "1070",
        distanceKm: 4.5,
        etaMin: 10,
        dLat: -0.024,
        dLon: -0.019,
      },
    ],
  },
];

/**
 * Standard Three.js SphereGeometry WGS84 mapping.
 *
 * Three.js SphereGeometry UV mapping:
 * - u = (lon + 180) / 360
 * - v = (lat + 90) / 180
 *
 * For SphereGeometry with radius R:
 * - phi = (90 - lat) * (PI / 180)
 * - theta = (lon + 180) * (PI / 180)
 * - x = -R * sin(phi) * cos(theta)
 * - y =  R * cos(phi)
 * - z =  R * sin(phi) * sin(theta)
 */
export function latLonToSphereVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculates the exact Euler rotation [rotX, rotY, rotZ] with order 'XYZ'
 * to rotate the Earth group so that (lat, lon) lands directly at (0, 0, +R),
 * perfectly facing the camera lens along the +Z axis.
 */
export function latLonToCameraEuler(
  lat: number,
  lon: number
): [number, number, number] {
  const rotX = (lat * Math.PI) / 180;
  const rotY = -(lon * Math.PI) / 180 - Math.PI / 2;
  return [rotX, rotY, 0];
}

/**
 * Calculates the surface normal and orientation quaternion at (lat, lon)
 * so that localized 3D surface rings and beacons align flush with the sphere.
 */
export function getSurfaceOrientation(
  lat: number,
  lon: number,
  radius: number
): { position: THREE.Vector3; normal: THREE.Vector3; quaternion: THREE.Quaternion } {
  const position = latLonToSphereVector3(lat, lon, radius);
  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  return { position, normal, quaternion };
}

/**
 * Great-circle distance between two WGS84 points in kilometers (Haversine formula).
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves a coordinate string or returns the default city (Pune).
 */
export function resolveTargetCity(coordsString: string | null | undefined): {
  city: GroundedCity;
  isMatchedPreset: boolean;
  coords: GeoCoordinate;
  isDefaultFallback?: boolean;
} {
  const defaultCity = GROUNDED_CITIES[0]; // Pune

  if (!coordsString) {
    return {
      city: defaultCity,
      isMatchedPreset: true,
      coords: { lat: defaultCity.lat, lon: defaultCity.lon },
      isDefaultFallback: true,
    };
  }

  const parts = coordsString.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const lat = parts[0];
    const lon = parts[1];

    // Find nearest grounded city within 40 km tolerance
    let closestCity = defaultCity;
    let minDistance = Infinity;

    for (const city of GROUNDED_CITIES) {
      const d = haversineDistanceKm(lat, lon, city.lat, city.lon);
      if (d < minDistance) {
        minDistance = d;
        closestCity = city;
      }
    }

    if (minDistance < 40) {
      return {
        city: closestCity,
        isMatchedPreset: true,
        coords: { lat, lon },
      };
    }

    // Dynamic custom user location
    const dynamicCity: GroundedCity = {
      id: "custom-location",
      name: `Sector (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
      shortName: "Tactical Pin",
      state: "India Sector",
      country: "India",
      lat,
      lon,
      altitudeKm: 0.1,
      weather: defaultCity.weather,
      responders: defaultCity.responders.map((r) => ({
        ...r,
        id: `dyn-${r.id}`,
      })),
    };

    return {
      city: dynamicCity,
      isMatchedPreset: false,
      coords: { lat, lon },
    };
  }

  return {
    city: defaultCity,
    isMatchedPreset: true,
    coords: { lat: defaultCity.lat, lon: defaultCity.lon },
  };
}
