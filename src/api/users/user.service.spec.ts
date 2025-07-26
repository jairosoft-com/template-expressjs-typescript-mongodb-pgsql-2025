// Mock config first
jest.mock('../../config', () => {
  return {
    __esModule: true,
    default: {
      nodeEnv: 'test',
      port: 3001,
      logLevel: 'info',
      corsOrigin: '*',
      jwt: {
        secret: 'test-secret',
        expiresIn: '1d',
      },
      db: {
        postgresUrl: 'postgres://test',
        mongoUrl: 'mongodb://test',
        redisUrl: 'redis://test',
      },
    },
  };
});

import * as userService from './user.service';
import UserModel from '../../database/models/user.model';
import { ApiError } from '../../utils/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock other dependencies
jest.mock('../../database/models/user.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerNewUser', () => {
    it('should register a new user successfully', async () => {
      const userInput = { name: 'Test', email: 'test@test.com', password: 'password123' };
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockUser = { id: '1', ...userInput, password: 'hashedPassword' };
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await userService.registerNewUser(userInput);

      expect(result.user).toEqual({ id: '1', name: 'Test', email: 'test@test.com' });
      expect(result.token).toBe('token');
      expect(UserModel.create).toHaveBeenCalledWith({
        ...userInput,
        password: 'hashedPassword',
      });
    });

    it('should throw a 409 error if email is already in use', async () => {
      const userInput = { name: 'Test', email: 'test@test.com', password: 'password123' };
      (mockUserModel.findOne as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(userService.registerNewUser(userInput)).rejects.toThrow(
        new ApiError(409, 'Email already in use')
      );
    });
  });
});
