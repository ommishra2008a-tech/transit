import sol from '../lib/solarch';

export async function getBuses() {
  try {
    const list = await sol.collection('buses').getFullList({
      sort: 'bus_number',
      expand: 'route_id,driver_id',
    });
    return list || [];
  } catch (e) {
    console.error('Solarch getBuses error:', e.message);
    throw e;
  }
}

export async function getBusById(id) {
  try {
    return await sol.collection('buses').getOne(id, {
      expand: 'route_id,driver_id',
    });
  } catch (e) {
    console.error('Solarch getBusById error:', e.message);
    throw e;
  }
}

export async function getAssignedBus(driverId) {
  try {
    return await sol.collection('buses').getFirstListItem(
      sol.filter('driver_id = {:driverId}', { driverId }),
      { expand: 'route_id,driver_id' }
    );
  } catch (e) {
    console.error('Solarch getAssignedBus error:', e.message);
    return null;
  }
}

export async function updateBusStatus(busId, status) {
  try {
    return await sol.collection('buses').update(busId, { status });
  } catch (e) {
    console.error('Solarch updateBusStatus error:', e.message);
    throw e;
  }
}

export async function createBus(data) {
  try {
    return await sol.collection('buses').create(data);
  } catch (e) {
    console.error('Solarch createBus error:', e.message);
    throw e;
  }
}

export async function updateBus(id, data) {
  try {
    return await sol.collection('buses').update(id, data);
  } catch (e) {
    console.error('Solarch updateBus error:', e.message);
    throw e;
  }
}

export async function deleteBus(id) {
  try {
    return await sol.collection('buses').delete(id);
  } catch (e) {
    console.error('Solarch deleteBus error:', e.message);
    throw e;
  }
}
