import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (
    req,
    res,
    next
) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(
            token,
            // eslint-disable-next-line no-undef
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decoded.userId
        );

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

        next();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

export default authMiddleware;