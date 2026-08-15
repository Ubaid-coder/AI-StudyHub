import bcrypt from 'bcryptjs';
import { User } from "../models/user.model";
import type { LoginInput, RegisterInput } from '../validators/auth.validator';
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";

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

export const loginUser = async (
  input: LoginInput
) => {
  const { email, password } = input;

  // 1. Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // 2. Compare password
  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  // 3. Generate tokens
  const accessToken = generateAccessToken(
    user._id.toString()
  );

  const refreshToken = generateRefreshToken(
    user._id.toString()
  );

  // 4. Return safe user information
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
};