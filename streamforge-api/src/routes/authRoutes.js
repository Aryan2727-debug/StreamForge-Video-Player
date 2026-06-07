import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import generateToken from "../utils/generateToken.js";
import authMiddleware from "../middleware/authMiddleware.js";

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
    (req, res) => {
        const token = generateToken(req.user);

        // eslint-disable-next-line no-undef
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(
            // eslint-disable-next-line no-undef
            `${process.env.CLIENT_URL}`
        );
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
            avatar: req.user.avatar
        });
    }
);

/*
    Logout
*/
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });

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