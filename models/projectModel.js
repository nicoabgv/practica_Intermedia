const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "clients", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // si tiene
  },
  { timestamps: true }
);

ProjectSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("projects", ProjectSchema);