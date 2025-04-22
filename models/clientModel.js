const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nif: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    company: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

ClientSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("clients", ClientSchema);