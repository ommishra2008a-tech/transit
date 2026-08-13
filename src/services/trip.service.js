import sol from '../lib/solarch';
import { updateBusStatus } from './bus.service';

const activeTripsState = new Map();

export async function startTrip(busId, driverId, routeId) {
  const tripData = {
    id: `trip_${Date.now()}`,
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
    console.warn('Solarch startTrip fallback:', e.message);
    activeTripsState.set(driverId, tripData);
    await updateBusStatus(busId, 'RUNNING');
    return tripData;
  }
}

export async function getActiveTrip(driverId) {
  try {
    const trip = await sol.collection('trips').getFirstListItem(
      sol.filter('driver_id = {:driverId} && status = "RUNNING"', { driverId }),
      { expand: 'bus_id,route_id' }
    );
    if (trip) return trip;
  } catch (e) {
    console.warn('Solarch getActiveTrip fallback:', e.message);
  }
  return activeTripsState.get(driverId) || null;
}

export async function endTrip(tripId, busId) {
  try {
    const trip = await sol.collection('trips').update(tripId, {
      end_time: new Date().toISOString(),
      status: 'COMPLETED',
    });
    await updateBusStatus(busId, 'ACTIVE');
    return trip;
  } catch (e) {
    console.warn('Solarch endTrip fallback:', e.message);
    const trip = {
      id: tripId,
      end_time: new Date().toISOString(),
      status: 'COMPLETED',
    };
    await updateBusStatus(busId, 'ACTIVE');
    return trip;
  }
}

export async function getActiveTrips() {
  try {
    const trips = await sol.collection('trips').getFullList({
      filter: 'status = "RUNNING"',
      expand: 'bus_id,driver_id,route_id',
      sort: '-start_time',
    });
    if (trips && trips.length > 0) return trips;
  } catch (e) {
    console.warn('Solarch getActiveTrips fallback:', e.message);
  }
  return Array.from(activeTripsState.values()).filter((t) => t.status === 'RUNNING');
}

export async function getAllTrips() {
  try {
    return await sol.collection('trips').getFullList({
      expand: 'bus_id,driver_id,route_id',
      sort: '-start_time',
    });
  } catch (e) {
    return Array.from(activeTripsState.values());
  }
}
