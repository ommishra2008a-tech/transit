import sol from '../lib/solarch';

const localLocationsCache = new Map();
const locationListeners = new Set();

export async function updateLocation(busId, tripId, latitude, longitude, speed) {
  const locRecord = {
    id: `loc_${Date.now()}`,
    bus_id: busId,
    trip_id: tripId,
    latitude,
    longitude,
    speed: speed || 0,
    timestamp: new Date().toISOString(),
  };

  localLocationsCache.set(busId, locRecord);

  // Broadcast to local listeners (fallback for offline/realtime)
  locationListeners.forEach((cb) => cb({ action: 'create', record: locRecord }));

  try {
    return await sol.collection('live_locations').create(locRecord);
  } catch (e) {
    console.warn('Solarch updateLocation fallback:', e.message);
    return locRecord;
  }
}

export async function getLiveLocation(busId) {
  try {
    const result = await sol.collection('live_locations').getFirstListItem(
      sol.filter('bus_id = {:busId}', { busId }),
      { sort: '-timestamp' }
    );
    if (result) return result;
  } catch (e) {
    console.warn('Solarch getLiveLocation fallback:', e.message);
  }
  return localLocationsCache.get(busId) || null;
}

export async function getAllLiveLocations() {
  try {
    const list = await sol.collection('live_locations').getFullList({
      sort: '-timestamp',
      expand: 'bus_id,trip_id',
    });
    if (list && list.length > 0) return list;
  } catch (e) {
    console.warn('Solarch getAllLiveLocations fallback:', e.message);
  }
  return Array.from(localLocationsCache.values());
}

export async function subscribeToLocation(busId, callback) {
  const listener = (event) => {
    if (event.record?.bus_id === busId) {
      callback(event);
    }
  };

  locationListeners.add(listener);

  // Solarch SSE realtime subscription
  let unsubSolarch = null;
  try {
    unsubSolarch = await sol.collection('live_locations').subscribe('*', (e) => {
      if (e.record?.bus_id === busId) {
        callback(e);
      }
    });
  } catch (e) {
    console.warn('Solarch SSE subscribe error:', e.message);
  }

  return () => {
    locationListeners.delete(listener);
    if (typeof unsubSolarch === 'function') unsubSolarch();
  };
}

export async function subscribeToAllLocations(callback) {
  const listener = (event) => {
    callback(event);
  };

  locationListeners.add(listener);

  let unsubSolarch = null;
  try {
    unsubSolarch = await sol.collection('live_locations').subscribe('*', callback);
  } catch (e) {
    console.warn('Solarch SSE subscribe all error:', e.message);
  }

  return () => {
    locationListeners.delete(listener);
    if (typeof unsubSolarch === 'function') unsubSolarch();
  };
}

export async function unsubscribeFromLocations() {
  locationListeners.clear();
  try {
    await sol.collection('live_locations').unsubscribe();
  } catch (e) {}
}
