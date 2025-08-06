import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as userService from './user.service';
import { registerUser, loginUser } from './user.controller';
import { ApiError } from '../../utils/ApiError';

// Mock the user service
jest.mock('./user.service');

const mockUserService = userService as jest.Mocked<typeof userService>;

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      headers: {},
      method: 'POST',
      url: '/api/v1/users/register'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const validRegistrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register a user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };
      const mockToken = 'mock-jwt-token';

      mockRequest.body = validRegistrationData;
      mockUserService.registerNewUser.mockResolvedValue({
        user: mockUser,
        token: mockToken
      });

      await registerUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserService.registerNewUser).toHaveBeenCalledWith(validRegistrationData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        data: {
          user: mockUser,
          token: mockToken
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = new ZodError([
        {
          code: 'invalid_string',
          message: 'Invalid email',
          path: ['body', 'email']
        }
      ]);

      mockRequest.body = { invalid: 'data' };
      mockUserService.registerNewUser.mockRejectedValue(validationError);

      await registerUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(validationError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new ApiError(409, 'Email already in use');
      mockRequest.body = validRegistrationData;
      mockUserService.registerNewUser.mockRejectedValue(serviceError);

      await registerUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockRequest.body = validRegistrationData;
      mockUserService.registerNewUser.mockRejectedValue(unexpectedError);

      await registerUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });

  describe('loginUser', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };
      const mockToken = 'mock-jwt-token';

      mockRequest.body = validLoginData;
      mockUserService.loginUser.mockResolvedValue({
        user: mockUser,
        token: mockToken
      });

      await loginUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserService.loginUser).toHaveBeenCalledWith(
        validLoginData.email,
        validLoginData.password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        data: {
          user: mockUser,
          token: mockToken
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validation errors for login', async () => {
      const validationError = new ZodError([
        {
          code: 'invalid_string',
          message: 'Invalid email',
          path: ['body', 'email']
        }
      ]);

      mockRequest.body = { invalid: 'data' };
      mockUserService.loginUser.mockRejectedValue(validationError);

      await loginUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle authentication errors', async () => {
      const authError = new ApiError(401, 'Invalid credentials');
      mockRequest.body = validLoginData;
      mockUserService.loginUser.mockRejectedValue(authError);

      await loginUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(authError);
    });

    it('should handle missing credentials', async () => {
      mockRequest.body = { email: 'test@example.com' }; // Missing password

      await loginUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Should be handled by Zod validation
      expect(mockUserService.loginUser).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should pass errors to next middleware', async () => {
      const error = new Error('Test error');
      mockRequest.body = {};
      mockUserService.registerNewUser.mockRejectedValue(error);

      await registerUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle null request body', async () => {
      mockRequest.body = null;

      await registerUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Should be handled by Zod validation
      expect(mockUserService.registerNewUser).not.toHaveBeenCalled();
    });
  });
});
