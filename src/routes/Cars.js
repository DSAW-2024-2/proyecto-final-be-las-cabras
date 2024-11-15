const { Router } = require("express");
const router = Router();

const { Car } = require("../models/carModel.js");
const { User } = require("../models/userModel.js");
const { Trip } = require("../models/tripModel.js");

const { decode } = require("../middlewares/secure.js");

router.post("/", decode, async (req, res) => {
  try {
    delete req.body._id;
    req.body.busyNow = 0;
    // Verificar si el usuario ya tiene un carro registrado
    const existingCar = await Car.findById(req.user.id);

    if (existingCar) {
      return res
        .status(400)
        .json({ message: "Ya tienes un carro registrado." });
    }

    // Crear un nuevo carro
    const newCar = new Car({
      _id: req.user.id,
      ...req.body,
    });

    // Guardar el nuevo carro
    const savedCar = await newCar.save();

    // Actualizar el usuario con el nuevo vehículo
    await User.findByIdAndUpdate(
      req.user.id,
      { vehicle: savedCar },
      { new: true }
    );

    // Responder con el carro guardado
    res.status(201).json(savedCar);
  } catch (err) {
    // Manejo de errores
    res
      .status(500)
      .json({ message: "Error al crear carro", error: err.message });
  }
});

router.put("/", decode, async (req, res) => {
  try {
    delete req.body._id;
    delete req.body.brand;
    delete req.body.model;
    delete req.body.licensePlate;

    // Buscar el carro del usuario
    const car = await Car.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    // Si no se encuentra el carro, devolver un error
    if (!car) {
      return res.status(404).json({ message: "Carro no encontrado" });
    }
    const newUser = await User.findByIdAndUpdate(
      req.user.id,
      { vehicle: car },
      { new: true }
    );

    await Trip.findByIdAndUpdate(
      req.user.id,
      { vehicle: car, driver: newUser },
      { new: true }
    );
    // Responder con el carro actualizado
    res.status(200).json(car);
  } catch {
    res
      .status(500)
      .json({ message: "Error al actualizar carro", error: err.message });
  }
});

router.delete("/", decode, async (req, res) => {
  try {
    // Buscar y eliminar el carro por ID
    const car = await Car.findByIdAndDelete(req.user.id);

    // Si no se encuentra el carro, devolver error
    if (!car) {
      return res.status(404).send({ message: "Carro no encontrado" });
    }

    // Actualizar el usuario para eliminar la referencia al vehículo
    await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { vehicle: "" } },
      { new: true }
    );

    // Eliminar todos los viajes asociados al carro
    await Trip.findByIdAndDelete(req.user.id);

    // Respuesta exitosa
    res.status(200).send({ message: "Carro eliminado con éxito" });
  } catch (err) {
    // Manejo de errores
    res
      .status(500)
      .send({ message: "Error al eliminar el carro", error: err.message });
  }
});

router.get("/", decode, async (req, res) => {
  try {
    const car = await Car.findById(req.user.id);
    if (!car) {
      return res.status(404).send({ message: "Carro no encontrado" });
    }
    res.status(200).json(car);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener el carro", error: err.message });
  }
});

module.exports = router;