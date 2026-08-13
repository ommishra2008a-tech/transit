import { SolarchClient } from '../src/lib/solarch.js';

const sol = new SolarchClient('http://127.0.0.1:8090');

async function seed() {
  console.log('🌱 Starting Solarch seeding...');

  try {
    // 1. Users
    console.log('👤 Seeding users...');
    const usersToCreate = [
      { email: 'admin@transit.dev', password: '123456password', name: 'Admin User', role: 'ADMIN' },
      { email: 'driver@transit.dev', password: '123456password', name: 'Rahul Sharma (Driver)', role: 'DRIVER' },
      { email: 'passenger@transit.dev', password: '123456password', name: 'Priya Patel (Passenger)', role: 'PASSENGER' },
    ];

    const usersMap = {};

    for (const u of usersToCreate) {
      try {
        let user;
        try {
          user = await sol.collection('users').getFirstListItem(`email = "${u.email}"`);
          console.log(`  ✓ Existing user: ${u.email} (${user.id})`);
        } catch {
          user = await sol.collection('users').create(u);
          console.log(`  + Created user: ${u.email} (${user.id})`);
        }
        usersMap[u.role] = user;
      } catch (err) {
        console.warn(`  ! Note user ${u.email}:`, err.message);
      }
    }

    // 2. Routes
    console.log('🗺️ Seeding routes...');
    const routesToCreate = [
      { route_name: 'IPS Academy → Rajwada', start_location: 'IPS Academy', end_location: 'Rajwada', status: 'ACTIVE' },
      { route_name: 'Rau → Palasia', start_location: 'Rau', end_location: 'Palasia', status: 'ACTIVE' }
    ];

    const routesMap = {};
    for (const r of routesToCreate) {
      try {
        let route;
        try {
          route = await sol.collection('routes').getFirstListItem(`route_name = "${r.route_name}"`);
          console.log(`  ✓ Existing route: ${r.route_name} (${route.id})`);
        } catch {
          route = await sol.collection('routes').create(r);
          console.log(`  + Created route: ${r.route_name} (${route.id})`);
        }
        routesMap[r.route_name] = route;
      } catch (err) {
        console.warn(`  ! Note route ${r.route_name}:`, err.message);
      }
    }

    // 3. Stops
    console.log('📍 Seeding stops...');
    const route1 = routesMap['IPS Academy → Rajwada'];
    const route2 = routesMap['Rau → Palasia'];

    if (route1) {
      const stopsR1 = [
        { stop_name: 'IPS Academy', latitude: 22.6841, longitude: 75.8304, stop_order: 1, route_id: route1.id },
        { stop_name: 'Rajendra Nagar', latitude: 22.6950, longitude: 75.8380, stop_order: 2, route_id: route1.id },
        { stop_name: 'Bhawarkua', latitude: 22.6995, longitude: 75.8670, stop_order: 3, route_id: route1.id },
        { stop_name: 'Collectorate', latitude: 22.7150, longitude: 75.8550, stop_order: 4, route_id: route1.id },
        { stop_name: 'Rajwada', latitude: 22.7196, longitude: 75.8577, stop_order: 5, route_id: route1.id },
      ];
      for (const s of stopsR1) {
        try {
          await sol.collection('stops').create(s);
          console.log(`  + Stop: ${s.stop_name} (#${s.stop_order})`);
        } catch {}
      }
    }

    if (route2) {
      const stopsR2 = [
        { stop_name: 'Rau', latitude: 22.6322, longitude: 75.8078, stop_order: 1, route_id: route2.id },
        { stop_name: 'Rajendra Nagar', latitude: 22.6950, longitude: 75.8380, stop_order: 2, route_id: route2.id },
        { stop_name: 'Navlakha', latitude: 22.7050, longitude: 75.8750, stop_order: 3, route_id: route2.id },
        { stop_name: 'Palasia', latitude: 22.7244, longitude: 75.8839, stop_order: 4, route_id: route2.id },
      ];
      for (const s of stopsR2) {
        try {
          await sol.collection('stops').create(s);
          console.log(`  + Stop: ${s.stop_name} (#${s.stop_order})`);
        } catch {}
      }
    }

    // 4. Buses
    console.log('🚌 Seeding buses...');
    const driver = usersMap['DRIVER'];
    if (route1) {
      try {
        const bus1 = {
          bus_number: 'BUS-101',
          registration_number: 'MP-09-AB-1234',
          driver_id: driver ? driver.id : null,
          route_id: route1.id,
          status: 'ACTIVE',
        };
        await sol.collection('buses').create(bus1);
        console.log('  + Created BUS-101');
      } catch {
        console.log('  ✓ BUS-101 exists');
      }
    }

    if (route2) {
      try {
        const bus2 = {
          bus_number: 'BUS-102',
          registration_number: 'MP-09-CD-5678',
          route_id: route2.id,
          status: 'OFFLINE',
        };
        await sol.collection('buses').create(bus2);
        console.log('  + Created BUS-102');
      } catch {
        console.log('  ✓ BUS-102 exists');
      }
    }

    console.log('✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
}

seed();
