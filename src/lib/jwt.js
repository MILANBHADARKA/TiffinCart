import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

// Generate token
export function generateToken(payload) {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    } catch (error) {
        console.error("Error generating token:", error);
        return null;
    }
}

// Verify token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}
