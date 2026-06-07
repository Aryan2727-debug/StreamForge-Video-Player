/* eslint-disable no-undef */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

import User from "../models/User.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/auth/google/callback"
        },
        async (
            accessToken,
            refreshToken,
            profile,
            done
        ) => {
            try {
                let user = await User.findOne({
                    googleId: profile.id
                });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value,
                        avatar: profile.photos?.[0]?.value
                    });

                    console.log(
                        "✅ New user created:",
                        user.email
                    );
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;