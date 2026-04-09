import jwt from "jsonwebtoken";

const JWT_SECRET = "UI87_tx60_POPiNA_SA";

export function generateToken(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
}