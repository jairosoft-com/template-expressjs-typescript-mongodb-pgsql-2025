import { Request, Response, NextFunction } from 'express';
import * as service from './user.service';
import { UserRegistrationSchema, UserLoginSchema } from './user.validation';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body using Zod schema
    const validatedBody = UserRegistrationSchema.parse(req.body);
    const { user, token } = await service.registerNewUser(validatedBody.body);
    res.status(201).json({
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body using Zod schema
    const validatedBody = UserLoginSchema.parse(req.body);
    const { user, token } = await service.loginUser(
      validatedBody.body.email,
      validatedBody.body.password
    );
    res.status(200).json({
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};
