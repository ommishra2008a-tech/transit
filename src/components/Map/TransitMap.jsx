import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const busIcon = new L.DivIcon({
  className: 'bus-marker-div',
  html: `<div style="position: relative; width: 44px; height: 44px; display: flex; items-center; justify-content: center;">
    <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: pulse-ring 2s ease-in-out infinite;"></div>
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid #ffffff; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45); z-index: 10;">🚌</div>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

export const stopIcon = new L.DivIcon({
  className: 'stop-marker-div',
  html: `<div style="background: #ffffff; border: 3.5px solid #2563eb; width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
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
      style={{ height, width: '100%', borderRadius: '1.25rem' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {fitBounds && <FitBounds bounds={fitBounds} />}

      {routeLine.length >= 2 && (
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: '#2563eb',
            weight: 5,
            opacity: 0.85,
            dashArray: '8 8',
          }}
        />
      )}

      {stopMarkers.map((stop) => (
        <Marker key={stop.id || stop.stop_name} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
          <Popup>
            <div style={{ padding: '2px' }}>
              <strong style={{ fontSize: '13px', fontWeight: '800' }}>{stop.stop_name}</strong>
              <br />
              <small style={{ color: '#64748b', fontSize: '11px' }}>Station Stop #{stop.stop_order}</small>
            </div>
          </Popup>
        </Marker>
      ))}

      {busMarkers.map((bus) => (
        <Marker key={bus.id} position={[bus.latitude, bus.longitude]} icon={busIcon}>
          <Popup>
            <div style={{ padding: '2px' }}>
              <strong style={{ fontSize: '14px', color: '#2563eb', fontWeight: '800' }}>{bus.label || 'Bus'}</strong>
              {bus.speed !== undefined && (
                <>
                  <br />
                  <small style={{ color: '#475569', fontSize: '11px', fontWeight: '600' }}>
                    Live Speed: {Math.round(bus.speed)} km/h
                  </small>
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
