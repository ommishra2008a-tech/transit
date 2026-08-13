import {
  Solarch,
  Collection,
  TextField,
  SelectField,
  RelationField,
  NumberField,
  DateField
} from 'solarch';

if (!process.env.SOLARCH_JWT_SECRET) {
  process.env.SOLARCH_JWT_SECRET = 'smart-transit-super-secret-jwt-key-2026-sih25013';
}

const app = new Solarch({
  defaultDev: true,
  defaultDataDir: './sol_data',
});

// Auto-schema & auto-seed on bootstrap
app.onBootstrap.bindFunc(async (e) => {
  console.log('⚡ Solarch Bootstrapping collections & schema...');

  const appInstance = e.app;

  // Helper to ensure collection exists
  async function ensureCollection(colModel) {
    try {
      const existing = await appInstance.findCollectionByNameOrId(colModel.name);
      if (!existing) {
        await appInstance.saveCollection(colModel);
        console.log(`  + Created collection: ${colModel.name}`);
      }
    } catch {
      try {
        await appInstance.saveCollection(colModel);
        console.log(`  + Created collection: ${colModel.name}`);
      } catch (err) {
        console.log(`  ✓ Collection ${colModel.name} initialized`);
      }
    }
  }

  // 1. users (Auth collection)
  await ensureCollection(new Collection({
    name: 'users',
    type: 'auth',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: 'id = @request.auth.id',
    deleteRule: null,
    fields: [
      new TextField({ name: 'name', required: false }),
      new TextField({ name: 'phone', required: false }),
      new SelectField({ name: 'role', values: ['PASSENGER', 'DRIVER', 'ADMIN'], required: true }),
    ]
  }));

  // 2. routes
  await ensureCollection(new Collection({
    name: 'routes',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "ADMIN"',
    updateRule: '@request.auth.role = "ADMIN"',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new TextField({ name: 'route_name', required: true }),
      new TextField({ name: 'start_location', required: true }),
      new TextField({ name: 'end_location', required: true }),
      new SelectField({ name: 'status', values: ['ACTIVE', 'INACTIVE'], required: true }),
    ]
  }));

  // 3. stops
  await ensureCollection(new Collection({
    name: 'stops',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "ADMIN"',
    updateRule: '@request.auth.role = "ADMIN"',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new RelationField({ name: 'route_id', collectionName: 'routes', required: true }),
      new TextField({ name: 'stop_name', required: true }),
      new NumberField({ name: 'latitude', required: true }),
      new NumberField({ name: 'longitude', required: true }),
      new NumberField({ name: 'stop_order', required: true }),
    ]
  }));

  // 4. buses
  await ensureCollection(new Collection({
    name: 'buses',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "ADMIN"',
    updateRule: '',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new TextField({ name: 'bus_number', required: true }),
      new TextField({ name: 'registration_number', required: true }),
      new RelationField({ name: 'driver_id', collectionName: 'users', required: false }),
      new RelationField({ name: 'route_id', collectionName: 'routes', required: false }),
      new SelectField({ name: 'status', values: ['ACTIVE', 'INACTIVE', 'RUNNING', 'OFFLINE'], required: true }),
    ]
  }));

  // 5. trips
  await ensureCollection(new Collection({
    name: 'trips',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new RelationField({ name: 'bus_id', collectionName: 'buses', required: true }),
      new RelationField({ name: 'driver_id', collectionName: 'users', required: true }),
      new RelationField({ name: 'route_id', collectionName: 'routes', required: true }),
      new DateField({ name: 'start_time', required: true }),
      new DateField({ name: 'end_time', required: false }),
      new SelectField({ name: 'status', values: ['SCHEDULED', 'RUNNING', 'COMPLETED'], required: true }),
    ]
  }));

  // 6. live_locations
  await ensureCollection(new Collection({
    name: 'live_locations',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new RelationField({ name: 'bus_id', collectionName: 'buses', required: true }),
      new RelationField({ name: 'trip_id', collectionName: 'trips', required: true }),
      new NumberField({ name: 'latitude', required: true }),
      new NumberField({ name: 'longitude', required: true }),
      new NumberField({ name: 'speed', required: false }),
      new DateField({ name: 'timestamp', required: true }),
    ]
  }));

  console.log('✅ Collections initialized!');
});

await app.start(8090);

console.log('✅ Solarch server running at http://127.0.0.1:8090');
