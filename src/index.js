// 1. IMPORTAR DEPENDENCIAS
const express = require("express");
const app = express();
require("dotenv").config(); // Cargar las variables de entorno desde .env
const cors = require("cors");
const mongoose = require("mongoose");

// 2. CONFIGURACION DE LA API
app.use(express.json());
app.use(cors());

// Conexión a MongoDB usando Mongoose
mongoose
  .connect(process.env.DB_USER) // Opciones para la conexión
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB", err));

// USANDO ROUTES PARA SEPARAR EL CODIGO EN MODULOS
app.use("/car", require("./routes/Cars"));
app.use("/trip", require("./routes/Trips"));
app.use("/user", require("./routes/Users"));
app.use("/email", require("./routes/Emails"));
app.use("/trip/booking", require("./routes/Bookings"));
app.use("/trip/list", require("./routes/ListRequests"));
app.use("/user/additional", require("./routes/userAdditional"));

// Capturar rutas no definidas (404)
app.use((req, res) => {
  res.status(404).json("Ruta no encontrada");
});

// 3. INICIAR LA API
let port = process.env.PORT || 3000;
app.set("port", port);
app.listen(app.get("port"), () => {
  console.log(`server is running on port ${port}`);
});