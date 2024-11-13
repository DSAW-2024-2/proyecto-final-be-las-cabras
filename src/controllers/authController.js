import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { fullName, email, universityID, contactNumber, password } = req.body;

    // Validar campos obligatorios
    if (!fullName || !email || !universityID || !contactNumber || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El correo ya está en uso' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = new User({
            fullName,
            email,
            universityID,
            contactNumber,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario creado con éxito' });
    } catch (error) {
        console.error('Error en registro de usuario:', error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error en inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
