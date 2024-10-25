import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { creatAccessToken} from "../libs/jwt.js";

export const register =  async (req, res) => {
    const {firstName, lastName, phone, email, idCode, password} = req.body;

    try {

        const userFound = await User.findOne({email});
        
        if (userFound) 
            return res.status(400).json(["the email is already in use"]);
        

        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            phone,
            idCode
        })
    
        const userSaved = await newUser.save();
        const token = await creatAccessToken({id: userSaved._id});

        res.cookie("token", token);
        res.json({id: userSaved._id,
            firstName: userSaved.firstName,
            lastName: userSaved.lastName,
            email: userSaved.email,
            phone: userSaved.phone,
            idCode: userSaved.idCode,
        })
    } catch (error) {
        res.status(500).json({message:  error.message});
    }

};

export const login =  async (req, res) => {
    const {email, password} = req.body;

    try {

        const userFound = await User.findOne({email});
        if (!userFound) return res.status(400).json({message: "User not found"});

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({message: "Invalid password"});

        const token = await creatAccessToken({id: userFound._id});
        res.cookie("token", token);
        res.json({id: userFound._id,
            firstName: userFound.firstName,
            lastName: userFound.lastName,
            email: userFound.email,
            phone: userFound.phone,
            idCode: userFound.idCode,
        })

    } catch (error) {
        res.status(500).json({message:  error.message})
    }

};

export const logout = async (req, res) =>{
    res.cookie("token", "", {
        expires: new Date(0)
    });
    return res.sendStatus(200);
};
export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id)

    if (!userFound) return res.status(400).json({message: "User not found"});

    return res.json({
        id: userFound._id,
        firstName: userFound.firstName,
        lastName: userFound.lastName,
        email: userFound.email,
        phone: userFound.phone,
        idCode: userFound.idCode,
    })
    
}