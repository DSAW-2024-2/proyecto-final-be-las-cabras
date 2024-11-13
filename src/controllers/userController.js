import User from '../models/userModel.js';

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const updateUserProfile = async (req, res) => {
    const { fullName, email, contactNumber } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;

    try {
        const userId = req.user.userId;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar el perfil del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

