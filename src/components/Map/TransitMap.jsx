import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom bus icon
export const busIcon = new L.DivIcon({
  className: 'bus-marker',
  html: `<div style="
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: transform 0.3s ease;
  ">🚌</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Stop icon
export const stopIcon = new L.DivIcon({
  className: 'stop-marker',
  html: `<div style="
    background: #1e293b;
    border: 2px solid #6366f1;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Auto-fit map bounds helper
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
}

// Default center: Indore
const INDORE_CENTER = [22.7196, 75.8577];

export default function TransitMap({
  center = INDORE_CENTER,
  zoom = 13,
  busMarkers = [],
  stopMarkers = [],
  routeLine = [],
  fitBounds = null,
  height = '100%',
  children,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {fitBounds && <FitBounds bounds={fitBounds} />}

      {/* Route polyline */}
      {routeLine.length >= 2 && (
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: '#6366f1',
            weight: 4,
            opacity: 0.7,
            dashArray: '8 8',
          }}
        />
      )}

      {/* Stop markers */}
      {stopMarkers.map((stop) => (
        <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
          <Popup>
            <div style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
              <strong>{stop.stop_name}</strong>
              <br />
              <small>Stop #{stop.stop_order}</small>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Bus markers */}
      {busMarkers.map((bus) => (
        <Marker key={bus.id} position={[bus.latitude, bus.longitude]} icon={busIcon}>
          <Popup>
            <div style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
              <strong>{bus.label || 'Bus'}</strong>
              {bus.speed !== undefined && <><br /><small>{Math.round(bus.speed)} km/h</small></>}
            </div>
          </Popup>
        </Marker>
      ))}

      {children}
    </MapContainer>
  );
}
