import sol from '../lib/solarch';

const locationListeners = new Set();

export async function updateLocation(busId, tripId, latitude, longitude, speed) {
  const locRecord = {
    bus_id: busId,
    trip_id: tripId,
    latitude,
    longitude,
    speed: speed || 0,
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
