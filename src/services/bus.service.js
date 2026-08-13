import sol from '../lib/solarch';

const MOCK_BUSES = [
  {
    id: 'bus_101',
    bus_number: 'BUS-101',
    registration_number: 'MP-09-AB-1234',
    driver_id: 'usr_driver',
    route_id: 'route_001',
    status: 'ACTIVE',
    expand: {
      route_id: {
        id: 'route_001',
        route_name: 'IPS Academy → Rajwada',
        start_location: 'IPS Academy',
        end_location: 'Rajwada',
        status: 'ACTIVE',
      },
      driver_id: {
        id: 'usr_driver',
        name: 'Rahul Sharma',
        role: 'DRIVER',
      }
    }
  },
  {
    id: 'bus_102',
    bus_number: 'BUS-102',
    registration_number: 'MP-09-CD-5678',
    driver_id: null,
    route_id: 'route_002',
    status: 'OFFLINE',
    expand: {
      route_id: {
        id: 'route_002',
        route_name: 'Rau → Palasia',
        start_location: 'Rau',
        end_location: 'Palasia',
        status: 'ACTIVE',
      }
    }
  }
];

export async function getBuses() {
  try {
    const list = await sol.collection('buses').getFullList({
      sort: 'bus_number',
      expand: 'route_id,driver_id',
    });
    if (list && list.length > 0) return list;
  } catch (e) {
    console.warn('Solarch getBuses fallback:', e.message);
  }
  return MOCK_BUSES;
}

export async function getBusById(id) {
  try {
    const b = await sol.collection('buses').getOne(id, {
      expand: 'route_id,driver_id',
    });
    if (b) return b;
  } catch (e) {
    console.warn('Solarch getBusById fallback:', e.message);
  }
  return MOCK_BUSES.find((b) => b.id === id) || MOCK_BUSES[0];
}

export async function getAssignedBus(driverId) {
  try {
    const result = await sol.collection('buses').getFirstListItem(
      sol.filter('driver_id = {:driverId}', { driverId }),
      { expand: 'route_id,driver_id' }
    );
    if (result) return result;
  } catch (e) {
    console.warn('Solarch getAssignedBus fallback:', e.message);
  }
  return MOCK_BUSES[0];
}

export async function updateBusStatus(busId, status) {
  try {
    return await sol.collection('buses').update(busId, { status });
  } catch (e) {
    const target = MOCK_BUSES.find((b) => b.id === busId);
    if (target) target.status = status;
    return target;
  }
}

export async function createBus(data) {
  try {
    return await sol.collection('buses').create(data);
  } catch (e) {
    const newBus = { id: `bus_${Date.now()}`, ...data };
    MOCK_BUSES.push(newBus);
    return newBus;
  }
}

export async function updateBus(id, data) {
  try {
    return await sol.collection('buses').update(id, data);
  } catch (e) {
    const target = MOCK_BUSES.find((b) => b.id === id);
    if (target) Object.assign(target, data);
    return target;
  }
}

export async function deleteBus(id) {
  try {
    return await sol.collection('buses').delete(id);
  } catch (e) {
    const idx = MOCK_BUSES.findIndex((b) => b.id === id);
    if (idx !== -1) MOCK_BUSES.splice(idx, 1);
    return true;
  }
}
