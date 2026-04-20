import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Compass } from 'lucide-react';

// Custom GP Icon Builder
const createGpIcon = (initials: string) => L.divIcon({
  className: 'custom-gp-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
      <div class="relative w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <span class="text-[10px] font-black text-white leading-none tracking-tighter">${initials.substring(0, 2).toUpperCase()}</span>
      </div>
      <div class="absolute -bottom-1 w-2 h-2 bg-emerald-500 rotate-45 border-r-2 border-b-2 border-white"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// User Location Icon
const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
      <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-pulse opacity-30"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface LeafletMapProps {
  address: string;
  height?: string;
  zoom?: number;
  adminName?: string;
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function FlyToLocation({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function LeafletMap({ address, height = '200px', zoom = 14, adminName = 'GP' }: LeafletMapProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [locating, setLocating] = useState(false);

  const mapIcon = React.useMemo(() => createGpIcon(adminName), [adminName]);

  // Geocode address
  useEffect(() => {
    if (!address) return;

    const geocode = async () => {
      setLoading(true);
      setError(false);
      
      const query = encodeURIComponent(address);
      let lat: number | null = null;
      let lon: number | null = null;

      try {
        // LAYER 1: Photon (Komoot) - Best for POIs, Landmarks, and local addresses (Uses OSM data without strict blocks)
        try {
          const res = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data.features && data.features.length > 0) {
              lon = data.features[0].geometry.coordinates[0];
              lat = data.features[0].geometry.coordinates[1];
            }
          }
        } catch (e) {
          console.warn("Photon geocoding failed", e);
        }

        // LAYER 2: Nominatim Client-Side Fallback (Direct)
        if (lat === null || lon === null) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                lat = parseFloat(data[0].lat);
                lon = parseFloat(data[0].lon);
              }
            }
          } catch (e) {
            console.warn("Nominatim geocoding failed", e);
          }
        }

        // LAYER 3: Open-Meteo Fallback (Best for generic cities/towns)
        if (lat === null || lon === null) {
          try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`);
            if (res.ok) {
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                lat = data.results[0].latitude;
                lon = data.results[0].longitude;
              }
            }
          } catch (e) {
            console.warn("OpenMeteo geocoding failed", e);
          }
        }

        // Evaluate Final Results
        if (lat !== null && lon !== null) {
          setCoords([lat, lon]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Fatal geocoding error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [address]);

  // Calculate distance
  useEffect(() => {
    if (coords && userCoords) {
      const p1 = L.latLng(coords[0], coords[1]);
      const p2 = L.latLng(userCoords[0], userCoords[1]);
      const d = p1.distanceTo(p2); // distance in meters
      if (d > 1000) {
        setDistance((d / 1000).toFixed(1) + ' km');
      } else {
        setDistance(Math.round(d) + ' m');
      }
    }
  }, [coords, userCoords]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords([position.coords.latitude, position.coords.longitude]);
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocating(false);
        alert('Could not find your location. Please enable GPS.');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  if (loading) {
    return (
      <div style={{ height }} className="w-full bg-white/5 animate-pulse rounded-xl flex items-center justify-center text-white/20 text-xs">
        Locating meeting point...
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div style={{ height }} className="w-full bg-red-500/10 rounded-xl flex items-center justify-center text-red-400/60 text-xs p-4 text-center">
        Could not find location on map. Please check the address.
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-white/10 relative group">
      <MapContainer 
        center={coords} 
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Meeting Point Marker (GP) */}
        <Marker position={coords} icon={mapIcon}>
          <Popup>
            <div className="text-slate-900 p-1">
              <div className="font-black text-emerald-600 text-xs uppercase tracking-tighter">{adminName} Meeting Point</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{address}</div>
            </div>
          </Popup>
        </Marker>

        {/* User Location Marker */}
        {userCoords && (
          <>
            <Marker position={userCoords} icon={userIcon}>
              <Popup>
                <div className="text-slate-900 text-[10px] font-bold">You are here</div>
              </Popup>
            </Marker>
            <Circle 
              center={userCoords} 
              radius={50} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} 
            />
            <FlyToLocation coords={userCoords} />
          </>
        )}

        <MapController center={coords} zoom={zoom} />
      </MapContainer>

      {/* Overlay Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
        <button 
          onClick={handleLocateMe}
          disabled={locating}
          className="p-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-white hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95"
          title="Find My Location"
        >
          {locating ? <Compass className="animate-spin" size={18} /> : <Navigation size={18} />}
        </button>
      </div>

      {/* Distance Badge */}
      {distance && (
        <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-white/20">
          <MapPin size={12} />
          <span>{distance} Away</span>
        </div>
      )}

      {/* Map Branding */}
      <div className="absolute bottom-3 right-3 z-[1000] pointer-events-none opacity-50">
        <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">HillTrip Map Engine</div>
      </div>
    </div>
  );
}
