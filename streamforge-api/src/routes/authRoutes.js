import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import generateToken from "../utils/generateToken.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Session from "../models/Session.js";

const router = express.Router();

/*
    Start Google Login
*/
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

/*
    Google Callback
*/
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/auth/failure"
    }),
    async (req, res) => {
        const sessionId = `sess_${uuidv4()}`;

        await Session.create({
            sessionId,
            userId: req.user._id,
            userAgent: req.headers["user-agent"],
            platform: req.headers["sec-ch-ua-platform"] || "unknown"
        });

        console.log("✅ Session created:", sessionId);
        const token = generateToken(req.user, sessionId);

        res.cookie(
            "token",
            token,
            {
                ...getCookieOptions(),
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        );

        // eslint-disable-next-line no-undef
        res.redirect(process.env.CLIENT_URL);
    }
);

/*
    Check Authentication Status
*/
router.get("/status", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json({
            authenticated: false
        });
    }

    try {
        jwt.verify(
            token,
            // eslint-disable-next-line no-undef
            process.env.JWT_SECRET
        );

        return res.json({
            authenticated: true
        });
    } catch {
        return res.json({
            authenticated: false
        });
    }
});

/*
    Get Current User
*/
router.get(
    "/me",
    authMiddleware,
    (req, res) => {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            sessionId: req.auth.sessionId
        });
    }
);

/*
    Logout
*/
router.post("/logout", (req, res) => {
    res.clearCookie(
        "token",
        getCookieOptions()
    );

    res.json({
        message: "Logged out"
    });
});

/*
    Failure Route
*/
router.get("/failure", (req, res) => {
    res.status(401).json({
        message: "Authentication Failed"
    });
});

export default router;