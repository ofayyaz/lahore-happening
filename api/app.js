const express = require('express');
const { graphqlHTTP } = require('graphql-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const schema = require('../src/schema');  // Assumes schema setup is exported from a 'schema' directory

const app = express();
app.use(cors());
app.use(bodyParser.json());


module.exports = app;