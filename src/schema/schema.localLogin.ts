import { z } from "zod";

export const LocalLoginSchema = z.object({
    email: z.string().min(10),
    password: z.string().min(8)
}).strict();

export type LocalLoginInput = z.infer< typeof LocalLoginSchema >;
