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
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';

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
        // Force sync fields and rules
        existing.fields = colModel.fields;
        existing.updateRule = colModel.updateRule;
        existing.createRule = colModel.createRule;
        existing.listRule = colModel.listRule;
        await appInstance.save(existing);
        await createRecordTable(appInstance, existing);
        console.log(`  ✓ Collection & table ${colModel.name} synced`);
      }
    } catch (err) {
      console.log(`  ⚠ Collection ${colModel.name} initialized:`, err.message);
    }
  }

  // 1. users (Auth collection) - Prevent role self-escalation
  await ensureCollection(new Collection({
    name: 'users',
    type: 'auth',
    listRule: 'id = @request.auth.id',
    viewRule: 'id = @request.auth.id',
    createRule: null,
    updateRule: 'id = @request.auth.id',
    deleteRule: 'id = @request.auth.id',
    fields: [
      new TextField({ name: 'name', required: false }),
      new TextField({ name: 'phone', required: false }),
      new SelectField({ name: 'role', values: ['PASSENGER', 'DRIVER', 'ADMIN'], required: false }),
      new SelectField({ name: 'approval_status', values: ['PENDING', 'APPROVED'], required: false }),
      new SelectField({ name: 'admin_request', values: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], required: false }),
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
  } catch (err) { }

  await appInstance.reloadCachedCollections();
});

// Add bulletproof custom signup endpoint
app.onServe.bindFunc((e) => {
  // Middleware to protect user fields during PATCH
  e.router.patch('/api/collections/users/records/:id', express.json(), (req, res, next) => {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.SOLARCH_JWT_SECRET);
        if (decoded && decoded.role === 'ADMIN') {
          isAdmin = true;
        }
      } catch (err) {}
    }

    console.log("MIDDLEWARE HIT! isAdmin:", isAdmin);
    console.log("Original req.body:", req.body);
    if (!isAdmin && req.body) {
      delete req.body.role;
      delete req.body.approval_status;
      delete req.body.admin_request;
    }
    console.log("Modified req.body:", req.body);
    next();
  });

  e.router.post('/api/auth/signup', express.json(), async (req, res) => {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Prevent missing fields
      if (!data.email || !data.password || !data.passwordConfirm) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 400, message: "Email, password, and passwordConfirm are required." }));
      }
      if (data.password !== data.passwordConfirm) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 400, message: "Passwords do not match." }));
      }

      const adminReqStatus = data.admin_request === 'PENDING' ? 'PENDING' : 'NONE';

      // Create user securely via API
      const usersCol = await e.app.findCollectionByNameOrId('users');
      const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Check if email exists
      const existingUser = e.app.db().getDataDB().prepare(`SELECT id FROM _r_${usersCol.id} WHERE email = ? COLLATE NOCASE`).get(data.email);
      if (existingUser) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 400, message: "Email already exists." }));
      }

      // Hash password (solarch format)
      const passwordHash = bcrypt.hashSync(data.password, 12);

      const now = new Date().toISOString();

      e.app.db().getDataDB().prepare(`
        INSERT INTO _r_${usersCol.id} 
        (id, created, updated, collectionId, collectionName, email, passwordHash, verified, name, phone, role, approval_status, admin_request) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId, now, now, usersCol.id, usersCol.name, data.email, passwordHash, 0, 
        data.name || '', data.phone || '', 'PASSENGER', 'APPROVED', adminReqStatus
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        code: 201,
        message: "User created successfully",
        record: {
          id: newId,
          email: data.email,
          role: 'PASSENGER',
          approval_status: 'APPROVED',
          admin_request: adminReqStatus
        }
      }));
    } catch (err) {
      console.error("Signup error:", err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 500, message: "Failed to create user." }));
    }
  });
});

// CORS configuration for SmartTransit frontend
app.onServe.bindFunc((e) => {
  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowedOrigins = new Set([
    'https://transit.ommishra2008a.workers.dev',
    'http://localhost:5173',
    'http://localhost:5174',
    ...envOrigins
  ]);

  e.router.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
    }

    // Handle browser CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  });

  // Dedicated server-side Admin approval endpoint
  e.router.post('/api/admin/requests/:id/approve', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 403, message: 'Forbidden. No token.' }));
      }
      
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SOLARCH_JWT_SECRET);
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 403, message: 'Forbidden. Invalid token.' }));
      }

      const db = e.app.db().getDataDB();
      const collection = await e.app.findCollectionByNameOrId('users');
      
      const requester = db.prepare(`SELECT role FROM _r_${collection.id} WHERE id = ?`).get(decoded.id);
      if (!requester || requester.role !== 'ADMIN') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 403, message: 'Forbidden. Admin privileges required.' }));
      }

      const targetId = req.params.id;
      
      const targetUser = db.prepare(`SELECT * FROM _r_${collection.id} WHERE id = ?`).get(targetId);
      if (!targetUser) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 404, message: 'User not found.' }));
      }

      if (targetUser.admin_request !== 'PENDING') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 400, message: `Target user does not have a pending admin request. It is: ${targetUser.admin_request}` }));
      }

      if (targetUser.role === 'ADMIN') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 400, message: 'User is already an Admin.' }));
      }

      const countRes = db.prepare(`SELECT COUNT(*) as cnt FROM _r_${collection.id} WHERE role = 'ADMIN'`).get();
      if (countRes && countRes.cnt >= 10) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 400, message: 'Maximum limit of 10 Admins reached.' }));
      }

      // Atomically perform role = ADMIN, admin_request = APPROVED
      const now = new Date().toISOString();
      db.prepare(`UPDATE _r_${collection.id} SET role = 'ADMIN', admin_request = 'APPROVED', updated = ? WHERE id = ?`).run(now, targetId);
      
      // Clear cache so changes reflect immediately
      await e.app.reloadCachedCollections();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 200, message: 'Admin request approved.' }));
    } catch (err) {
      console.error('Approval Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 500, message: 'Internal server error.' }));
    }
  });

  // Dedicated server-side Admin rejection endpoint
  e.router.post('/api/admin/requests/:id/reject', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 403, message: 'Forbidden. No token.' }));
      }
      
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SOLARCH_JWT_SECRET);
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 403, message: 'Forbidden. Invalid token.' }));
      }

      const db = e.app.db().getDataDB();
      const collection = await e.app.findCollectionByNameOrId('users');
      
      const requester = db.prepare(`SELECT role FROM _r_${collection.id} WHERE id = ?`).get(decoded.id);
      if (!requester || requester.role !== 'ADMIN') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 403, message: 'Forbidden. Admin privileges required.' }));
      }

      const targetId = req.params.id;
      
      const targetUser = db.prepare(`SELECT * FROM _r_${collection.id} WHERE id = ?`).get(targetId);
      if (!targetUser) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ code: 404, message: 'User not found.' }));
      }

      // Atomically perform admin_request = REJECTED
      const now = new Date().toISOString();
      db.prepare(`UPDATE _r_${collection.id} SET admin_request = 'REJECTED', updated = ? WHERE id = ?`).run(now, targetId);
      
      await e.app.reloadCachedCollections();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 200, message: 'Admin request rejected.' }));
    } catch (err) {
      console.error('Rejection Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 500, message: 'Internal server error.' }));
    }
  });

  // Root URL redirect GET / -> /_/ (Solarch Admin UI)
  e.router.get('/', (req, res) => {
    res.redirect(302, '/_/');
  });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8090;
await app.start(port);

console.log(`✅ Solarch server running at http://127.0.0.1:${port}`);

app.onModelUpdateExecute.bindFunc(async (e) => {
  const model = e.model;
  if (!model) return;
  
  let tableName = '';
  try { tableName = model.tableName(); } catch (err) {}
  if (!tableName) return;

  const usersCol = await e.app.findCollectionByNameOrId('users');
  if (usersCol && tableName === `_r_${usersCol.id}`) {
    let isAdmin = false;
    if (e.httpContext) {
      const authRecord = e.httpContext.get('authRecord');
      if (authRecord && authRecord.get('role') === 'ADMIN') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      const db = e.app.db().getDataDB();
      const id = model.id || (typeof model.get === 'function' ? model.get('id') : null);
      if (id) {
        const orig = db.prepare(`SELECT role, approval_status, admin_request FROM _r_${usersCol.id} WHERE id = ?`).get(id);
        if (orig) {
          const newRole = model.role || (typeof model.get === 'function' ? model.get('role') : null);
          const newApproval = model.approval_status || (typeof model.get === 'function' ? model.get('approval_status') : null);
          const newAdminReq = model.admin_request || (typeof model.get === 'function' ? model.get('admin_request') : null);

          // If they are attempting to change any protected field, revert it
          if (typeof model.set === 'function') {
            model.set('role', orig.role);
            model.set('approval_status', orig.approval_status);
            model.set('admin_request', orig.admin_request);
          } else {
             // fallback to direct object property setting
             model.role = orig.role;
             model.approval_status = orig.approval_status;
             model.admin_request = orig.admin_request;
          }
        }
      }
    } else {
       // if admin, allow. But check limit of 10
       const db = e.app.db().getDataDB();
       const id = model.id || (typeof model.get === 'function' ? model.get('id') : null);
       const newRole = model.role || (typeof model.get === 'function' ? model.get('role') : null);
       if (id && newRole === 'ADMIN') {
           const orig = db.prepare(`SELECT role FROM _r_${usersCol.id} WHERE id = ?`).get(id);
           if (orig && orig.role !== 'ADMIN') {
               const result = db.prepare(`SELECT COUNT(*) as cnt FROM _r_${usersCol.id} WHERE role = 'ADMIN'`).get();
               if (result && result.cnt >= 10) {
                   throw new Error("Maximum limit of 10 Admins reached.");
               }
           }
       }
    }
  }
});

