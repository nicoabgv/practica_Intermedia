const express = require('express');
const morganBody = require("morgan-body");
const loggerStream = require("./utils/handleLogger");
const { swaggerUi, specs } = require("./docs/swagger");

const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const storageRoutes = require("./routes/storageRoutes");
const projectRoutes = require('./routes/projectRoutes');
const deliveryNoteRoutes = require('./routes/deliveryNoteRoutes');

const app = express();

app.use(express.json());

morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400,
  stream: loggerStream,
});

app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/delivery-notes', deliveryNoteRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

module.exports = app;
