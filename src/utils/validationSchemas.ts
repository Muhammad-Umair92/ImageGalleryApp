import { z } from 'zod';

// ─── Register Form Schema ─────────────────────────────────────────────────────
// Zod schema defines BOTH validation rules AND TypeScript types in one place.
// z.infer<typeof registerSchema> automatically produces the TypeScript type:
// { name: string; email: string; phone: string; password: string }
// No need to define a separate interface — it's derived from the schema.
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    // .email() validates format: must contain @, valid domain, etc.
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    // .regex() validates that phone is exactly 10 digits, nothing else
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Derive the TypeScript type directly from the Zod schema.
// This is the ONLY place this type is defined — schema and type stay in sync.
export type RegisterFormValues = z.infer<typeof registerSchema>;
