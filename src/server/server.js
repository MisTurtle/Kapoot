import express from 'express';
import { rootPath } from '../commons/utils.js';

import { router as sessionRooter } from "./session/session_pipeline.js";

const app = express();

app.use('/static', express.static(rootPath("src/static")));  // Serve static files without checking for ongoing session 
app.use(sessionRooter);  // Catch requests and make sure a session cookie is given to the user
app.get('/', (req, res) => {
    let cnt;
    if(!req.session.views) { cnt = "Welcome, this is your first visit !"; req.session.views = 1; }
    else cnt = `Welcome, this is your visit number ${++req.session.views}!`;
    
    res.status(200).send(`
        <html>
        <head>
            <link href="/static/styles/test.css" rel="stylesheet">
            <script defer src="/static/scripts/bundle.js"></script>
        </head>
        <body>
            <p>${cnt}</p>
            <div id="container"></div>
        </body>
        </html>
    `);

    console.log(req.session);
});

const host = "0.0.0.0";
const port = 3000;
app.listen(port, host, () => {
    console.log(`Web server started @ ${host}:${port}`);
});