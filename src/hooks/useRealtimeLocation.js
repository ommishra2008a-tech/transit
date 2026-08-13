import { useState, useEffect, useRef } from 'react';
import { subscribeToLocation, getLiveLocation } from '../services/location.service';

/**
 * Realtime location hook — subscribes to Solarch realtime on live_locations
 */
export function useRealtimeLocation(busId) {
  const [location, setLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!busId) return;

    let mounted = true;

    // Fetch initial location
    getLiveLocation(busId).then((loc) => {
      if (mounted && loc) {
        setLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          speed: loc.speed,
          timestamp: loc.timestamp,
        });
        setLastUpdate(new Date(loc.timestamp));
      }
    }).catch(() => {});

    // Subscribe to realtime updates
    subscribeToLocation(busId, (e) => {
      if (!mounted) return;
      if (e.action === 'create' || e.action === 'update') {
        const rec = e.record;
        setLocation({
          latitude: rec.latitude,
          longitude: rec.longitude,
          speed: rec.speed,
          timestamp: rec.timestamp,
        });
        setLastUpdate(new Date());
        setIsConnected(true);
      }
    }).then((unsub) => {
      unsubRef.current = unsub;
      if (mounted) setIsConnected(true);
    }).catch(() => {
      if (mounted) setIsConnected(false);
    });

    return () => {
      mounted = false;
      if (unsubRef.current) unsubRef.current();
    };
  }, [busId]);

  // Stale detection: if no update in 60s
  const isStale = lastUpdate ? (Date.now() - lastUpdate.getTime() > 60000) : false;

  return { location, isConnected, lastUpdate, isStale };
}
