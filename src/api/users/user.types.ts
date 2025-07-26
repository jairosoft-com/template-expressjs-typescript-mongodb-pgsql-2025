import { z } from 'zod';
import { UserRegistrationSchema } from './user.validation';

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>['body'];

export interface UserPublicData {
  id: string;
  name: string;
  email: string;
}
