/**
 * loginSchema: the admin sign-in form. Supabase checks the password itself;
 * this only makes sure we send something sensible.
 */
import { z } from "zod";

export const loginSchema = z.object({
  // Self-contained on this branch: emailField in ./helpers is still an Activity 1 stub.
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter your admin email" })),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.input<typeof loginSchema>;
