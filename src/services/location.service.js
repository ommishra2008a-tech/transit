import sol from '../lib/solarch';

const locationListeners = new Set();

export async function updateLocation(busId, tripId, latitude, longitude, speed) {
  // Validate geographic coordinate boundaries and speed
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
  const cleanSpeed = Math.max(0, Number(speed) || 0);

  const locRecord = {
    bus_id: busId,
    trip_id: tripId,
    latitude,
    longitude,
    speed: cleanSpeed,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to local listeners for immediate UI responsiveness
  locationListeners.forEach((cb) => cb({ action: 'create', record: locRecord }));

  try {
    return await sol.collection('live_locations').create(locRecord);
  } catch (e) {
    console.error('Solarch updateLocation error:', e.message);
    throw e;
  }
}

export async function getLiveLocation(busId) {
  try {
    const result = await sol.collection('live_locations').getFirstListItem(
      sol.filter('bus_id = {:busId}', { busId }),
      { sort: '-timestamp' }
    );
    return result || null;
  } catch (e) {
    console.error('Solarch getLiveLocation error:', e.message);
    return null;
  }
}

export async function getAllLiveLocations() {
  try {
    const list = await sol.collection('live_locations').getFullList({
      sort: '-timestamp',
      expand: 'bus_id,trip_id',
    });
    return list || [];
  } catch (e) {
    console.error('Solarch getAllLiveLocations error:', e.message);
    return [];
  }
}

export async function subscribeToLocation(busId, callback) {
  const listener = (event) => {
    if (event.record?.bus_id === busId) {
      callback(event);
    }
  };

  locationListeners.add(listener);

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
