import express from 'express';
import { rootPath } from '../commons/utils.js';

const app = express();
app.use('/static', express.static(rootPath("src/static")));

app.get('/', (req, res) => {
    res.status(200).send(`
        <html>
        <head>
            <link href="/static/styles/test.css" rel="stylesheet">
            <script defer src="/static/scripts/bundle.js"></script>
        </head>
        <body>
            <p>Hello world !</p>
            <div id="container"></div>
        </body>
        </html>
    `);
})

const host = "0.0.0.0";
const port = 3000;
app.listen(port, host, () => {
    console.log(`Web server started @ ${host}:${port}`);
});