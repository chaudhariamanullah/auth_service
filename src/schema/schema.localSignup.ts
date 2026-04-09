import { z } from "zod";

export const LocalSignupSchema = z.object({
    user_fname:z.string(),
    user_lname:z.string(),
    user_email:z.string(),
    user_country_code:z.string(),
    user_phone:z.string(),
    user_password:z.string()
});

export type LocalSignupInput = z.infer< typeof LocalSignupSchema >;