import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res:Response,
    _next: NextFunction
) => {
    console.error("Global Error:",error);

    return res.status(500).json({
        success:false,
        message: error.message || "Internal Server Error",
    })
}