import {Router} from 'express'
import {login,  register, logout, profile} from "../controllers/authController.js";
import {authRequired} from '../middlewares/validateToken.js';
import  {validateSchema} from '../middlewares/validateSchemas.js';
import {loginSchema, registerSchema} from '../schemas/authSchemas.js';


const router = Router();

router.post('/register', validateSchema(registerSchema),register);
router.post('/login',validateSchema(loginSchema),login);
router.post("/logout", logout);
router.get("/profile", authRequired, profile);


export default router