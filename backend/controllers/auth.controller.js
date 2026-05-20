import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
//Register 

export const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, address } = req.body;

        if (!name || !email || !password || !phone || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            address,
            isApproved: role === "seller" ? false : true,
            verificationToken,
        });

        try {
            await sendEmail({
                email,
                subject: "Email Verification",
                message: `<p>Hello ${name},</p><p>Please verify your email by clicking the link below:</p><a href="http://localhost:3000/verify-email?token=${verificationToken}">Verify Email</a>`
            });

        } catch (error) {
            console.error("REGISTER ERROR:");
            console.error(error);

            res.status(500).json({
                success: false,
                message: error.message,
                error: error
            });
        }
    }

    catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


//Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
        }

        //token

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json(
            {
                message: "Login successful",
                token,
                user,
            });

    }

    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

// to get profile
export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        res.json({
            success: true,
            user: req.user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

// verify email
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: "Email and verification code are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        if (user.verificationToken !== code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.json({ message: "Email verified successfully", success: true });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}


// forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
        const message = `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a>`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset Request",
                message,
            });
            res.json({ message: "Password reset email sent", success: true });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ message: "Failed to send password reset email", success: false });

        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// for reset the password we require the email

//now to reset the password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired password reset token", success: false });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: "Password reset successful", success: true });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};




