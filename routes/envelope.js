const express = require('express')

const {db} = require('../db/index.js');

const envelopeRouter = express.Router();

const createEnvelope = async (req, res, next) => {
    let {title, balance} = req.query;

    if (title) {
        let results;
        if (!balance) {
            balance = 0;
        }

        results = await db.query("INSERT INTO envelopes(title, balance) VALUES ($1, $2) RETURNING *", [title, balance]);

        if (typeof results === 'error') {
            next(results);
        } else {
            res.status(201).send(results.rows[0]);
        }
    } else {
        const err = new Error('Please provide a title');
        err.status = 400;
        next(err);
    }
}

const getEnvelopes = (req, res, next) => {
    db.query('SELECT * FROM envelopes ORDER BY id ASC', (error, results) => {
        if (error) {
            next(error);
        } else {
            res.status(200).send(results.rows);
        }
    })
}

const transferEnvelope = async (req, res, next) => {
    const amount = parseInt(req.query.amount);
    const from = parseInt(req.query.from);
    const to = parseInt(req.query.to);

    db.query('SELECT * FROM envelopes WHERE id = $1 OR id = $2', [from, to], async (error, results) => {
        if (error) {
            next(error);
        } else if (results.rowCount < 2) {
            let err;
            if (results.rowCount === 1) {
                const envelope = results.rows[0];
                const id = envelope.id;
                err = new Error(`Invalid ID: ${id === from ? to : from}`);
            } else {
                err = new Error('Both of the IDs are invalid');
            }
            err.status = 400;
            next(err);
        } else {
            const from_e = results.rows[0].id === from ? results.rows[0] : results.rows[1];
            if (from_e.balance < amount) {
                const err = new Error(`Envelope '${from}' does not have enough balance to transfer $${amount}`);
                err.status = 400;
                next(err);
            } else {
                let from_envelope = await db.query(`UPDATE envelopes SET balance = balance - $1 WHERE id = $2 RETURNING *`, [amount, from]);

                let to_envelope = await db.query(`UPDATE envelopes SET balance = balance + $1 WHERE id = $2 RETURNING *`, [amount, to]);

                res.status(200).send({from: from_envelope.rows[0], to: to_envelope.rows[0]});
            }            
        }
    })    
}

const getEnvelopeById = (req, res) => {
    res.status(200).send(req.envelope);
}

const updateEnvelope = async (req, res, next) => {
    let {title, balance} = req.query;

    if (!title) {
        title = req.envelope.title;
    }
    if (!balance) {
        balance = req.envelope.balance;
    }
    const query_string = `UPDATE envelopes SET title = '${title}', balance = '${balance}' WHERE id = $1 RETURNING *`;
    db.query(query_string, [req.envelope_id], (error, results) => {
        if (error) {
            next(error);
        } else if (results.rowCount === 0) {
            const err = new Error('Envelope not found');
            err.status = 404;
            next(err);
        } else {
            res.status(200).send(results.rows[0]);
        }
    })
}

const deleteEnvelope = (req, res, next) => {
    db.query('DELETE FROM envelopes WHERE id = $1', [req.envelope_id], (error, results)=>{
        if (error) {
            next(error);
        } else {
            res.status(204).send();
        }
    })
}

envelopeRouter.post('', createEnvelope);

envelopeRouter.get('/budget', getEnvelopes);

envelopeRouter.put('/transfer', transferEnvelope);

envelopeRouter.param('id', async (req, res, next, id) => {
    let envelope_id = parseInt(id);
    db.query('SELECT * FROM envelopes WHERE id = $1', [envelope_id], (error, results) => {
        if (error) {
            next(error);
        } else if (results.rowCount === 0) {
            const error = new Error('Not a valid envelope ID');
            error.status = 400;
            next(error);
        } else {
            req.envelope = results.rows[0];
            req.envelope_id = envelope_id;
            next();
        }
    })
})

envelopeRouter.get('/:id', getEnvelopeById);

envelopeRouter.put('/:id', updateEnvelope);

envelopeRouter.delete('/:id', deleteEnvelope);

module.exports = {envelopeRouter}