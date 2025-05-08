import next from 'next';
import express from 'express';
import expressWs from 'express-ws';
import cookieParser from 'cookie-parser';

import { createServer } from 'http';
import { parse } from 'url';

// Routers
import { router as sessionRouter } from './session/session_pipeline.js';
import { router as apiRouter } from './routes/api_routes.js';
// Other imports
import { production, rootPath } from '@common/utils.js';
import { DatabaseController } from './database/database_controller.js';
import { unless } from './utils/utils.js';

// Database logins
import mysql_credentials from "../../mysql_host.json";

// Database initiator
const db = new DatabaseController(rootPath("private", "dev-db.sqlite"), mysql_credentials);

try {
    await db.endpoints.init();
} catch(err) {
    const e = err as Error;
    console.error(`${e.name} : ${e.message}\n${db.description}`);
    process.exit(1);
}

const dev = !production;
const app = next({ dev });
const handler = app.getRequestHandler();
const expressApp = express();

// Server address
const HOST = "0.0.0.0";
const PORT = parseInt(process.env.PORT || "8000");

// Prepare Next.js
await app.prepare();

// Create HTTP server and bind Express
const server = createServer(expressApp);

// expressApp.use((req, res, next) => { console.log("Cookie:", req.headers.cookie); next(); });

// Patch expressApp for ws support
expressWs(expressApp, server);

// Middlewares and routes
expressApp.use(cookieParser());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
// expressApp.use('/favicon.ico', express.static(rootPath('public/images/Logo_Compact.png')));
expressApp.use(unless(["_next/*"], sessionRouter));
expressApp.use("/api", apiRouter);

// All other requests go to Next.js
expressApp.all('*', (req, res) => {
    return handler(req, res);
});

// --- WebSocket Upgrade Handling ---
server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '', true);

    // Pass HMR websocket upgrades to Next.js
    if (pathname?.startsWith('/_next/webpack-hmr')) {  // TODO : This is broken in dev mode, keeps spamming in the console
        app.getUpgradeHandler()(req, socket, head);
        return;
    }
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(DatabaseController.getInstance().description);
});
