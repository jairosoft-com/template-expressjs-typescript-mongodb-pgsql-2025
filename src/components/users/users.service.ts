import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRegistrationInput, UserPublicData } from './users.types';
import { ApiError } from '@common/utils/ApiError';
import { BaseService } from '@common/base/BaseService';
import config from '@/config';
import { parseFullName } from '@common/utils/name.utils';

// Import Prisma repository
import { userRepository } from '@/repositories/user.repository';

/**
 * User Service
 * Handles business logic for user operations
 */
export class UserService extends BaseService {
  private repository: any;

  constructor() {
    super('users');
    // Use Prisma repository exclusively
    this.repository = userRepository;
    this.logger.info('Using Prisma repository for users');
  }

  /**
   * Register a new user
   * @param userData - The registration data for the new user
   * @returns Promise<{ user: UserPublicData; token: string }>
   */
  async registerNewUser(
    userData: UserRegistrationInput
  ): Promise<{ user: UserPublicData; token: string }> {
    // Check if user already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.conflict('Email already in use');
    }

    // Normalize name fields with utility for better international support
    const providedFirst = userData.firstName as string | undefined;
    const providedLast = userData.lastName as string | undefined;
    const providedName = userData.name as string | undefined;

    const fromFull = providedFirst && providedLast ? { firstName: providedFirst, lastName: providedLast } : parseFullName(providedName || '');
    const firstName = providedFirst || fromFull.firstName || '';
    const lastName = providedLast || fromFull.lastName || '';

    // Create user using Prisma repository (password hashing handled by repository)
    const newUser = await this.repository.createUser({
      email: userData.email,
      password: userData.password,
      firstName,
      lastName,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions
    );

    return { user: newUser, token };
  }

  /**
   * Login a user
   * @param email - The user's email
   * @param password - The user's password
   * @returns Promise<{ user: UserPublicData; token: string }>
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{ user: UserPublicData; token: string }> {
    // Check if account is locked
    const isLocked = await this.repository.isLocked(email);
    if (isLocked) {
      throw ApiError.forbidden('Account is locked due to too many failed login attempts');
    }

    // Find user
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify password
    const isValidPassword = await this.repository.verifyPassword(email, password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Update last login
    await this.repository.updateLastLogin(email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions
    );

    // Return user data and token
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  /**
   * Get user by ID
   * @param id - The user's ID
   * @returns Promise<UserPublicData>
   */
  async getUserById(id: string): Promise<UserPublicData> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Update user by ID
   * @param id - The user's ID
   * @param updateData - The data to update
   * @returns Promise<UserPublicData>
   */
  async updateUserById(
    id: string,
    updateData: Partial<UserRegistrationInput>
  ): Promise<UserPublicData> {
    const updatedUser = await this.repository.update(id, updateData);

    if (!updatedUser) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatar: updatedUser.avatar,
      emailVerified: updatedUser.emailVerified,
    };
  }

  /**
   * Delete user by ID
   * @param id - The user's ID
   * @returns Promise<boolean>
   */
  async deleteUserById(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw ApiError.notFound('User not found');
    }

    return true;
  }

  /**
   * Get all users with pagination
   * @param limit - Number of users to return
   * @param skip - Number of users to skip
   * @returns Promise<{ users: UserPublicData[]; total: number }>
   */
  async getAllUsers(
    limit: number = 10,
    skip: number = 0
  ): Promise<{ users: UserPublicData[]; total: number }> {
    const { users, total } = await this.repository.findAllUsers({
      skip,
      take: limit,
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return { users, total };
  }

  /**
   * Enable two-factor authentication for a user
   * @param userId - The user's ID
   * @param secret - The TOTP secret
   * @param backupCodes - Array of backup codes
   */
  async enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    await this.repository.enableTwoFactor(userId, secret);
    await this.repository.addBackupCodes(userId, backupCodes);
  }

  /**
   * Verify a backup code
   * @param userId - The user's ID
   * @param code - The backup code
   * @returns Promise<boolean>
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    return await this.repository.useBackupCode(userId, code);
  }
}

// Export singleton instance
export const userService = new UserService();

// Re-export functions for backward compatibility
export const registerNewUser = userService.registerNewUser.bind(userService);
export const loginUser = userService.loginUser.bind(userService);
export const getUserById = userService.getUserById.bind(userService);
export const updateUserById = userService.updateUserById.bind(userService);
export const deleteUserById = userService.deleteUserById.bind(userService);
export const getAllUsers = userService.getAllUsers.bind(userService);
