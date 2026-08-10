import { z } from 'zod';

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be atleast 2 characters")
        .max(50, "Name cannot exceed 50 characters."),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email")
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(100, "Password cannot exceed 100 characters."),
});

export type RegisterInput = z.infer<typeof registerSchema>;