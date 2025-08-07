import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRegistrationInput, UserPublicData } from './users.types';
import { ApiError } from '@common/utils/ApiError';
import { userRepository } from '@/database/repositories/user.repository';
import config from '@/config';

/**
 * Register a new user
 * @param userData - The registration data for the new user
 * @returns Promise<{ user: UserPublicData; token: string }>
 */
export const registerNewUser = async (
  userData: UserRegistrationInput
): Promise<{ user: UserPublicData; token: string }> => {
  // Check if user already exists
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user using repository
  const newUser = await userRepository.create({
    ...userData,
    password: hashedPassword,
  });

  // Generate JWT token
  const token = jwt.sign({ id: newUser.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  return { user: newUser, token };
};

/**
 * Login a user
 * @param email - The user's email
 * @param password - The user's password
 * @returns Promise<{ user: UserPublicData; token: string }>
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: UserPublicData; token: string }> => {
  // Find user with password using repository
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Prepare user public data
  const userPublicData: UserPublicData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  // Generate JWT token
  const token = jwt.sign({ id: user.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  return { user: userPublicData, token };
};

/**
 * Get user by ID
 * @param id - The user's ID
 * @returns Promise<UserPublicData>
 */
export const getUserById = async (id: string): Promise<UserPublicData> => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/**
 * Update user by ID
 * @param id - The user's ID
 * @param updateData - The data to update
 * @returns Promise<UserPublicData>
 */
export const updateUserById = async (
  id: string,
  updateData: Partial<{ name: string; email: string }>
): Promise<UserPublicData> => {
  const updatedUser = await userRepository.updateById(id, updateData);
  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }
  return updatedUser;
};

/**
 * Delete user by ID
 * @param id - The user's ID
 * @returns Promise<boolean>
 */
export const deleteUserById = async (id: string): Promise<boolean> => {
  const deleted = await userRepository.deleteById(id);
  if (!deleted) {
    throw new ApiError(404, 'User not found');
  }
  return deleted;
};

/**
 * Get all users with pagination
 * @param limit - Number of users to return
 * @param skip - Number of users to skip
 * @returns Promise<{ users: UserPublicData[]; total: number }>
 */
export const getAllUsers = async (
  limit: number = 10,
  skip: number = 0
): Promise<{ users: UserPublicData[]; total: number }> => {
  return await userRepository.findAll(limit, skip);
};
