import { Router } from 'express';
import * as controller from './user.controller';
import { validate } from '../../middleware/validation.middleware';
import { UserRegistrationSchema, UserLoginSchema } from './user.validation';

const router = Router();

router.post('/register', validate(UserRegistrationSchema), controller.registerUser);
router.post('/login', validate(UserLoginSchema), controller.loginUser);

export default router;
