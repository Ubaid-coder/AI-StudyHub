import {z} from 'zod';

export const chatSchema = z.object({
    message:z
        .string()
        .trim()
        .min(2, {message:'Message must be at least 2 characters long'})
        .max(5000, {message:'Message must be at most 5000 characters long'})
});

export type ChatInput = z.infer<typeof chatSchema>;
