import React, { useState } from "react";
import { addPropertyStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";

const AddProperty = () => {

    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        city: "",
        area: "",
        pincode: "",
        propertyType: "flat",
        bhk: "",
        bathrooms: "",
        areaSize: "",
        furnishing: "unfurnished",
        status: "sale",
        amenities: [],
        securityDeposit: "",
        maintenance: "",
    });

    const commonAmenities = [
        "Parking",
        "Pool",
        "Gym",
        "Security",
        "Wifi",
        "Power Backup",
        "Club House",
        "Garden",
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAmenityChange = (amenity) => {
        setFormData((prev) => {
            const current = prev.amenities || [];
            if (current.includes(amenity)) {
                return { ...prev, amenities: current.filter((a) => a !== amenity) };
            } else {
                return { ...prev, amenities: [...current, amenity] };
            }
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 10) {
            setError("You can only upload 10 images.");
            return;
        }

        setImages((prev) => [...prev, ...files]);
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previews]);
    };

    // to remove an image
    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // to submit and create a new listings
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "amenities") {
                formData[key].forEach((a) => data.append("amenties", a));
            } else {
                data.append(key, formData[key]);
            }
        });
        images.forEach((img) => data.append("images", img));

        try {
            await axios.post(`${API_URL}/api/properties`, data, {
                headers: {
                    "Context-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate("/dashboard");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to add property");
            setLoading(false);
        }
    };

    return (
        <div className={s.outerContainer}>
            <div className={s.innerContainer}>
                <div className={s.header}>
                    <h1 className={s.heading}>List Your Property</h1>
                    <p className={s.subheading}>
                        Fill in the details below to reach thousands of potential buyers.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={s.form}>
                    {error && <div className={s.error}>{error}</div>}

                    <div className={s.section}>
                        <div className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}>
                            <div className={s.sectionBar}></div>
                            <h3 className={s.sectionTitle}>Content & Desciption</h3>
                        </div>
                        <div className={s.contentGroupLarge}>
                            <div>
                                <label className={s.label}>Property Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Luxury 3BHK Apartment in Downtown"
                                    className={s.input}
                                    required
                                />
                            </div>
                            <div>
                                <label className={s.label}>Detailed Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the property highlights..."
                                    className={`${s.input} ${s.textarea}`}
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className={s.twoColumnGrid}>
                        <div>
                            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
                            >
                                <div className={s.sectionBar}></div>
                                <h3 className={s.sectionTitle}>Property Details</h3>
                            </div>
                            <div className={s.contentGroupMedium}>
                                <div>
                                    <label className={s.labelSmallMargin}>Property Type</label>
                                    <select
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleInputChange}
                                        className={`${s.input} ${s.select}`}
                                    >
                                        <option value="flat">Flat/Apartment</option>
                                        <option value="villa">Independent House/Villa</option>
                                        <option value="penthouse">Penthouse</option>
                                        <option value="commercial">Commercial</option>

                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddProperty