import { z } from "zod";

export const messageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
});

export type MessageInput = z.infer<typeof messageSchema>;
