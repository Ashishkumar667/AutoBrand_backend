import jwt from "jsonwebtoken";
import { User } from "../models/userModel/user.js";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = async( req, res, next) =>{
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

export default authMiddleware;