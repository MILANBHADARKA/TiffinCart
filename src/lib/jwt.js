import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Generate token
export const generateToken = (payload, expiresIn = "7d") => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Verify token
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
