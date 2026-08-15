import { BaseApp } from 'solarch/dist/core/base.js';
import { hasSuperuser } from 'solarch/dist/cmd/superuser.js';
import { hashPassword } from 'solarch/dist/tools/security/crypto.js';
import { randomBytes } from 'crypto';

async function init() {
  const email = process.env.SOLARCH_SUPERUSER_EMAIL;
  const password = process.env.SOLARCH_SUPERUSER_PASSWORD;
  
  if (!email || !password) {
    console.error('FATAL: Missing SOLARCH_SUPERUSER_EMAIL or SOLARCH_SUPERUSER_PASSWORD environment variables.');
    process.exit(1);
  }

  if (!process.env.SOLARCH_JWT_SECRET) {
    console.error('FATAL: Missing SOLARCH_JWT_SECRET environment variable.');
    process.exit(1);
  }

  try {
    const app = new BaseApp({
      isDev: false,
      dataDir: './sol_data',
    });
    
    // Bootstrap parses config and mounts DB
    await app.bootstrap();
    
    // Check if superuser exists using solarch's built in check
    if (hasSuperuser(app)) {
      console.log('Superuser already exists. Skipping initialization.');
      process.exit(0);
    }
    
    console.log('No superuser found. Creating superuser...');
    
    const db = app.db().getDataDB();
    db.exec(`
      CREATE TABLE IF NOT EXISTS _superusers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        created TEXT NOT NULL,
        updated TEXT NOT NULL
      )
    `);
    
    const passwordHash = await hashPassword(password);
    const id = `su_${randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();
    
    db.prepare(`INSERT INTO _superusers (id, email, passwordHash, created, updated) VALUES (?, ?, ?, ?, ?)`).run(id, email, passwordHash, now, now);
    console.log(`Superuser created successfully via Render init script.`);
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
  }
}

init();
