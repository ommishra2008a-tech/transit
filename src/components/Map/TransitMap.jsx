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

// Custom Blue Bus Icon
export const busIcon = new L.DivIcon({
  className: 'bus-marker-div',
  html: `<div style="
    background: #1d4ed8;
    color: white;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 14px rgba(29, 78, 216, 0.4);
  ">🚌</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

// Custom Stop Icon
export const stopIcon = new L.DivIcon({
  className: 'stop-marker-div',
  html: `<div style="
    background: #ffffff;
    border: 3px solid #1d4ed8;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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
      style={{ height, width: '100%', borderRadius: '1rem' }}
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
            color: '#2563eb',
            weight: 4,
            opacity: 0.8,
            dashArray: '6 6',
          }}
        />
      )}

      {/* Stop markers */}
      {stopMarkers.map((stop) => (
        <Marker key={stop.id || stop.stop_name} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
          <Popup>
            <div style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif', padding: '2px' }}>
              <strong style={{ fontSize: '14px' }}>{stop.stop_name}</strong>
              <br />
              <small style={{ color: '#64748b' }}>Stop #{stop.stop_order}</small>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Bus markers */}
      {busMarkers.map((bus) => (
        <Marker key={bus.id} position={[bus.latitude, bus.longitude]} icon={busIcon}>
          <Popup>
            <div style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif', padding: '2px' }}>
              <strong style={{ fontSize: '14px', color: '#1d4ed8' }}>{bus.label || 'Bus'}</strong>
              {bus.speed !== undefined && (
                <>
                  <br />
                  <small style={{ color: '#64748b' }}>Speed: {Math.round(bus.speed)} km/h</small>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {children}
    </MapContainer>
  );
}
