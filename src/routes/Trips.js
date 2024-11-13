const { Router } = require("express");
const router = Router();

const { Trip } = require("../models/tripModel.js");
const { User } = require("../models/userModel.js");
const { Car } = require("../models/carModel.js");

const { decode } = require("../Middlewares/secure.js");

router.delete("/", decode, async (req, res) => {
  try {
    const { id } = req.user;
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting trip", error: err });
  }
});

router.post("/", decode, async (req, res) => {
  try {
    delete req.body._id;
    const user = await User.findById(req.user.id);
    const car = new Car(user.vehicle);
    if (!car || !user) {
      return res.status(400).json({ message: "User or car not found" });
    }
    const trip = new Trip({
      _id: req.user.id,
      driver: user,
      vehicle: car,
      ...req.body,
    });
    if (car.capacity < trip.seatCount) {
      return res.status(400).json({ message: "Not enough seats in the car" });
    }
    const unique = await Trip.findOne({ _id: trip._id });
    if (unique) {
      return res
        .status(400)
        .json({ message: "Este conductor ya tiene un viaje creado" });
    }
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user" });
  }
});

router.put("/", decode, async (req, res) => {
  try {
    // Filtrar campos no permitidos
    delete req.body.driver;
    delete req.body.vehicle;

    // Actualizar el viaje (asegurarse de que req.user.id esté presente)
    const newTrip = await Trip.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true, // Para validar los datos actualizados según el esquema
    });

    // Verificar si el viaje fue encontrado
    if (!newTrip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Responder con el viaje actualizado
    return res.status(200).json(newTrip);
  } catch (err) {
    // Manejo de errores
    return res.status(500).json({ message: "Error", error: err.message });
  }
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }
  Trip.findById(id)
    .then((trip) => {
      if (!trip) {
        return res.status(404).json({ message: "Trip no encontrado" });
      }
      res.json(trip);
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "Error fetching user", error: err.message });
    });
});

router.post("/accept", decode, async (req, res) => {
  try {
    const tripId = req.user.id;
    const { id } = req.body;

    // Find the trip by ID and retrieve `busyNow` and `seatCount`
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    const { busyNow, seatCount, waitingPassengers } = trip;

    // Check if there are available seats
    if (busyNow + 1 > seatCount) {
      return res.status(400).json({ message: "No hay asientos disponibles" });
    }

    // Find the passenger in the waitingPassengers list using their _id
    const passenger = waitingPassengers.find(
      (p) => p._id.toString() === id.toString()
    );

    if (!passenger) {
      return res.status(404).json({ message: "Pasajero no encontrado" });
    }

    // Update trip: move the passenger from waiting to accepted and increment busyNow
    const newTrip = await Trip.findByIdAndUpdate(
      tripId,
      {
        $inc: { busyNow: 1 },
        $pull: { waitingPassengers: { _id: id } }, // Remove from waiting
        $push: { acceptedPassengers: passenger }, // Add to accepted
      },
      { new: true, runValidators: true }
    );

    if (!newTrip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Return the updated trip
    res.json(newTrip);
  } catch (err) {
    // Handle errors
    return res.status(500).json({ message: "Error", error: err.message });
  }
});

router.post("/deny", decode, async (req, res) => {
  try {
    const tripId = req.user.id;
    const { id } = req.body;

    // Find the trip by ID
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    const { waitingPassengers } = trip;

    // Find the passenger in the waitingPassengers list using their _id
    const passenger = waitingPassengers.find((p) => p._id === id);

    if (!passenger) {
      return res.status(404).json({ message: "Pasajero no encontrado" });
    }

    // Update trip: decrement busyNow and remove the passenger from waiting
    const newTrip = await Trip.findByIdAndUpdate(
      tripId,
      {
        $inc: { busyNow: -1 }, // Use $inc to decrement busyNow
        $pull: { waitingPassengers: { _id: id } }, // Remove from waiting
      },
      { new: true, runValidators: true }
    );

    if (!newTrip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Return the updated trip
    res.json(newTrip);
  } catch (err) {
    // Handle errors
    return res.status(500).json({ message: "Error", error: err.message });
  }
});

router.post("/payment", (req, res) => {});

module.exports = router;