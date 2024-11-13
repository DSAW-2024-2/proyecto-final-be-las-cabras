const { Router } = require("express");
const { Types } = require("mongoose");
const router = Router();

const { Trip, Passenger } = require("../models/tripModel.js");

const { decode } = require("../Middlewares/secure.js");

router.post("/:id", decode, async (req, res) => {
  const idTrip = req.params.id;
  const idUser = req.user.id;
  const paymentMethod = req.body.paymentMethod; // Asegúrate de que el método de pago venga del cuerpo de la solicitud

  // Verificar si los IDs son válidos
  if (!Types.ObjectId.isValid(idTrip)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    // Eliminar el _id, idCreator, y userName del body si existen
    delete req.body._id;
    delete req.body.idCreator;
    delete req.body.userName;

    const trip = await Trip.findById(idTrip);

    if (!trip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Verificar si el método de pago está en la lista de métodos de pago del viaje
    const isPaymentMethodValid = trip.paymentMethods.some(
      (method) => method.toLowerCase() === paymentMethod.toLowerCase()
    );

    if (!isPaymentMethodValid && trip.paymentMethods) {
      return res.status(400).json({ message: "Payment method no válido" });
    }

    // Crear un nuevo pasajero
    const newPassenger = new Passenger({
      idCreator: idUser,
      userName: req.user.userName,
      ...req.body,
    });

    // Agregar el pasajero a la lista de waitingPassengers
    const updatedTrip = await Trip.findByIdAndUpdate(
      idTrip,
      {
        $push: { waitingPassengers: newPassenger },
      },
      { new: true }
    );

    // Verificar si el viaje fue encontrado
    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Responder con el viaje actualizado
    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al agregar pasajero", error: error.message });
  }
});

router.put("/:id", decode, async (req, res) => {
  const idTrip = req.params.id;
  const idRequest = req.body.id; // ID del pasajero que se desea modificar

  // Verificar si los IDs son válidos
  if (!Types.ObjectId.isValid(idTrip) || !Types.ObjectId.isValid(idRequest)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    // Extraer solo los campos que pueden ser modificados
    const { stop, phone, email, paymentMethod } = req.body;

    // Buscar el viaje por su ID
    const trip = await Trip.findById(idTrip);
    if (!trip) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Verificar si el método de pago está en la lista de métodos de pago del viaje
    const isPaymentMethodValid = trip.paymentMethods.some(
      (method) => method.toLowerCase() === paymentMethod.toLowerCase()
    );

    if (!isPaymentMethodValid) {
      return res.status(400).json({ message: "Payment method no válido" });
    }

    // Verificar si el pasajero está en la lista de `waitingPassengers`
    const passenger = trip.waitingPassengers.find(
      (p) => p._id.toString() === idRequest.toString()
    );
    if (!passenger) {
      return res.status(400).json({
        message: "El pasajero no está en la lista de espera del viaje",
      });
    }

    // Actualizar los campos del pasajero
    const updatedTrip = await Trip.findOneAndUpdate(
      {
        _id: idTrip,
        "waitingPassengers._id": idRequest, // Coincidir el ID del pasajero
      },
      {
        $set: {
          "waitingPassengers.$.stop": stop || passenger.stop,
          "waitingPassengers.$.phone": phone || passenger.phone,
          "waitingPassengers.$.email": email || passenger.email,
          "waitingPassengers.$.paymentMethod":
            paymentMethod || passenger.paymentMethod,
        },
      },
      {
        new: true, // Devolver el documento actualizado
      }
    );

    // Verificar si la actualización fue exitosa
    if (!updatedTrip) {
      return res
        .status(404)
        .json({ message: "No se pudo actualizar el viaje" });
    }

    // Responder con el viaje actualizado
    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al actualizar el pasajero",
      error: error.message,
    });
  }
});

router.delete("/:id", decode, async (req, res) => {
  const idTrip = req.params.id;
  const idRequest = req.body.id;

  // Verificar que el ID del pasajero sea proporcionado
  if (!idRequest) {
    return res.status(400).json({ message: "ID del pasajero es requerido" });
  }

  try {
    const trip = await Trip.findByIdAndUpdate(
      idTrip,
      {
        $pull: {
          waitingPassengers: { _id: idRequest }, // Eliminar el pasajero
        },
      },
      { new: true } // Devolver el documento actualizado
    );

    // Verificar si el viaje fue encontrado
    if (!trip) {
      return res.status(404).json({ message: "No se encontró el viaje" });
    }

    return res.status(200).json(trip); // Devolver el viaje actualizado
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el pasajero",
      error: error.message,
    });
  }
});

router.get("/:id", decode, async (req, res) => {
  const idTrip = req.params.id;

  try {
    // Buscar el viaje por ID y popular los pasajeros (si waitingPassengers hace referencia a otro esquema)
    const trip = await Trip.findById(idTrip).populate("waitingPassengers");

    if (!trip) {
      return res.status(404).json({ message: "No se encontró el viaje" });
    }

    // Filtrar la lista de pasajeros basándonos en idCreator
    const listPassengers = trip.waitingPassengers.filter(
      (passenger) => passenger.idCreator.toString() === req.user.id.toString()
    );

    // Verificar si no se encontraron pasajeros
    if (listPassengers.length === 0) {
      return res.status(404).json({ message: "No se encontraron pasajeros" });
    }

    // Responder con la lista filtrada de pasajeros
    return res.status(200).json(listPassengers);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener el viaje",
      error: error.message,
    });
  }
});

module.exports = router;