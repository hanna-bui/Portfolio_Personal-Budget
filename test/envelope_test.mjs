import { assert } from 'chai';
import request from 'supertest';

import app from '../app.js';

describe('Envelope', () => {
    const PATH = '/envelope';

    describe(PATH, () => {
        it('Add a new envelope with title and balance then delete it', async () => {
            // POST
            const expected = {
                id: 0,
                title: 'title3',
                balance: 200 
            }

            let response = await request(app).post(`${PATH}`).query(expected);

            assert.equal(response.status, 201);
            
            const envelope = response.body;
            expected.id = envelope.id;
            assert.deepStrictEqual(envelope, expected);

            // DELETE
            response = await request(app).delete(`${PATH}/${envelope.id}`);

            assert.equal(response.status, 204);
        });
        it('Add a new envelope with title then delete it', async () => {
            // POST
            const expected = {
                id: 0,
                title: 'title3'
            }

            let response = await request(app).post(`${PATH}`).query(expected);

            assert.equal(response.status, 201);
            
            const envelope = response.body;
            expected.id = envelope.id;
            expected.balance = envelope.balance;
            assert.deepStrictEqual(envelope, expected);

            // DELETE
            response = await request(app).delete(`${PATH}/${envelope.id}`);

            assert.equal(response.status, 204);
        });
        it('Add a new envelope with budget -> 204 ERROR', async () => {
            // POST
            const query_string = {
                balance: 0
            }
            const expected = 'Please provide a title';

            let response = await request(app).post(`${PATH}`);

            assert.equal(response.status, 400);
            
            assert.equal(response.text, expected);
        });
        it('Add a new envelope without query -> 204 ERROR', async () => {
            // POST
            const expected = 'Please provide a title';

            let response = await request(app).post(`${PATH}`);

            assert.equal(response.status, 400);
            
            assert.equal(response.text, expected);
        });
    });
    
    describe(`${PATH}/budget`, () => {
        it('Get list of envelopes', async () => {
            const response = await request(app).get(`${PATH}/budget`);

            const envelopes = response.body;

            assert.equal(response.status, 200);
            assert.isArray(envelopes);
        });
    });

    describe (`${PATH}/transfer`, () => {
        it('Transfer balance from envelope ID 1 to envelope ID 2', async () => {
            const expected = {
                from: {
                    id: 1,
                    title: 'title1',
                    balance: 800
                },
                to: {
                    id: 2,
                    title: "title2",
                    balance: 700
                }              
            }

            const original = {
                from: {
                    id: 2,
                    title: "title2",
                    balance: 500
                },
                to: {
                    id: 1,
                    title: "title1",
                    balance: 1000
                }
            }

            const query_string = {
                from: 1,
                to: 2,
                amount: 200
            }
            // First PUT
            let response = await request(app).put(`${PATH}/transfer`).query(query_string);

            let envelopes = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelopes, expected);
            
            // Second PUT
            query_string.from = 2;
            query_string.to = 1;
            response = await request(app).put(`${PATH}/transfer`).query(query_string);

            envelopes = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelopes, original);
        });
        it('Transfer balance from invalid envelope ID 3 to valid envelope ID 1 -> 400 ERROR', async () => {
            const expected = `Invalid ID: 3`;
            const query_string = { from: 3, to: 1, amount: 200 }

            const response = await request(app).put(`${PATH}/transfer`).query(query_string);

            const message = response.text;

            assert.equal(response.status, 400);
            assert.deepStrictEqual(message, expected);
        });
        it('Transfer invalid amount -> 400 ERROR', async () => {
            const expected = `Envelope '1' does not have enough balance to transfer $2000`;
            const query_string = { from: 1, to: 2, amount: 2000 }

            const response = await request(app).put(`${PATH}/transfer`).query(query_string);

            const message = response.text;

            assert.equal(response.status, 400);
            assert.deepStrictEqual(message, expected);
        });
    });

    describe (`${PATH}/:id`, () => {
        // GET
        it('Find envelope by ID 1', async () => {
            const expected = {
                id: 1,
                title: 'title1',
                balance: 1000
            }
            const response = await request(app).get(`${PATH}/1`);

            const envelope = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, expected);
        });
        it('Find envelope by ID 3 -> 400 ERROR', async () => {
            const expected = 'Not a valid envelope ID';

            const response = await request(app).get(`${PATH}/3`);

            const message = response.text;

            assert.equal(response.status, 400);
            assert.deepStrictEqual(message, expected);
        });

        // PUT
        it('Update an existing envelope by ID 1 with title and balance, then revert back', async () => {
            const expected = {
                id: 1,
                title: 'titleNew',
                balance: 200
            }

            const original = {
                id: 1,
                title: 'title1',
                balance: 1000
            }
            // First PUT
            let response = await request(app).put(`${PATH}/1`).query(expected);

            let envelope = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, expected);
            
            // Second PUT
            response = await request(app).put(`${PATH}/1`).query(original);

            envelope = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, original);
        });
        it('Update an existing envelope by ID 1 with title, then revert back', async () => {
            const expected = {
                id: 1,
                title: 'titleNew'
            }

            const original = {
                id: 1,
                title: 'title1',
                balance: 1000
            }
            // First PUT
            let response = await request(app).put(`${PATH}/1`).query(expected);

            let envelope = response.body;
            expected.balance = 1000;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, expected);
            
            // Second PUT
            response = await request(app).put(`${PATH}/1`).query(original);

            envelope = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, original);
        });
        it('Update an existing envelope by ID 1 with balance, then revert back', async () => {
            const expected = {
                id: 1,
                balance: 200
            }

            const original = {
                id: 1,
                title: 'title1',
                balance: 1000
            }
            // First PUT
            let response = await request(app).put(`${PATH}/1`).query(expected);

            let envelope = response.body;
            expected.title = 'title1';

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, expected);
            
            // Second PUT
            response = await request(app).put(`${PATH}/1`).query(original);

            envelope = response.body;

            assert.equal(response.status, 200);
            assert.deepStrictEqual(envelope, original);
        });
    });
});