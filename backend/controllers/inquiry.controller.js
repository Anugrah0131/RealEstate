// controllers/inquiry.controller.js

import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";


// Buyer sends inquiry
export const sendInquiry = async (req, res) => {
    try {

        const { propertyId, message } = req.body;

        // Validation
        if (!propertyId || !message) {
            return res.status(400).json({
                success: false,
                message: "Property ID and message are required"
            });
        }

        // Find property
        const property = await Property.findById(propertyId)
            .populate("seller");

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Prevent duplicate inquiry
        const existingInquiry = await Inquiry.findOne({
            property: propertyId,
            buyer: req.user._id
        });

        if (existingInquiry) {
            return res.status(400).json({
                success: false,
                message: "Inquiry already sent for this property"
            });
        }

        // Create inquiry
        const inquiry = await Inquiry.create({
            property: property._id,
            buyer: req.user._id,
            seller: property.seller._id,
            message
        });

        res.status(201).json({
            success: true,
            message: "Inquiry sent successfully",
            inquiry
        });

    } catch (error) {

        console.error("SEND INQUIRY ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Seller views received inquiries
export const getInquiriesForSeller = async (req, res) => {
    try {

        const inquiries = await Inquiry.find({
            seller: req.user._id
        })
            .populate("buyer", "name email phone")
            .populate("property", "title price images location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inquiries.length,
            inquiries
        });

    } catch (error) {

        console.error("GET SELLER INQUIRIES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Buyer views sent inquiries
export const getInquiriesForBuyer = async (req, res) => {
    try {

        const inquiries = await Inquiry.find({
            buyer: req.user._id
        })
            .populate("property", "title price images location")
            .populate("seller", "name email");

        res.status(200).json({
            success: true,
            count: inquiries.length,
            inquiries
        });

    } catch (error) {

        console.error("GET BUYER INQUIRIES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Seller or buyer views single inquiry
export const getInquiry = async (req, res) => {
    try {

        const inquiry = await Inquiry.findById(req.params.id)
            .populate("buyer", "name email phone")
            .populate("seller", "name email")
            .populate("property", "title price images location");

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        // Authorization check
        const isSeller =
            inquiry.seller._id.toString() === req.user._id.toString();

        const isBuyer =
            inquiry.buyer._id.toString() === req.user._id.toString();

        if (!isSeller && !isBuyer) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view this inquiry"
            });
        }

        res.status(200).json({
            success: true,
            inquiry
        });

    } catch (error) {

        console.error("GET INQUIRY ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Seller marks inquiry as read
export const markAsRead = async (req, res) => {
    try {

        const inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        // Only seller can mark as read
        if (
            inquiry.seller.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        inquiry.isRead = true;

        await inquiry.save();

        res.status(200).json({
            success: true,
            message: "Inquiry marked as read"
        });

        console.log("Inquiry Seller:", inquiry.seller.toString());
        console.log("Logged User:", req.user._id.toString());

    } catch (error) {

        console.error("MARK AS READ ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};