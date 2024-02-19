const express = require('express');

const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

const SwaggerUI = require('swagger-ui');

const { envelopeRouter } = require('./routes/envelope.js');
const { transactionRouter } = require('./routes/transaction.js');

const PORT = 3000;

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

// Error-handling Middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
});

// TODO: Enable after finish testing
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`)
});

module.exports = app