import { Request, Response, NextFunction } from 'express';
import * as service from './user.service';
import { UserRegistrationInput } from './user.types';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userInput: UserRegistrationInput = req.body;
    const { user, token } = await service.registerNewUser(userInput);
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
    const { email, password } = req.body;
    const { user, token } = await service.loginUser(email, password);
    res.status(200).json({
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};
