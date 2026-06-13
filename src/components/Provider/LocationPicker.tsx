import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Target } from 'lucide-react';

// Corriger le problème des icones manquantes dans Leaflet + Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

interface LocationPickerProps {
    position: { lat: number; lng: number } | null;
    onChange?: (pos: { lat: number; lng: number }) => void;
    height?: string;
    readOnly?: boolean;
}

const LocationMarker = ({ position, onChange, readOnly }: { position: { lat: number; lng: number } | null, onChange?: (pos: { lat: number; lng: number }) => void, readOnly?: boolean }) => {
    useMapEvents({
        click(e) {
            if (!readOnly && onChange) {
                onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });

    return position === null ? null : (
        <Marker 
            position={position} 
            draggable={!readOnly} 
            eventHandlers={{
                dragend: (e) => {
                    if (!readOnly && onChange) {
                        const marker = e.target;
                        const pos = marker.getLatLng();
                        onChange({ lat: pos.lat, lng: pos.lng });
                    }
                }
            }} 
        />
    );
};

const MapController = ({ targetPosition }: { targetPosition: { lat: number; lng: number } | null }) => {
    const map = useMap();
    useEffect(() => {
        if (targetPosition) {
            map.flyTo(targetPosition, 15, { animate: true, duration: 1.5 });
        }
    }, [targetPosition, map]);
    return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ position, onChange, height = "250px", readOnly = false }) => {
    // Centre par défaut : Casablanca
    const [center] = useState<{lat: number, lng: number}>({ lat: 33.5731, lng: -7.5898 });
    const [isLocating, setIsLocating] = useState(false);
    const [lastLocatePos, setLastLocatePos] = useState<{lat: number, lng: number} | null>(null);

    const handleLocateMe = () => {
        if (readOnly || !onChange) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                onChange(newPos);
                setLastLocatePos(newPos); // Déclenche le flyTo de la carte
                setIsLocating(false);
            },
            (error) => {
                console.error(error);
                setIsLocating(false);
            }
        );
    };

    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm group">
            <div style={{ height, width: '100%' }}>
                <MapContainer center={position || center} zoom={12} style={{ height: '100%', width: '100%', zIndex: 10 }} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} onChange={onChange} readOnly={readOnly} />
                    <MapController targetPosition={lastLocatePos} />
                </MapContainer>
            </div>

            {/* Overlay d'aide */}
            {!position && !readOnly && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center z-20 pointer-events-none transition-opacity group-hover:opacity-0">
                    <MapPin className="w-8 h-8 mb-2 opacity-80" />
                    <p className="font-semibold text-sm">Cliquez sur la carte pour placer votre salon</p>
                </div>
            )}

            {/* Bouton pour détecter ma position automatiquement */}
            {!readOnly && (
                <button 
                    type="button" 
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="absolute top-4 right-4 z-30 bg-white dark:bg-[#1a1d27] text-[#1A6FD1] dark:text-blue-400 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 hover:scale-105 active:scale-95 transition-all"
                    title="Me localiser"
                >
                    <Target className={`w-5 h-5 ${isLocating ? 'animate-spin opacity-50' : ''}`} />
                </button>
            )}

            {/* Info Position */}
            {position && (
                <div className="absolute bottom-4 left-4 z-30 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
                    Lat: {position.lat.toFixed(4)} | Lng: {position.lng.toFixed(4)}
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
