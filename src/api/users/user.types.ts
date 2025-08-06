import { z } from 'zod';
import { UserRegistrationSchema, UserLoginSchema } from './user.validation';

// Infer types from Zod schemas for type safety
export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>['body'];
export type UserLoginInput = z.infer<typeof UserLoginSchema>['body'];

export interface UserPublicData {
  id: string;
  name: string;
  email: string;
}
