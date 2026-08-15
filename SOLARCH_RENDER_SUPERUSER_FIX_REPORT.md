# Solarch 0.15.7 Render Superuser Fix Report

## Root Cause of Localhost Installer Issue
The default Solarch 0.15.7 configuration displays an installer link pointing to `http://localhost:8090/_/#/install` if no superuser is detected on boot. In a deployed environment like Render, you cannot directly access this `localhost` installer endpoint because the container bounds it dynamically, and the frontend isn't designed to proxy backend installer screens.

## Exact Solarch 0.15.7 Behavior Discovered
- The `npx solarch superuser-create` CLI command possesses an options parsing quirk. Using `--dir ./sol_data` after positional arguments implicitly drops the argument or writes to the default `./pb_data` directory instead of the active SmartTransit directory.
- Internally, `superuser-create` uses `INSERT OR REPLACE` to inject the superuser directly into the SQLite `_superusers` table, generating a random ID and hashing the password via Solarch's native tools.
- It abruptly calls `process.exit(0)` upon success, preventing continuous runtime integration unless isolated in a separate script.
- The `hasSuperuser(app)` programmatic method correctly identifies if a superuser is seeded.

## Files Changed
1. **`scripts/init-solarch-superuser.js`** (NEW): An ES module script leveraging Solarch's programmatic API to securely instantiate the superuser exactly once.
2. **`package.json`** (MODIFIED): Appended `"prebackend": "node scripts/init-solarch-superuser.js"`. This triggers automatically whenever `npm run backend` is executed.

## Initialization Mechanism
The custom script `scripts/init-solarch-superuser.js`:
1. Safely checks for `SOLARCH_SUPERUSER_EMAIL` and `SOLARCH_SUPERUSER_PASSWORD`.
2. Validates `SOLARCH_JWT_SECRET` is present.
3. Initializes `BaseApp` explicitly targeting the `dataDir: './sol_data'`.
4. Executes `hasSuperuser(app)`. If true, it quietly skips and exits `0`.
5. If false, it creates the `_superusers` table if missing, utilizes Solarch's `hashPassword` utility, generates a `su_` prefixed hex ID, and runs a safe SQLite `INSERT`.

## Environment Variables Required for Render
Ensure the following are added as environment variables in the Render backend dashboard:
- `NODE_ENV` = `production`
- `SOLARCH_JWT_SECRET` = `<your-strong-jwt-secret>`
- `SOLARCH_SUPERUSER_EMAIL` = `<admin-email-for-dashboard>`
- `SOLARCH_SUPERUSER_PASSWORD` = `<strong-dashboard-password>`

## Security Considerations
- The password is **never printed** to the console logs.
- The password is **never hardcoded** in the source files.
- The initialization **safely bails out** if the `_superusers` table already has a record, preventing destructive overwrites.
- The Passenger/Driver/Admin users remain completely isolated in their separate Solarch data structures.

## Tests Performed & Results
| Test Description | Status |
|------------------|--------|
| `npm run lint` | 🟢 PASS (0 Errors) |
| `npm run build` | 🟢 PASS (Successfully compiled) |
| Execute init against fresh DB without Env Vars | 🟢 PASS (Fails securely with `FATAL: Missing SOLARCH_SUPERUSER...`) |
| Execute init against fresh DB with Env Vars | 🟢 PASS (Successfully hashes and inserts superuser) |
| Execute init against DB that already has Superuser | 🟢 PASS (Detects existing and skips safely) |
| `npm run backend` | 🟢 PASS (Successfully triggers `prebackend` then fully boots Solarch) |
| Verify Frontend | 🟢 PASS (No frontend files were changed, architecture preserved) |

## Render Deployment Instructions
1. Navigate to the Render Web Service for SmartTransit Backend.
2. In the **Environment** tab, add the four variables listed above.
3. Leave the start command as `npm run backend`.
4. Deploy the latest commit. The system will automatically seed the SQLite instance during startup exactly once.
