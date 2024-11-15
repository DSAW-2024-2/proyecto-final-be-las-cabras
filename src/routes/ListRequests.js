const { Router } = require("express");
const router = Router();

const { Trip } = require("../models/tripModel.js");

const { decode } = require("../middlewares/secure.js");

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find();

    const filterData = trips.filter(
      (trip) => Number(trip.busyNow) < Number(trip.seatCount)
    );

    res.json(filterData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trips" });
  }
});

router.get("/waiting", decode, async (req, res) => {
  try {
    // Buscar el viaje por ID y popular los pasajeros (si waitingPassengers hace referencia a otro esquema)
    const trip = await Trip.findById(req.user.id).populate("waitingPassengers");

    if (!trip) {
      return res.status(404).json({ message: "No se encontró el viaje" });
    }
    res.json(trip.waitingPassengers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/accepted", decode, async (req, res) => {
  try {
    // Buscar el viaje por ID y popular los pasajeros (si waitingPassengers hace referencia a otro esquema)
    const trip = await Trip.findById(req.user.id).populate(
      "acceptedPassengers"
    );

    if (!trip) {
      return res.status(404).json({ message: "No se encontró el viaje" });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;