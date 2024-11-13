const jwt = require("jsonwebtoken");

const secretKey = "MaitoIsabelita1234";

const codify = async function (user) {
  try {
    // Verificar que se proporcione el objeto user con las propiedades necesarias
    if (!user || !user.userName || !user.password || !user.id) {
      throw new Error("El objeto user debe tener username, password e id");
    }

    // Crear el payload con la información del usuario
    const payload = {
      userName: user.userName,
      id: user.id,
    };

    // Generar el token JWT
    const token = await jwt.sign(payload, secretKey);

    // Devolver el token firmado
    return token;
  } catch (error) {
    // Si ocurre algún error, lanzar el error para que sea manejado por el código que llama la función
    throw new Error(`Error al generar el token: ${error.message}`);
  }
};

const newUser = async function (body) {
  try {
    const token = await jwt.sign(body, secretKey);
    return token;
  } catch (error) {
    throw new Error(`Error al generar el token: ${error.message}`);
  }
};

const decode = function (req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]; // Verifica si el token existe
    if (!token) {
      return res.status(401).send({ message: "No se proporcionó un token" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, secretKey);

    // Almacenar el payload decodificado en la solicitud para usarlo más tarde
    req.user = decoded;

    // Continuar con el siguiente middleware o ruta
    next();
  } catch (error) {
    // Enviar una respuesta con error de autorización si algo sale mal
    res
      .status(401)
      .send({ message: "Error de Autorización", error: error.message });
  }
};

module.exports = { decode, codify, newUser };