import {Request, Response, NextFunction} from "express";
import {registerSchema} from '../validators/auth.validator';
import {registerUser} from '../services/auth.service';
import { loginSchema } from "../validators/auth.validator";
import { loginUser } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { env } from "../config/env";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/jwt";
import { User } from "../models/user.model";

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

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data.",
        errors: result.error.flatten(),
      });
    }

    const resultData = await loginUser(result.data);

    res.cookie("refreshToken", resultData.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: resultData.user,
        accessToken: resultData.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing.",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select(
      "_id name email createdAt"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    const accessToken = generateAccessToken(
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
    });
  }
};

export const logoutController = async (
  _req: Request,
  res: Response
) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const meController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};