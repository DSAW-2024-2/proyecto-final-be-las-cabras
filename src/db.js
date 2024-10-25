import mongoose from 'mongoose'

export const connectDB = async () => {
    try{
        await mongoose.connect('mongodb://localhost/rideshareapp');
        console.log('Conectado a MongoDB');
    }catch (error){
        console.log(error);
    }
}
