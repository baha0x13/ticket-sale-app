const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const models = require('./models');
const routes = require('./routes');
const { register, requestDurationMiddleware } = require('./metrics');

const app = express();

app.use(morgan('tiny'));
app.use(requestDurationMiddleware);
app.use(bodyParser.json());

app.use('/', routes);

app.use((err, req, res, _next) => {
    if (process.env.NODE_ENV !== 'production') console.log(err);
    res.status(err.status || 500);
    res.json({ error: { message: err.message || 'Internal error' } });
});

models.db.sync({ alter: true }).then(() => {
    app.listen(config.port, () => {
        console.log(`> auth-service listening on port ${config.port}`);
    });
});

require('http').createServer(async (req, res) => {
    if (req.url === '/metrics') {
        res.setHeader('Content-Type', register.contentType);
        res.end(await register.metrics());
        return;
    }
    res.writeHead(404);
    res.end();
}).listen(process.env.METRICS_PORT || 9464, () => {
    console.log('> Metrics server listening on port', process.env.METRICS_PORT || 9464);
});
