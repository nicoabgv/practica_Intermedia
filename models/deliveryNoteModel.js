const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const PersonSchema = new mongoose.Schema({
  name: String,
  hours: Number,
});

const MaterialSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
});

const DeliveryNoteSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["hours", "materials", "mixed"], required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    persons: [PersonSchema],
    materials: [MaterialSchema],
    signed: { type: Boolean, default: false },
    signature: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

DeliveryNoteSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("deliverynotes", DeliveryNoteSchema);