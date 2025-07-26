import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRegistrationInput, UserPublicData } from './user.types';
import { ApiError } from '../../utils/ApiError';
import UserModel from '../../database/models/user.model';
import config from '../../config';

export const registerNewUser = async (
  userData: UserRegistrationInput
): Promise<{ user: UserPublicData; token: string }> => {
  const existingUser = await UserModel.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await UserModel.create({ ...userData, password: hashedPassword });

  const userPublicData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  const token = jwt.sign({ id: newUser.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  return { user: userPublicData, token };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: UserPublicData; token: string }> => {
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const userPublicData = { id: user.id, name: user.name, email: user.email };
  const token = jwt.sign({ id: user.id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  return { user: userPublicData, token };
};
