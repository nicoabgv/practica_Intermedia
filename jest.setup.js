const mongoose = require("mongoose");
const { server } = require("./index");

afterAll(async () => {
  await mongoose.disconnect();
  server.close();
});