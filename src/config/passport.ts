import dotenv from "dotenv";
dotenv.config();

import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authService from "../services/service.auth.js";
import UserClient from "../client/client.user.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID as string,
      clientSecret: process.env.clientSecret as string,
      callbackURL: '/auth/google/callback',
    }, 

async (accessToken:string, refreshToken:string, profile:Profile, done:VerifyCallback) => {
  try {

    const email = profile.emails?.[0]?.value as string;
    const first_name = profile.name?.givenName;
    const last_name = profile.name?.familyName;
    const provider_id = profile.id;

    const user = await authService.checkUserExistence(provider_id, email);

    if(user === null){

      // 1. Create auth user first
      const newAuthUser = await authService.addNewAuth(email,provider_id) as any;

      // 2. Create profile in user service
      const profile = await UserClient.addNewUser(
        newAuthUser.user_public_id,
        first_name,
        last_name
      );

      return done(null, newAuthUser);
    }

    if(typeof user === "string")
      throw new Error("Linking failed");

    return done(null, user);

  } catch (err) {
    return done(err);
  }
}
));