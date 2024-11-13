import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    universityID: { type: String, required: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String } // opcional
});

export default mongoose.model('User', userSchema);
