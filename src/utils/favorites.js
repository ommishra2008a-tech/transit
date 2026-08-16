// Centralized Favorites and Saved Places Manager with reactive event dispatching

const FAVORITE_PLACES_KEY = 'smarttransit_favorite_places';
const FAVORITE_ROUTES_KEY = 'smarttransit_favorite_routes';

// Favorite Places (Saved Pins / Map Locations)
export const getFavoritePlaces = () => {
  try {
    const raw = localStorage.getItem(FAVORITE_PLACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse favorite places:', e);
    return [];
  }
};

export const saveFavoritePlace = (place) => {
  if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') return null;
  try {
    const current = getFavoritePlaces();
    const id = place.id || `place_${Date.now()}`;
    const newPlace = {
      id,
      name: place.name || `Saved Location (${place.lat.toFixed(3)}, ${place.lng.toFixed(3)})`,
      lat: place.lat,
      lng: place.lng,
      timestamp: new Date().toISOString()
    };
    
    // Avoid duplicate coordinates within ~20 meters
    const exists = current.some(p => 
      p.id === id || 
      (Math.abs(p.lat - place.lat) < 0.0002 && Math.abs(p.lng - place.lng) < 0.0002)
    );

    if (!exists) {
      const updated = [newPlace, ...current];
      localStorage.setItem(FAVORITE_PLACES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('smarttransit_favorites_updated'));
      return newPlace;
    }
    return null;
  } catch (e) {
    console.error('Failed to save favorite place:', e);
    return null;
  }
};

export const removeFavoritePlace = (idOrCoords) => {
  if (!idOrCoords) return;
  try {
    const current = getFavoritePlaces();
    let updated = [];
    if (typeof idOrCoords === 'string') {
      updated = current.filter(p => p.id !== idOrCoords);
    } else if (typeof idOrCoords === 'object') {
      const targetId = idOrCoords.id;
      const targetLat = idOrCoords.lat;
      const targetLng = idOrCoords.lng;
      updated = current.filter(p => {
        if (targetId && p.id === targetId) return false;
        if (typeof targetLat === 'number' && typeof targetLng === 'number') {
          if (Math.abs(p.lat - targetLat) < 0.0002 && Math.abs(p.lng - targetLng) < 0.0002) return false;
        }
        return true;
      });
    }
    localStorage.setItem(FAVORITE_PLACES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('smarttransit_favorites_updated'));
  } catch (e) {
    console.error('Failed to remove favorite place:', e);
  }
};

export const isPlaceFavorite = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  const current = getFavoritePlaces();
  return current.some(p => Math.abs(p.lat - lat) < 0.0002 && Math.abs(p.lng - lng) < 0.0002);
};

// Favorite Routes / Buses
export const getFavoriteRoutes = () => {
  try {
    const raw = localStorage.getItem(FAVORITE_ROUTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse favorite routes:', e);
    return [];
  }
};

export const saveFavoriteRoute = (routeOrBus) => {
  if (!routeOrBus) return null;
  try {
    const current = getFavoriteRoutes();
    const id = routeOrBus.$id || routeOrBus.id || routeOrBus.bus_number;
    const busNum = routeOrBus.bus_number;
    
    // Check if already favorited by any identifier
    const exists = current.some(r => 
      (id && (r.$id === id || r.id === id || r.bus_number === id)) ||
      (busNum && r.bus_number === busNum)
    );
    
    if (!exists) {
      const newRoute = {
        id: id || `route_${Date.now()}`,
        $id: id || `route_${Date.now()}`,
        bus_number: routeOrBus.bus_number || 'BUS-001',
        route_id: routeOrBus.route_id || 'Route 101',
        timestamp: new Date().toISOString()
      };
      const updated = [newRoute, ...current];
      localStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('smarttransit_favorites_updated'));
      return newRoute;
    }
    return null;
  } catch (e) {
    console.error('Failed to save favorite route:', e);
    return null;
  }
};

export const removeFavoriteRoute = (id) => {
  if (!id) return;
  try {
    const current = getFavoriteRoutes();
    const updated = current.filter(r => 
      r.$id !== id && 
      r.id !== id && 
      r.bus_number !== id && 
      r.route_id !== id
    );
    localStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('smarttransit_favorites_updated'));
  } catch (e) {
    console.error('Failed to remove favorite route:', e);
  }
};

export const isRouteFavorite = (id) => {
  if (!id) return false;
  const current = getFavoriteRoutes();
  return current.some(r => 
    r.$id === id || 
    r.id === id || 
    r.bus_number === id || 
    r.route_id === id
  );
};
