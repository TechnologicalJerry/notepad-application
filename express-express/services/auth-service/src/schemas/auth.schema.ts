import { z } from "zod";

export const createUserSchema = z
  .object({
    body: z.object({
      name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
      email: z.string({ required_error: "Email is required" }).email("Not a valid email address"),
      password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      passwordConfirmation: z.string({ required_error: "passwordConfirmation is required" }),
    }),
  })
  .refine((data) => data.body.password === data.body.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["body", "passwordConfirmation"],
  });

export const createSessionSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Not a valid email address"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
