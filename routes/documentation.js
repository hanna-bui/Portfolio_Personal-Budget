const express = require("express");
const docRouter = express.Router();
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require('../api/openapi.json');

docRouter.use('', swaggerUi.serve);
docRouter.get('', swaggerUi.setup(swaggerDocument));

module.exports = {docRouter};