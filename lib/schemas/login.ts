/**
 * loginSchema: the admin sign-in form. Supabase checks the password itself;
 * this only makes sure we send something sensible.
 */
import { z } from "zod";
import { emailField } from "./helpers";

export const loginSchema = z.object({
  email: emailField("Enter your admin email"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.input<typeof loginSchema>;
