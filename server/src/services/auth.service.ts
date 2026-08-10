import bcrypt from 'bcryptjs';
import { User } from "../models/user.model";
import type { RegisterInput } from '../validators/auth.validator';

export const registerUser = async (
    input: RegisterInput
) => {
    const { name, email, password } = input;

    // 1. Check whether user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User with this email already exists.");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const user = await User.create({
        name,
        email,
        password:hashedPassword
    })

    // 4. Never return password
    return {
        id: user._id,
        name:user.name,
        email:user.email,
        createdAt: user.createdAt,
    }
}