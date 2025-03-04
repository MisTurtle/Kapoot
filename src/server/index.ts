import next from 'next';
import express from 'express';

// Routers
import { router as sessionRouter } from './session/session_pipeline.js';
import { router as apiRouter } from './routes/api_routes.js';
// Other imports
import { production, rootPath } from '../common/utils.js';
import { DatabaseController } from './database/database_controller.js';
import { unless } from './utils/utils.js';

/**
 * Database initiator
 */
const db = new DatabaseController(rootPath("private", "dev-db.sqlite"), undefined); // TODO : Add MySQL credentials to be used during prod (external file)
await db.endpoints.init();

/**
 * Next and Express App initiator
 */
const dev = !production;
const app = next({ dev });
const handler = app.getRequestHandler();
const server = express();

/**
 * Server address
 */
const HOST = "0.0.0.0";
const PORT: number = parseInt(process.env.PORT || "8000");

/**
 * Start NextJS server alongside express
 */
app.prepare().then(() => {

    server.use(express.json());  // Support JSON encoded bodies
    server.use(express.urlencoded({ extended: true }));  // Support URL encoded bodies
    server.use('/favicon.ico', express.static(rootPath('public/images/Logo_Compact.png')));  // Serve favicon
    server.use(unless(["_next/*"], sessionRouter));  // Add a session cookie to the user and try to fetch the associated account
    server.use("/api", apiRouter);  // Handle api requests before dispatching to Next.js

    server.all('*', (req, res) => {
        return handler(req, res);
    });  // NextJS handles every request, but we still need express middlewares
    server.listen(PORT, HOST, () => {
        if(production) console.log(`Server running on port ${HOST}:${PORT}`);
        else console.log(`Backend server started on ${HOST}:${PORT}`);
    });

});
