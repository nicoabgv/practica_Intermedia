const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const storageRoutes = require("./routes/storageRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use("/api/storage", storageRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});