import sol from '../lib/solarch';
import { updateBusStatus } from './bus.service';

export async function startTrip(busId, driverId, routeId) {
  const tripData = {
    bus_id: busId,
    driver_id: driverId,
    route_id: routeId,
    start_time: new Date().toISOString(),
    status: 'RUNNING',
  };

  try {
    const trip = await sol.collection('trips').create(tripData);
    await updateBusStatus(busId, 'RUNNING');
    return trip;
  } catch (e) {
    console.error('Solarch startTrip error:', e.message);
    throw e;
  }
}

export async function getActiveTrip(driverId) {
  try {
    const trip = await sol.collection('trips').getFirstListItem(
      sol.filter('driver_id = {:driverId} && status = "RUNNING"', { driverId }),
      { expand: 'bus_id,route_id' }
    );
    return trip || null;
  } catch (e) {
    console.error('Solarch getActiveTrip error:', e.message);
    return null;
  }
}

export async function endTrip(tripId, busId) {
  try {
    const existing = await sol.collection('trips').getOne(tripId).catch(() => null);
    const updateData = {
      ...(existing ? {
        bus_id: existing.bus_id,
        driver_id: existing.driver_id,
        route_id: existing.route_id,
        start_time: existing.start_time,
      } : {}),
      end_time: new Date().toISOString(),
      status: 'COMPLETED',
    };
    const trip = await sol.collection('trips').update(tripId, updateData);
    await updateBusStatus(busId, 'ACTIVE');
    return trip;
  } catch (e) {
    console.error('Solarch endTrip error:', e.message);
    throw e;
  }
}

export async function getActiveTrips() {
  try {
    const trips = await sol.collection('trips').getFullList({
      filter: 'status = "RUNNING"',
      expand: 'bus_id,driver_id,route_id',
      sort: '-start_time',
    });
    return trips || [];
  } catch (e) {
    console.error('Solarch getActiveTrips error:', e.message);
    return [];
  }
}

export async function getAllTrips() {
  try {
    const trips = await sol.collection('trips').getFullList({
      expand: 'bus_id,driver_id,route_id',
      sort: '-start_time',
    });
    return trips || [];
  } catch (e) {
    console.error('Solarch getAllTrips error:', e.message);
    return [];
  }
}
