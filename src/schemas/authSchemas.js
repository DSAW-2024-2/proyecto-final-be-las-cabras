import {z} from "zod"

export const registerSchema = z.object({
    firstName: z.string( { required_error: 'Nombre requerido'}),
    lastName: z.string( { required_error: 'Apellido requerido'}),
    phone: z.string( { required_error: 'Numero de telefono requerido'}),
    email:  z.string( { required_error: 'Correo requerido'}).email({message: "Correo invalido"}),
    password: z.string( { required_error: 'Id requerido'}).min(6, {message:  "Al menos 6 caracters"}),
    password: z.string( { required_error: 'Contraseña requerida'}).min(6, {message: "Al menos 6 caracters"})
});

export const loginSchema = z.object({
    email:  z.string( { required_error: 'Correo requerido'}).email({message: "Correo invalido"}),
    password: z.string( { required_error: 'Contraseña requerida'}).min(6, {message: "Al menos 6 caracters"}),
});