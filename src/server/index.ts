import express from 'express';
import { production, rootPath } from '../common/utils.js';
import { DatabaseController } from './database/database_controller.js';

import { router as sessionRouter } from './session/session_pipeline.js';
import { router as apiRouter } from './routes/api_routes.js';

/**
 * Database initiator
 */
const db = new DatabaseController("./dev-db.sqlite", undefined); // TODO : Add MySQL credentials to be used during prod (external file)
await db.endpoints.createTables();

/**
 * Express Server
 */
const app = express();

// Register routes
if (production)  // On production, redirect to static files
    app.use("/", express.static(rootPath('dist', 'frontend')));
app.use(sessionRouter);
app.use('/api', apiRouter);

const HOST = "0.0.0.0";
const PORT: number = parseInt(process.env.PORT || "8000");
app.listen(PORT, HOST, () => {
    if(production) console.log(`Server running on port ${HOST}:${PORT}`);
    else console.log(`Backend server started on ${HOST}:${PORT}`);
});
