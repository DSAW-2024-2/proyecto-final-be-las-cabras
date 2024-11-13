const bcrypt = require("bcrypt");

async function hashData(data) {
  try {
    const { password } = data;

    if (!password) {
      return data;
    }

    // Generar el salt (10 rondas en este caso)
    const salt = await bcrypt.genSalt(10);

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, salt);

    // Devolver los datos con la contraseña hasheada
    return {
      ...data,
      password: hashedPassword,
    };
  } catch (error) {
    // Manejar el error y lanzar una excepción
    throw new Error(`Error al hashear la contraseña: ${error.message}`);
  }
}

// Función para verificar una contraseña contra su hash
const verifyPassword = async (password, hashedPassword) => {
  try {
    // Comparar la contraseña proporcionada con el hash almacenado
    const match = await bcrypt.compare(password, hashedPassword);
    return match; // true si la contraseña coincide, false si no
  } catch (error) {
    return false;
  }
};

module.exports = { hashData, verifyPassword };