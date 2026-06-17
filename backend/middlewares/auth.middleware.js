import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

//protect

let token;

export const protect = async (req, res, next) => {
    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        console.log("Received token:", token);

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded:", decoded);

        req.user = await User.findById(decoded.id).select("-password");

        if (req.user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact support."
            });
        }

        next();

    } catch (error) {

        console.log("JWT error:", error);
        console.log("Received token:", token);

        res.status(401).json({
            message: "Not authorized, token failed"
        });

    }
};


//role based authentication

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};


