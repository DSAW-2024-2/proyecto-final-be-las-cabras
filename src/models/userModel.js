const { Schema, model } = require("mongoose");
const { CarSchema } = require("./carModel");

// Definir un esquema de ejemplo
const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  idUniversidad: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  vehicle: { type: CarSchema },

  recommendations: { type: [String], required: false },

  ratings: [
    {
      score: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: false },
    },
  ],
});

const User = model("User", UserSchema);

module.exports = { User, UserSchema };