const express = require('express');

const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

const { envelopeRouter } = require('./routes/envelope.js');
const { transactionRouter } = require('./routes/transaction.js');
const { docRouter } = require('./routes/documentation.js');

const clc = require('cli-color');

const PORT = process.env.PORT || 3001;

app.use(cors());

// TODO: Enable after finish testing
app.use('/', morgan('tiny'));

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (req, res, next) => {
    res.send('Hello, World!');
})

app.use('/envelope', envelopeRouter);
app.use('/transaction', transactionRouter);
app.use('/api-docs', docRouter);

// Error-handling Middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
});

// TODO: Enable after finish testing
const server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${port}!`)
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

module.exports = app