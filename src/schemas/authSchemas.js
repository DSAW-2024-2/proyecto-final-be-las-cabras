import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().min(1, { message: 'Nombre requerido' }),
    lastName: z.string().min(1, { message: 'Apellido requerido' }),
    phone: z.string().min(6, { message: 'Número de teléfono requerido' }),
    email: z.string().email({ message: 'Correo inválido' }),
    password: z.string().min(6, { message: 'Contraseña requerida, mínimo 6 caracteres' })
});

export const loginSchema = z.object({
    email: z.string().email({ message: 'Correo inválido' }),
    password: z.string().min(6, { message: 'Contraseña requerida' }),
});
