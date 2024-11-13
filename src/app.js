import express from  'express';
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv  from 'dotenv'
import morgan from  'morgan';


dotenv.config();
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Conectar a MongoDB
const mongoURL = process.env.DATABASE_URL;
mongoose.connect(mongoURL)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((error) => console.error('Error conectando a MongoDB:', error.message));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('API corriendo');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

export default app;