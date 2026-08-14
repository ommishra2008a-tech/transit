import sol from '../lib/solarch';

export async function getRoutes() {
  try {
    const list = await sol.collection('routes').getFullList({ sort: 'route_name' });
    return list || [];
  } catch (e) {
    console.error('Solarch getRoutes error:', e.message);
    throw e;
  }
}

export async function getRouteById(id) {
  try {
    return await sol.collection('routes').getOne(id);
  } catch (e) {
    console.error('Solarch getRouteById error:', e.message);
    throw e;
  }
}

export async function getStopsByRoute(routeId) {
  try {
    const stops = await sol.collection('stops').getFullList({
      filter: sol.filter('route_id = {:routeId}', { routeId }),
      sort: 'stop_order',
    });
    return stops || [];
  } catch (e) {
    console.error('Solarch getStopsByRoute error:', e.message);
    return [];
  }
}

export async function createRoute(data) {
  try {
    return await sol.collection('routes').create(data);
  } catch (e) {
    console.error('Solarch createRoute error:', e.message);
    throw e;
  }
}

export async function updateRoute(id, data) {
  try {
    return await sol.collection('routes').update(id, data);
  } catch (e) {
    console.error('Solarch updateRoute error:', e.message);
    throw e;
  }
}

export async function deleteRoute(id) {
  try {
    return await sol.collection('routes').delete(id);
  } catch (e) {
    console.error('Solarch deleteRoute error:', e.message);
    throw e;
  }
}

export async function createStop(data) {
  try {
    return await sol.collection('stops').create(data);
  } catch (e) {
    console.error('Solarch createStop error:', e.message);
    throw e;
  }
}

export async function updateStop(id, data) {
  try {
    return await sol.collection('stops').update(id, data);
  } catch (e) {
    console.error('Solarch updateStop error:', e.message);
    throw e;
  }
}

export async function deleteStop(id) {
  try {
    return await sol.collection('stops').delete(id);
  } catch (e) {
    console.error('Solarch deleteStop error:', e.message);
    throw e;
  }
}
