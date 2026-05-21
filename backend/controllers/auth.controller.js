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

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            address,
            isApproved: role === "seller" ? false : true,
            verificationToken: verificationCode,
            verificationCode,
            verificationCodeExpires,
            isVerified: false,
        });

        try {
            await sendEmail({
                email,
                subject: "Email Verification OTP",
                message: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                        <h2 style="color: #4A90E2; text-align: center;">Verify Your Email Address</h2>
                        <p style="font-size: 16px; color: #333333;">Hello <b>${name}</b>,</p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.5;">Thank you for registering with Real Estate. Please use the following One-Time Password (OTP) to complete your registration. This code is valid for <b>10 minutes</b>:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #4A90E2; letter-spacing: 5px; padding: 10px 20px; border: 2px dashed #4A90E2; border-radius: 5px; background-color: #f7f9fc; display: inline-block;">${verificationCode}</span>
                        </div>
                        <p style="font-size: 14px; color: #777777; line-height: 1.5; text-align: center;">If you did not request this email, please ignore it or contact support if you have concerns.</p>
                        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #aaaaaa; text-align: center;">&copy; ${new Date().getFullYear()} Real Estate MERN App. All rights reserved.</p>
                    </div>
                `
            });

            return res.status(201).json({
                success: true,
                message: "Registration successful. Please verify your email.",
                user
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
            return res.status(403).json({
                success: false,
                message: "Please verify your email"
            });
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
            return res.status(400).json({ success: false, message: "Email and verification code are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        // Check if code matches
        const codeMatches = (user.verificationCode === code) || (user.verificationToken === code);
        if (!codeMatches) {
            return res.status(400).json({ success: false, message: "Invalid verification code" });
        }

        // Validate expiry
        if (user.verificationCodeExpires && user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Verification code has expired" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// resend verification OTP
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        // Generate new 6-digit OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newOTP;
        user.verificationToken = newOTP; // keep legacy token synced
        user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        await user.save();

        try {
            await sendEmail({
                email,
                subject: "New Verification OTP",
                message: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                        <h2 style="color: #4A90E2; text-align: center;">New Email Verification OTP</h2>
                        <p style="font-size: 16px; color: #333333;">Hello <b>${user.name}</b>,</p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.5;">You requested a new verification code. Please use the following One-Time Password (OTP) to verify your email. This code is valid for <b>10 minutes</b>:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #4A90E2; letter-spacing: 5px; padding: 10px 20px; border: 2px dashed #4A90E2; border-radius: 5px; background-color: #f7f9fc; display: inline-block;">${newOTP}</span>
                        </div>
                        <p style="font-size: 14px; color: #777777; line-height: 1.5; text-align: center;">If you did not request this email, please ignore it.</p>
                        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #aaaaaa; text-align: center;">&copy; ${new Date().getFullYear()} Real Estate MERN App. All rights reserved.</p>
                    </div>
                `
            });

            return res.status(200).json({
                success: true,
                message: "Verification OTP resent successfully."
            });
        } catch (error) {
            console.error("RESEND OTP ERROR:");
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to send email. Please try again.",
                error: error.message
            });
        }
    } catch (error) {
        console.error("Error during resending verification:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


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




