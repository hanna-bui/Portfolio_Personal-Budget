const express = require('express')

const {db} = require('../db/index.js');

const transactionRouter = express.Router();

const getTransactions = (req, res, next) => {
    const {envelope_id} = req.query;
    if (envelope_id) {
        db.query('SELECT * FROM transactions WHERE envelope_id = $1 ORDER BY id ASC', [envelope_id], (error, results) => {
            if (error) {
                next(error);
            } else {
                res.status(200).send(results.rows);
            }
        })
    } else {
        db.query('SELECT * FROM transactions ORDER BY id ASC', (error, results) => {
            if (error) {
                next(error);
            } else {
                res.status(200).send(results.rows);
            }
        })
    }    
}

const createTransaction = async (req, res, next) => {
    let {date, payment, recipient, envelope_id} = req.query;
    if (payment && envelope_id) {
        if (!date) {
            date = null;
        }
        if (!recipient) {
            recipient = null;
        }
        db.query('INSERT INTO transactions(date, payment, recipient, envelope_id) VALUES ($1, $2, $3, $4) RETURNING *', [date, payment, recipient, envelope_id], (error, results) => {
            if(error) {
                next(error);
            } else {
                res.status(201).send(results.rows[0]);
            }
        })
    } else {
        const err = new Error ('Invalid input');
        err.status = 400;
        next(err);
    }
}

const getTransactionById = (req, res) => {
    res.status(200).send(req.transaction);
}

const updateTransaction = async (req, res, next) => {
    let {date, payment, recipient, envelope_id} = req.query;

    if (!date) {
        date = req.transaction.date;
    }
    if (!payment) {
        payment = req.transaction.payment;
    }
    if (!recipient) {
        recipient = req.transaction.recipient;
    }
    if (!envelope_id) {
        envelope_id = req.transaction.envelope_id;
    }

    db.query('SELECT balance FROM envelopes WHERE id = $1', [envelope_id], (error, results) => {
        if (error) {
            next(error);
        } else if (results.rowCount === 0) {
            next(new Error ('Invalid envelope id'));
        } else if (results.rows[0].balance < payment) {
            next(new Error (`Payment amount is more than the envelope's balance`));
        } else {
            const query_string = `UPDATE transactions SET date = $1, payment = $2, recipient = $3, envelope_id = $4 WHERE id = $5 RETURNING *`;
            db.query(query_string, [date, payment, recipient, envelope_id, req.transaction_id], (error, results) => {
                if (error) {
                    next(error);
                } else if (results.rowCount === 0) {
                    const err = new Error('Transaction not found');
                    err.status = 404;
                    next(err);
                } else {
                    res.status(200).send(results.rows[0]);
                }
            })
        }
    })

    
}

const deleteTransaction = (req, res, next) => {
    db.query('DELETE FROM transactions WHERE id = $1', [req.transaction_id], (error, results)=>{
        if (error) {
            next(error);
        } else {
            res.status(204).send();
        }
    })
}

transactionRouter.post('', createTransaction);

transactionRouter.get('', getTransactions);

transactionRouter.param('id', async (req, res, next, id) => {
    let transaction_id = parseInt(id);
    db.query('SELECT * FROM transactions WHERE id = $1', [transaction_id], (error, results) => {
        if (error) {
            next(error);
        } else if (results.rowCount === 0) {
            const error = new Error('Not a valid transaction ID');
            error.status = 400;
            next(error);
        } else {
            req.transaction = results.rows[0];
            req.transaction_id = transaction_id;
            next();
        }
    })
})

transactionRouter.get('/:id', getTransactionById);

transactionRouter.put('/:id', updateTransaction);

transactionRouter.delete('/:id', deleteTransaction);

module.exports = { transactionRouter }