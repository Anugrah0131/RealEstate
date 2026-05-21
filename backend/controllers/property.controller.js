import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";

// Add a property

export const addProperty = async (req, res) => {
    try {
        let Imageurls = [];
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const result = await uploadToCloudinary(file.buffer);
                Imageurls.push(result.secure_url);
            }
        }
        const property = new Property({
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            city: req.body.city,
            area: req.body.area,
            pincode: req.body.pincode,
            propertyType: req.body.propertyType,
            bhk: req.body.bhk ? String(req.body.bhk) : undefined,
            bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
            areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
            furnishing: req.body.furnishing,
            status: req.body.status,
            images: Imageurls,
            seller: req.user._id,  //as seller can only create a property
            amenties: req.body.amenties
                ? Array.isArray(req.body.amenties)
                    ? req.body.amenties
                    : (() => {
                        try {
                            return JSON.parse(req.body.amenties);
                        } catch (e) {
                            return req.body.amenties.split(",");
                        }
                    })()
                : [],
        });

        await property.save();

        res.json({
            success: true,
            property
        });


    } catch (error) {
        console.error("ADD PROPERTY ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// to get all properties of a seller

export const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({ seller: req.user._id });
        res.json({
            success: true,
            properties
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// update property

export const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        if (property.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this property"
            });
        }

        const fields =
            ["title",
                "description",
                "price",
                "city",
                "pincode",
                "propertyType",
                "bhk",
                "bathrooms",
                "areaSize",
                "furnishing",
                "status",
                "amenties"];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === "amenties" && typeof req.body[field] === "string") {
                    try {
                        property[field] = JSON.parse(req.body[field]);
                    } catch (e) {
                        property[field] = req.body[field].split(",");
                    }
                } else {
                    property[field] = req.body[field];
                }
            }
        });

        //for image handling
        if (req.body.existingImages) {
            try {
                const existing = JSON.parse(req.body.existingImages);
                property.images = Array.isArray(existing) ? existing : property.images;
            } catch (e) {
                console.error("Failed to parse existing images:", e);
            }
        }  //deleting existing image


        //uploading new image if exist the old one
        if (req.files && req.files.length > 0) {
            let newImageUrls = [];
            for (let file of req.files) {
                const result = await uploadToCloudinary(file.buffer, "properties");
                newImageUrls.push(result.secure_url);
            }
            property.images = [...property.images, ...newImageUrls];
        }
        await property.save();

        res.json({
            success: true,
            message: "Property updated successfully",
            property,//updated data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,

        });
    }
};

// to delete property

export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }
            // ceck the ownership
        if (property.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this property"
            });
        }

        // dlete image from cloudinary
        for (let imageUrl of property.images) {
            const publicId = imageUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`properties/${publicId}`); // Assuming images are stored in 'properties' folder
        }

        await property.deleteOne();

        res.json({
            success: true,
            message: "Property deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


//update property status

export const updatePropertyStatus = async (req, res) => {
    try {
       const property = await Property.findById(req.params.id);
       if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found"
        });
       } 

       //check the ownership
         if (property.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this property status"
            });
            
        }

        property.status = req.body.status;
        await property.save();
        res.json({
            success: true,
            message: "Property status updated successfully",
                property
            });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// to get all the properties
export const getAllProperties = async (req, res) => {
    try {
        const {
            city,
            area,
            pincode,
            propertyType,
            bhk,
            status,
            minPrice,
            maxPrice,
            amenties,
            sort,
            seller,
            furnishing,
        } = req.query;

        let query = {
            status: "sale",
        };

        if (seller) query.seller = seller;
        if (city) query.city = new RegExp(city, "i");
        if (area) query.area = new RegExp(area, "i");
        if (pincode) query.pincode = pincode;

        if (propertyType) {
            query.propertyType = { $in: propertyType.toLowerCase().split(",") };
        }

        if (bhk) {
            if (bhk === "5+") {
                query.bhk = { $gte: 5 };
            } else {
                query.bhk = bhk;
            }
        }

        if (furnishing) {
            const furnishingArray = furnishing.split(",");
            query.furnishing = {
                $in: furnishingArray.map((f) => new RegExp(`^${f.trim()}$`, "i"))
            };
        }

        if (status) query.status = status;

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
        if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
        if (Object.keys(query.price).length === 0) delete query.price;
    }
   
    if (amenties) {
        query.amenties = {
            $in: amenties.split(",").map((a) => a.trim())
        };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };
    if (sort === "latest") sortOption = { createdAt: -1 };
    
    const properties = await Property.find(query).sort(sortOption).populate("seller", "name phone profilePic");

    res.json({
        success: true,
        count: properties.length,
        properties,
    });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// to get single property details

export const getPropertyDetails = async (req, res) => { 
    try {
        const property = await Property.findById(req.params.id).populate("seller", "name phone profilePic");
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // unique view tracking by id
        let visitorId = req.ip;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                visitorId = decoded.id;
            }
            catch (e) { 
                //ignore
            }
        }

        const isSellerCheking = visitorId === property.seller._id.toString();
        if (!isSellerCheking && !property.viewedBy.includes(visitorId)) {
            property.views += 1;
            property.viewedBy.push(visitorId);
            await property.save();
        }

        const similarProperties = await Property.find({
            _id: { $ne: property._id },
            city: property.city,
            propertyType: property.propertyType,
            status: property.status
        })
        .limit(4)
        .select("title price city propertyType images");

        res.json({
            success: true,
            property,
            similarProperties
        });
    }

    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// seller dashboard

export const getSellerDashboard = async (req, res) => {

    try {
        const sellerId = req.user._id;
        const totalProperties = await Property.countDocuments({ seller: sellerId });
        const activeListings = await Property.countDocuments({
            seller: sellerId,
            status: "active"
        });
        const soldProperties = await Property.countDocuments({
            seller: sellerId,
            status: "sold"
        });

        const totalInquiries = await Inquiry.countDocuments({ seller: sellerId});

        // calculate total views for all properties
        const viewData = await Property.aggregate([
            { $match: { seller: sellerId}},
            { $group: {_id: null, totalViews: { $sum: "$views" }}},
        ]);
        const totalViews = viewData.length > 0 ? viewData[0].totalViews : 0;

        res.json({
            success: true,
            status: {
                totalProperties,
                activeListings,
                soldProperties,
                totalInquiries,
                totalViews
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// get property counts by type
export const getPropertyCountsByType = async (req, res) => {
    try {
        const counts = await Property.aggregate([
            { $match: { status: "sale" } },
            { $group: { _id: "$propertyType", count: { $sum: 1 } } }
        ]);

        const formattedCounts = counts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.json({
            success: true,
            counts: formattedCounts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:"Internal server error while fetching property counts by type",
            error: error.message
        });
    }
};

