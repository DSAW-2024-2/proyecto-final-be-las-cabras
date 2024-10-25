import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true},
  lastName: { type: String, required: true, trim: true},
  phone: { type: String, required: true, trim: true},
  email: { type: String, required: true, unique: true, trim: true},
  photo: { type: String },
  idCode: { type: String, required: true, unique: true, trim: true},
  password: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now }
},{
  timestamps: true
})

export default mongoose.model('User', userSchema);