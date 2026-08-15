# SmartTransit Production Persistence & Render Disk Audit

---

## Executive Summary

This document details the exact persistence architecture of the SmartTransit Solarch 0.15.7 backend. It provides a complete forensic blueprint for adding a Render Persistent Disk when upgraded, without requiring architecture redesign or repeated codebase investigation.

**Current Persistence Status**: Deferment ready. The backend operates on an ephemeral local SQLite database (`./sol_data`) with full capability to seamlessly attach to a persistent block storage mount.

---

## 1. Current Database Location & Architecture

- **Database Engine**: Solarch 0.15.7 embedded database powered by `better-sqlite3`.
- **Journal Mode**: Write-Ahead Logging (`WAL` mode with `PRAGMA busy_timeout = 30000ms`, `foreign_keys = ON`).
- **Primary Data Directory**: `./sol_data` (located relative to the backend project root).
- **Core SQLite Database Files**:
  - `data.db` — Stores all collections, schema definitions, system settings, records (`users`, `routes`, `stops`, `trips`, `live_locations`, `_superusers`).
  - `data.db-wal` — SQLite Write-Ahead Log for concurrent transactional integrity.
  - `data.db-shm` — SQLite shared-memory index for WAL index tracking.
  - `auxiliary.db` — Solarch internal auxiliary state and log database.
  - `auxiliary.db-wal` / `auxiliary.db-shm` — Auxiliary WAL and shared-memory files.

---

## 2. File Storage & Blob Directory

- **File System Driver**: `LocalBlobDriver` in `node_modules/solarch/dist/tools/filesystem/filesystem.js`.
- **Uploads Path**: `./sol_data/storage`
- **File Storage Structure**:
  ```
  ./sol_data/storage/<collection_name>/<record_id>/<file_name>
  ```
- **Persistence Verification**: Uploaded media, attachments, and blobs are stored directly inside the `./sol_data` hierarchy. Mounting a persistent disk to `./sol_data` automatically preserves all database records **and** all user-uploaded files simultaneously.

---

## 3. Solarch Backup Engine & Capabilities

Solarch 0.15.7 includes an automated hot-backup system (`node_modules/solarch/dist/apis/backup.js` and `backup_utils.js`):

- **Backup Storage Path**: `./sol_data/backups/`
- **Backup Mechanism**:
  1. Executes `PRAGMA wal_checkpoint(TRUNCATE)` on `data.db` and `auxiliary.db`.
  2. Uses the atomic `better-sqlite3` `.backup()` stream to produce consistent point-in-time snapshots without database locking.
  3. Bundles `data.db`, `auxiliary.db`, and `./sol_data/storage/` into a compressed `.zip` archive.
- **REST Endpoints (Superuser Authenticated)**:
  - `GET /api/backups` — List all existing backups with file sizes and ISO timestamps.
  - `POST /api/backups` — Trigger an immediate atomic backup (`backup_<timestamp>.zip`).
  - `GET /api/backups/:key` — Stream and download the `.zip` archive.
  - `POST /api/backups/upload` — Upload an external backup zip.
  - `POST /api/backups/:key/restore` — Atomically restore database and storage blobs from zip.

---

## 4. Future Render Persistent Disk Configuration

When ready to enable persistent storage on Render, configure the following:

### Disk Specifications
- **Disk Name**: `smarttransit-data`
- **Mount Path**: `/opt/render/project/src/sol_data` (or `./sol_data`)
- **Initial Size**: `1 GB` (Standard SSD)

### Environment Variables
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security & optimizations |
| `PORT` | `8090` | Internal server listen port |
| `SOLARCH_JWT_SECRET` | *(Secret ≥ 32 chars)* | Cryptographic JWT signing key |
| `SOLARCH_DATA_DIR` | `/opt/render/project/src/sol_data` | Optional override for data directory path |

---

## 5. Render Dashboard Setup Procedure (Future Steps)

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Navigate to the **SmartTransit Backend Web Service**.
3. Under the **Settings** / **Plan** tab:
   - Ensure the service is upgraded to an instance type supporting Disks (Render Individual / Starter tier or above; Free tier does not support Persistent Disks).
4. Navigate to the **Disks** section in the left sidebar.
5. Click **Add Disk** and enter:
   - **Name**: `smarttransit-data`
   - **Mount Path**: `/opt/render/project/src/sol_data`
   - **Size**: `1 GB`
6. Click **Save Changes** / **Create Disk**.
7. Render will automatically re-deploy the service with the disk mounted at the specified path.

---

## 6. Operational Lifecycles & Behaviors

### A. Free Tier vs. Paid Tier Limitations
- **Render Free Tier**:
  - Web Services run on ephemeral containers with a temporary local disk.
  - On service spin-down (inactivity after 15 minutes), restarts, or Git redeploys, ephemeral disk changes are reset.
  - Superuser initialization scripts automatically re-seed bootstrap data if `./sol_data` is empty.
- **Render Paid Tier + Persistent Disk**:
  - Persistent SSD disk survives all container spin-downs, restarts, and Git redeployments.
  - Database writes in `./sol_data` remain 100% durable.

### B. Redeploy & Restart Behavior with Disk
- **Code Updates / Git Pushes**: When Render builds a new Docker image or restarts the Node.js process, the existing persistent disk is remounted untouched.
- **Superuser Script**: `scripts/init-solarch-superuser.js` inspects the mounted `_superusers` table in `data.db`. Because the database persists, it logs `Superuser already exists. Skipping initialization.` and starts immediately without data overwrite.

### C. Data Loss Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Accidental Disk Deletion** | Complete data loss | Download periodic `.zip` snapshots via `/api/backups` |
| **Concurrent Write Collisions** | SQLite file lock | Render limits Web Services with Disks to 1 active instance |
| **Corrupt WAL File** | Startup failure | Solarch auto-checkpoints WAL on boot and graceful shutdown |

---

## 7. Manual Backup & Restore Procedures

### Triggering Manual Backup via CLI / cURL
```bash
curl -X POST https://<your-render-backend-url>/api/backups \
  -H "Authorization: Bearer <SUPERUSER_JWT_TOKEN>"
```

### Downloading Backup Archive
```bash
curl -X GET https://<your-render-backend-url>/api/backups/<BACKUP_NAME>.zip \
  -H "Authorization: Bearer <SUPERUSER_JWT_TOKEN>" \
  -o backup.zip
```

### Restoring Backup
```bash
curl -X POST https://<your-render-backend-url>/api/backups/<BACKUP_NAME>.zip/restore \
  -H "Authorization: Bearer <SUPERUSER_JWT_TOKEN>"
```

---

## 8. Final Recommendation & Conclusion

- **Compatibility**: The Solarch 0.15.7 + SQLite WAL architecture is 100% ready for Render Persistent Disk mounting.
- **Code Changes Required**: **NO** (Zero code changes needed; directory structure `./sol_data` aligns directly with filesystem drivers).
- **Deployment Safety**: The application remains completely functional and deployment-safe on ephemeral or persistent environments.
