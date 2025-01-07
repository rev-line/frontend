import { z } from 'zod';

export const schema = z.object({
    email: z.string().email('Enter a valid email address! '),
    password: z
        .string()
});
