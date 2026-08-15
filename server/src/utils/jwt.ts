import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
    userId: string;
}

export interface RefreshTokenPayload {
    userId: string
}

export const generateAccessToken = (
    userId: string
): string => {
    return jwt.sign(
        {
            userId,
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    )
}

export const generateRefreshToken = (
    userId: string
): string => {
    return jwt.sign(
        {
            userId,
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn:"7d",
        }
    )
}