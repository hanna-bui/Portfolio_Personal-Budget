import { assert } from 'chai';
import request from 'supertest';

import app from '../app.js';

describe('Transaction', () => {
    const PATH = '/transaction';

    describe(PATH, () => {
        // GET
        it('Get list of transactions', async () => {
            const response = await request(app).get(`${PATH}`);

            const transactions = response.body;

            assert.equal(response.status, 200);
            assert.isArray(transactions);
        });
        it('Add a new transaction with payment and envelope_id then delete it', async () => {
            // POST
            const expected = {
                id: 0,
                payment: 10,
                envelope_id: 4 
            }

            let response = await request(app).post(`${PATH}`).query(expected);

            assert.equal(response.status, 201);
            
            const transaction = response.body;
            expected.id = transaction.id;
            expected.date = null;
            expected.recipient = null;
            assert.deepStrictEqual(transaction, expected);

            // DELETE
            response = await request(app).delete(`${PATH}/${transaction.id}`);

            assert.equal(response.status, 204);
        });
        it('Add a new transaction with date, payment, recipient, and envelope_id then delete it', async () => {
            // POST
            const expected = {
                id: 0,
                date: '2024-02-15T05:00:00.000Z',
                payment: 10,
                recipient: 'Bank',
                envelope_id: 4,
            }

            let response = await request(app).post(`${PATH}`).query(expected);

            assert.equal(response.status, 201);
            
            const transaction = response.body;
            expected.id = transaction.id;
            assert.deepStrictEqual(transaction, expected);

            // DELETE
            response = await request(app).delete(`${PATH}/${transaction.id}`);

            assert.equal(response.status, 204);
        });
        it('Add a new transaction without query -> 204 ERROR', async () => {
            // POST
            const expected = 'Invalid input';

            let response = await request(app).post(`${PATH}`);

            assert.equal(response.status, 400);
            
            assert.equal(response.text, expected);
        });
    });

    describe(`${PATH}/:id`, () => {
        // GET
        it('Find transaction by ID 1', async () => {
            const expected = {
                id: 1,
                date: '2024-02-18T05:00:00.000Z',
                payment: 10,
                recipient: 'Bank',
                envelope_id: 4,
            }
            const response = await request(app).get(`${PATH}/1`);

            const transaction = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(transaction, expected);
        });
        it('Find transaction by ID 3 -> 400 ERROR', async () => {
            const expected = 'Not a valid transaction ID';

            const response = await request(app).get(`${PATH}/3`);

            const message = response.text;

            assert.equal(response.status, 400);
            assert.deepStrictEqual(message, expected);
        });

        // PUT
        it('Update an existing transaction by ID 1 with date, payment, recipient, envelope_id, then revert back', async () => {
            const expected = {
                id: 1,
                date: '2024-02-15T05:00:00.000Z',
                payment: 100,
                recipient: 'Car',
                envelope_id: 5,
            }

            const original = {
                id: 1,
                date: '2024-02-18T05:00:00.000Z',
                payment: 10,
                recipient: 'Bank',
                envelope_id: 4,
            }
            // First PUT
            let response = await request(app).put(`${PATH}/1`).query(expected);

            let transaction = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(transaction, expected);
            
            // Second PUT
            response = await request(app).put(`${PATH}/1`).query(original);

            transaction = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(transaction, original);
        });

        it('Update an existing transaction by ID 1 with INVALID envelope_id -> 500 ERROR', async () => {
            const expected = 'Invalid envelope id';

            const query_string = { envelope_id: 3 }
            // First PUT
            let response = await request(app).put(`${PATH}/1`).query(query_string);

            const message = response.text;

            assert.equal(response.status, 500);
            assert.deepStrictEqual(message, expected);
        });

        it('Update an existing transaction by ID 1 with payment > envelope.balance -> 500 ERROR', async () => {
            const expected = `Payment amount is more than the envelope's balance`;

            const query_string = { envelope_id: 4, payment: 200 }
            // First PUT
            let response = await request(app).put(`${PATH}/1`).query(query_string);

            const message = response.text;

            assert.equal(response.status, 500);
            assert.deepStrictEqual(message, expected);
        });
    });
});