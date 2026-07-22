const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const models = require('./models');
const routes = require('./routes');

const app = express();

app.use(morgan('tiny'));
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
