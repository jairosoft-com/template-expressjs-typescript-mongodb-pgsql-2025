import { z } from 'zod';

// Accept either firstName/lastName or a combined name for backward compatibility
const NameFieldsSchema = z
  .object({
    firstName: z.string().min(1, 'firstName must not be empty').optional(),
    lastName: z.string().min(1, 'lastName must not be empty').optional(),
    name: z.string().min(2).optional(),
  })
  .refine(
    (data) => Boolean(data.name) || (Boolean(data.firstName) && Boolean(data.lastName)),
    {
      message: 'Provide either name or both firstName and lastName',
      path: ['name'],
    }
  );

export const UserRegistrationSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
    })
    .and(NameFieldsSchema),
});

export const UserLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});
