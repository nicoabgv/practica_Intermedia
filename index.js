// index.js
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 3000;

let server;

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  });
} else {
  connectDB();
}

module.exports = { app, server };