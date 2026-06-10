import jwt from "jsonwebtoken";

const generateToken = (user, sessionId) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            sessionId
        },
        // eslint-disable-next-line no-undef
        process.env.JWT_SECRET,
        { 
            expiresIn: "7d" 
        }
    );
};

export default generateToken;