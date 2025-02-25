import express from 'express';
import { router as sessionRouter } from './session/session_pipeline.js';
import { production, rootPath } from '../common/utils.js';
import { DatabaseController } from './database/database_controller.js';


/**
 * Database initiator
 */
const db = new DatabaseController("./dev-db.sqlite", undefined);
await db.endpoints.createTables();
// TODO

/**
 * Express Server
 */
const app = express();

if (production) app.use("/", express.static(rootPath('dist', 'frontend')));
app.use(sessionRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server ee!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
