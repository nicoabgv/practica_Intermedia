const mongoose = require("mongoose");
const { server } = require("./index");

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock("./utils/handleMails", () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

afterAll(async () => {
  await mongoose.disconnect();
  if (server && server.close) server.close();
});