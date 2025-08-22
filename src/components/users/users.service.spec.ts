import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  registerNewUser,
  loginUser,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllUsers,
} from './users.service';
import { userRepository } from '@/repositories/user.repository';
import { ApiError } from '@common/utils/ApiError';
import config from '@/config';

// Mock dependencies
jest.mock('@/repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@/config', () => ({
  jwt: {
    secret: 'test-secret-key-that-is-at-least-32-characters-long',
    expiresIn: '1d',
  },
  nodeEnv: 'test',
}));

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('User Service', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatar: null,
    emailVerified: false,
    password: 'hashed-password',
    active: true,
    lastLogin: null,
    loginAttempts: 0,
    lockUntil: null,
    oauthProvider: null,
    oauthProviderId: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserPublicData = {
    id: mockUser.id,
    email: mockUser.email,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    avatar: mockUser.avatar,
    emailVerified: mockUser.emailVerified,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerNewUser', () => {
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
    } as any;

    it('should successfully register a new user', async () => {
      // Mock repository responses
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockUserPublicData);

      // Mock JWT
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await registerNewUser(registrationData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registrationData.email);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserPublicData.id, email: mockUserPublicData.email },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn,
        }
      );
      expect(result).toEqual({
        user: mockUserPublicData,
        token: 'mock-jwt-token',
      });
    });

    it('should map full name to first and last when only name is provided', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockUserPublicData);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const input = { name: 'Jane Roe', email: 'jane@example.com', password: 'secretpass' };

      await registerNewUser(input as any);

      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Roe',
        email: 'jane@example.com',
        password: 'secretpass',
      });
    });

    it('should throw error if user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(registerNewUser(registrationData)).rejects.toThrow(
        new ApiError(409, 'Email already in use')
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registrationData.email);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should handle repository errors during user creation', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockRejectedValue(new Error('Database error'));

      await expect(registerNewUser(registrationData)).rejects.toThrow('Database error');
    });
  });

  describe('loginUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      mockUserRepository.isLocked.mockResolvedValue(false);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.verifyPassword.mockResolvedValue(true);
      mockUserRepository.updateLastLogin.mockResolvedValue();

      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await loginUser(loginData.email, loginData.password);

      expect(mockUserRepository.isLocked).toHaveBeenCalledWith(loginData.email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockUserRepository.verifyPassword).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(loginData.email);
      expect(result).toEqual({
        user: mockUserPublicData,
        token: 'mock-jwt-token',
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.isLocked.mockResolvedValue(false);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUser(loginData.email, loginData.password)).rejects.toThrow(
        new ApiError(404, 'User not found')
      );
    });

    it('should throw error if password is incorrect', async () => {
      mockUserRepository.isLocked.mockResolvedValue(false);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.verifyPassword.mockResolvedValue(false);

      await expect(loginUser(loginData.email, loginData.password)).rejects.toThrow(
        new ApiError(401, 'Invalid credentials')
      );
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await getUserById('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUserPublicData);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(getUserById('user-123')).rejects.toThrow(
        new ApiError(404, 'User not found')
      );
    });
  });

  describe('updateUserById', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should successfully update user', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateUserById('user-123', updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', updateData);
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified,
      });
    });

    it('should throw error if user not found', async () => {
      // Mock the update method to throw an error for user not found
      mockUserRepository.update.mockRejectedValue(ApiError.notFound('User not found'));

      await expect(updateUserById('user-123', updateData)).rejects.toThrow(
        ApiError.notFound('User not found')
      );
    });
  });

  describe('deleteUserById', () => {
    it('should successfully delete user', async () => {
      const deletedUser = { ...mockUser };
      mockUserRepository.delete.mockResolvedValue(deletedUser);

      const result = await deleteUserById('user-123');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
      expect(result).toBe(true);
    });

    it('should throw error if user not found', async () => {
      // Mock the delete method to throw an error for user not found
      mockUserRepository.delete.mockRejectedValue(ApiError.notFound('User not found'));

      await expect(deleteUserById('user-123')).rejects.toThrow(
        ApiError.notFound('User not found')
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return users with pagination', async () => {
      const mockResponse = {
        users: [mockUserPublicData],
        total: 1,
      };

      mockUserRepository.findAllUsers.mockResolvedValue(mockResponse);

      const result = await getAllUsers(10, 0);

      expect(mockUserRepository.findAllUsers).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        users: [mockUserPublicData],
        total: 1,
      };

      mockUserRepository.findAllUsers.mockResolvedValue(mockResponse);

      const result = await getAllUsers();

      expect(mockUserRepository.findAllUsers).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
