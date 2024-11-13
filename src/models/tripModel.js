const { Schema, model } = require("mongoose");
const { UserSchema } = require("./userModel");
const { CarSchema } = require("./carModel");

const PassengerSchema = new Schema({
  idCreator: { type: String, require: true },
  userName: { type: String, require: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  stop: { type: String, required: true },
  paymentMethod: { type: String, required: true },
});

// Definir un esquema de ejemplo
const TripSchema = new Schema({
  _id: { type: String, required: true },
  driver: {
    type: UserSchema,
    required: true, // Si el conductor es obligatorio
  },

  vehicle: {
    type: CarSchema,
    required: true, // Si el vehículo es obligatorio
  },

  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },

  date: { type: String, required: true },
  time: { type: String, required: true },
  route: { type: String, required: true },
  fare: { type: String, required: true }, // Si la tarifa es necesaria
  seatCount: { type: Number, required: true },

  busyNow: { type: Number, required: false },

  paymentMethods: [String],

  waitingPassengers: [
    {
      type: PassengerSchema,
    },
  ],

  acceptedPassengers: [{ type: PassengerSchema }],
});

const Trip = model("Trip", TripSchema);

const Passenger = model("Passenger", PassengerSchema);

module.exports = { Trip, TripSchema, Passenger };