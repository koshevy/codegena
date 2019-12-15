const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./specs/todo-app-spec.json');

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(3001, function () {
    console.log('TodoApp swagger UI works on http://localhost:3001!');
});
