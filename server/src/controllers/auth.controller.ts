import {Request, Response, NextFunction} from "express";
import {registerSchema} from '../validators/auth.validator';
import {registerUser} from '../services/auth.service';

export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Invalid registration data.",
                errors: result.error.flatten(),
            });
        }

        const user = await registerUser(result.data);
        return res.status(201).json({
            success:true,
            message:"Account created successfully",
            data:{
                user,
            }
        });
    } catch (error) {
        next(error);
    }
}