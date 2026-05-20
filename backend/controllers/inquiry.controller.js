import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";

//Buyer send inquiry to seller
export const sendInquiry = async (req, res) => {
    try {
        const { propertyId, message } = req.body;
        const property = await Property.findById(propertyId).populate("seller");

        if (!property) {
            return res.status(404).json
            ({  success: false,
                 message: "Property not found" });

        }
        const inquiry = await Inquiry.create({
            property: property._id,
            buyer: req.user._id,
            seller: property.seller._id,
            message,
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

//Seller views inquiries
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
        console.error("GET INQUIRIES ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//mark inquiries read
export const markAsRead = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        inquiry.isRead = true;
        await inquiry.save();

        res.status(200).json({
            success: true,
            message: "Inquiry marked as read"
        });

    } catch (error) {
        console.error("MARK AS READ ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

