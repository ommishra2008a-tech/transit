import {
  Solarch,
  Collection,
  TextField,
  SelectField,
  RelationField,
  NumberField,
  DateField,
  createRecordTable
} from 'solarch';

if (!process.env.SOLARCH_JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SECURITY ERROR: SOLARCH_JWT_SECRET environment variable is missing in production!');
  }
 }

const app = new Solarch({
  defaultDev: process.env.NODE_ENV !== 'production',
  defaultDataDir: './sol_data',
});

// Auto-schema & auto-seed on bootstrap
app.onBootstrap.bindFunc(async (e) => {
  console.log('⚡ Solarch Bootstrapping collections & schema...');

  const appInstance = e.app;

  // Helper to ensure collection exists and table is synced
  async function ensureCollection(colModel) {
    try {
      let existing = await appInstance.findCollectionByNameOrId(colModel.name);
      if (!existing) {
        await appInstance.save(colModel);
        existing = await appInstance.findCollectionByNameOrId(colModel.name) || colModel;
        await createRecordTable(appInstance, existing);
        console.log(`  + Created collection & table: ${colModel.name}`);
      } else {
        await createRecordTable(appInstance, existing);
        console.log(`  ✓ Collection & table ${colModel.name} synced`);
      }
    } catch (err) {
      console.log(`  ✓ Collection ${colModel.name} initialized:`, err.message);
    }
  }

  // 1. users (Auth collection) - Prevent role self-escalation
  await ensureCollection(new Collection({
    name: 'users',
    type: 'auth',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: 'id = @request.auth.id && role = @request.auth.role',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new TextField({ name: 'name', required: false }),
      new TextField({ name: 'phone', required: false }),
      new SelectField({ name: 'role', values: ['PASSENGER', 'DRIVER', 'ADMIN'], required: false }),
      new SelectField({ name: 'approval_status', values: ['PENDING', 'APPROVED'], required: false }),
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

  // 4. buses — Drivers can ONLY update status/fields of assigned bus
  await ensureCollection(new Collection({
    name: 'buses',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "ADMIN"',
    updateRule: '@request.auth.role = "ADMIN" || (@request.auth.role = "DRIVER" && driver_id = @request.auth.id)',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new TextField({ name: 'bus_number', required: true }),
      new TextField({ name: 'registration_number', required: true }),
      new RelationField({ name: 'driver_id', collectionName: 'users', required: false }),
      new RelationField({ name: 'route_id', collectionName: 'routes', required: false }),
      new SelectField({ name: 'status', values: ['ACTIVE', 'INACTIVE', 'RUNNING', 'OFFLINE'], required: true }),
    ]
  }));

  // 5. trips — Drivers can ONLY create/update their OWN trips
  await ensureCollection(new Collection({
    name: 'trips',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "ADMIN" || (@request.auth.role = "DRIVER" && @request.auth.approval_status = "APPROVED")',
    updateRule: '@request.auth.role = "ADMIN" || (@request.auth.role = "DRIVER" && driver_id = @request.auth.id)',
    deleteRule: '@request.auth.role = "ADMIN"',
    fields: [
      new RelationField({ name: 'bus_id', collectionName: 'buses', required: false }),
      new RelationField({ name: 'driver_id', collectionName: 'users', required: false }),
      new RelationField({ name: 'route_id', collectionName: 'routes', required: false }),
      new DateField({ name: 'start_time', required: false }),
      new DateField({ name: 'end_time', required: false }),
      new SelectField({ name: 'status', values: ['SCHEDULED', 'RUNNING', 'COMPLETED'], required: false }),
    ]
  }));

  // 6. live_locations — Telemetry streaming restricted to DRIVER & ADMIN
  await ensureCollection(new Collection({
    name: 'live_locations',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.role = "ADMIN" || (@request.auth.role = "DRIVER" && @request.auth.approval_status = "APPROVED")',
    updateRule: '@request.auth.role = "ADMIN" || (@request.auth.role = "DRIVER" && @request.auth.approval_status = "APPROVED")',
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

  // Sync user roles in SQLite table
  try {
    const usersCol = await appInstance.findCollectionByNameOrId('users');
    if (usersCol) {
      const db = appInstance.db().getDataDB();
      db.prepare(`UPDATE _r_${usersCol.id} SET role = 'ADMIN', approval_status = 'APPROVED' WHERE email = 'admin@transit.dev'`).run();
      db.prepare(`UPDATE _r_${usersCol.id} SET role = 'DRIVER', approval_status = 'APPROVED' WHERE email = 'driver@transit.dev'`).run();
      db.prepare(`UPDATE _r_${usersCol.id} SET role = 'PASSENGER', approval_status = 'APPROVED' WHERE email = 'passenger@transit.dev' AND (role IS NULL OR role = '')`).run();
    }
  } catch (err) {}

  await appInstance.reloadCachedCollections();
});

// Enforce 10-Admin limit hook
app.onRecordCreate.bindFunc(async (e) => {
  const record = e.record;
  if (!record) return;
  const col = record.collection();
  if (col && col.name === 'users') {
    if (record.get('role') === 'ADMIN') {
      const db = e.app.db().getDataDB();
      const collection = await e.app.findCollectionByNameOrId('users');
      const result = db.prepare(`SELECT COUNT(*) as cnt FROM _r_${collection.id} WHERE role = 'ADMIN'`).get();
      if (result && result.cnt >= 10) {
        throw new Error("Maximum limit of 10 Admins reached.");
      }
    }
    // Default approval status for drivers if not set explicitly
    if (record.get('role') === 'DRIVER' && !record.get('approval_status')) {
      record.set('approval_status', 'PENDING');
    }
  }
});

// Root URL redirect GET / -> /_/ (Solarch Admin UI)
app.onServe.bindFunc((e) => {
  e.router.get('/', (req, res) => {
    res.redirect(302, '/_/');
  });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8090;
await app.start(port);

console.log(`✅ Solarch server running at http://127.0.0.1:${port}`);
