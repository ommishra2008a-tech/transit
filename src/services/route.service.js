import sol from '../lib/solarch';

const MOCK_ROUTES = [
  {
    id: 'route_001',
    route_name: 'IPS Academy → Rajwada',
    start_location: 'IPS Academy',
    end_location: 'Rajwada',
    status: 'ACTIVE',
  },
  {
    id: 'route_002',
    route_name: 'Rau → Palasia',
    start_location: 'Rau',
    end_location: 'Palasia',
    status: 'ACTIVE',
  }
];

const MOCK_STOPS = {
  route_001: [
    { id: 'stop_101', route_id: 'route_001', stop_name: 'IPS Academy', latitude: 22.6841, longitude: 75.8304, stop_order: 1 },
    { id: 'stop_102', route_id: 'route_001', stop_name: 'Rajendra Nagar', latitude: 22.6950, longitude: 75.8380, stop_order: 2 },
    { id: 'stop_103', route_id: 'route_001', stop_name: 'Bhawarkua', latitude: 22.6995, longitude: 75.8670, stop_order: 3 },
    { id: 'stop_104', route_id: 'route_001', stop_name: 'Collectorate', latitude: 22.7150, longitude: 75.8550, stop_order: 4 },
    { id: 'stop_105', route_id: 'route_001', stop_name: 'Rajwada', latitude: 22.7196, longitude: 75.8577, stop_order: 5 },
  ],
  route_002: [
    { id: 'stop_201', route_id: 'route_002', stop_name: 'Rau', latitude: 22.6322, longitude: 75.8078, stop_order: 1 },
    { id: 'stop_202', route_id: 'route_002', stop_name: 'Rajendra Nagar', latitude: 22.6950, longitude: 75.8380, stop_order: 2 },
    { id: 'stop_203', route_id: 'route_002', stop_name: 'Navlakha', latitude: 22.7050, longitude: 75.8750, stop_order: 3 },
    { id: 'stop_204', route_id: 'route_002', stop_name: 'Palasia', latitude: 22.7244, longitude: 75.8839, stop_order: 4 },
  ]
};

export async function getRoutes() {
  try {
    const list = await sol.collection('routes').getFullList({ sort: 'route_name' });
    if (list && list.length > 0) return list;
  } catch (e) {
    console.warn('Solarch getRoutes fallback:', e.message);
  }
  return MOCK_ROUTES;
}

export async function getRouteById(id) {
  try {
    const r = await sol.collection('routes').getOne(id);
    if (r) return r;
  } catch (e) {
    console.warn('Solarch getRouteById fallback:', e.message);
  }
  return MOCK_ROUTES.find((r) => r.id === id) || MOCK_ROUTES[0];
}

export async function getStopsByRoute(routeId) {
  try {
    const stops = await sol.collection('stops').getFullList({
      filter: sol.filter('route_id = {:routeId}', { routeId }),
      sort: 'stop_order',
    });
    if (stops && stops.length > 0) return stops;
  } catch (e) {
    console.warn('Solarch getStopsByRoute fallback:', e.message);
  }
  return MOCK_STOPS[routeId] || MOCK_STOPS.route_001;
}

export async function createRoute(data) {
  try {
    return await sol.collection('routes').create(data);
  } catch (e) {
    const r = { id: `route_${Date.now()}`, ...data };
    MOCK_ROUTES.push(r);
    return r;
  }
}

export async function updateRoute(id, data) {
  try {
    return await sol.collection('routes').update(id, data);
  } catch (e) {
    const r = MOCK_ROUTES.find((item) => item.id === id);
    if (r) Object.assign(r, data);
    return r;
  }
}

export async function deleteRoute(id) {
  try {
    return await sol.collection('routes').delete(id);
  } catch (e) {
    const idx = MOCK_ROUTES.findIndex((item) => item.id === id);
    if (idx !== -1) MOCK_ROUTES.splice(idx, 1);
    return true;
  }
}

export async function createStop(data) {
  try {
    return await sol.collection('stops').create(data);
  } catch (e) {
    const s = { id: `stop_${Date.now()}`, ...data };
    if (!MOCK_STOPS[data.route_id]) MOCK_STOPS[data.route_id] = [];
    MOCK_STOPS[data.route_id].push(s);
    return s;
  }
}

export async function updateStop(id, data) {
  try {
    return await sol.collection('stops').update(id, data);
  } catch (e) {
    return data;
  }
}

export async function deleteStop(id) {
  try {
    return await sol.collection('stops').delete(id);
  } catch (e) {
    return true;
  }
}
