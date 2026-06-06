import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiCurrencyDollar, HiHome, HiLightningBolt, HiLocationMarker, HiOfficeBuilding, HiShieldCheck, HiVideoCamera, HiSearch } from "react-icons/hi";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import axios from "axios";

import Navbar from "../../components/common/Navbar";
import { landingPageStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../config";
import banner from "../../assets/bannerimage.png";
import PropertyCard from "../../components/common/PropertyCard";

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [propertyType, setPropertyType] = useState("Select Type");

    const [wishlistIds, setWishlistIds] = useState([]);

    const [propertyCount, setPropertyCount] = useState({
        flat: 0,
        villa: 0,
        penthouse: 0,
        commercial: 0,
    });

    useEffect(() => {
        fetchProperties();
        fetchCounts();

        if (user && token) {
            fetchWishlist();
        }
    }, [user, token]);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setWishlistIds(
                res.data
                    .filter((item) => item.propertyId)
                    .map((item) => String(item.propertyId._id))
            );
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        }
    };

    // to add/remove from wishlist
    const handleToggleWishlist = async (propertyId) => {
        try {
            const exists = wishlistIds.includes(propertyId);

            if (exists) {
                await axios.delete(
                    `${API_URL}/api/wishlist/${propertyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setWishlistIds((prev) =>
                    prev.filter((id) => id !== propertyId)
                );
            } else {
                await axios.post(
                    `${API_URL}/api/wishlist/${propertyId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setWishlistIds((prev) => [...prev, propertyId]);
            }
        } catch (err) {
            console.error("Wishlist update error:", err);
        }
    };

    const fetchCounts = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/properties/counts`
            );

            if (res.data.success) {
                setPropertyCount({
                    flat: res.data.flat || 0,
                    villa: res.data.villa || 0,
                    penthouse: res.data.penthouse || 0,
                    commercial: res.data.commercial || 0,
                });
            }
        } catch (err) {
            console.error("Count fetch error:", err);
        }
    };

    const fetchProperties = async (city = "") => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${API_URL}/api/properties?city=${city}`
            );

            setProperties(res.data.properties || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch properties.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();

        if (searchTerm.trim()) {
            params.append("city", searchTerm);
        }

        if (
            propertyType &&
            propertyType !== "Select Type"
        ) {
            params.append("type", propertyType);
        }

        navigate(`/properties?${params.toString()}`);
    };

    const categories = [
        {
            name: "Modern Flats",
            count: propertyCount.flat || 0,
            icon: <HiOfficeBuilding size={32} />,
            type: "flat",
        },
        {
            name: "Luxury Villas",
            count: propertyCount.villa || 0,
            icon: <HiHome size={32} />,
            type: "villa",
        },
        {
            name: "Penthouse",
            count: propertyCount.penthouse || 0,
            icon: <HiOfficeBuilding size={32} />,
            type: "penthouse",
        },
        {
            name: "Commercial",
            count: propertyCount.commercial || 0,
            icon: <HiOfficeBuilding size={32} />,
            type: "commercial",
        },
    ];

    const features = [
        {
            title: "Verified Trust",
            desc: "Every listing is strictly audited for ownership, condition, and legality.",
            icon: <HiShieldCheck size={24} />,
        },
        {
            title: "Smart Search",
            desc: "Our AI-driven algorithms help you find the best matches based on preferences.",
            icon: <HiLightningBolt size={24} />,
        },
        {
            title: "Best Value",
            desc: "Direct-from-owner listings and zero-commission options to ensure competitive prices.",
            icon: <HiCurrencyDollar size={24} />,
        },
        {
            title: "Virtual Tours",
            desc: "High-definition 3D tours allow you to experience the property from home.",
            icon: <HiVideoCamera size={24} />,
        },
    ];

    return (
        <div className={s.bgMain}>
            <Navbar />

            <section className={s.heroSection}>
                <div className={s.heroContent}>
                    <span className={s.badge}>
                        Trusted by 20,000 homeowners
                    </span>

                    <h1 className={s.heroTitle}>
                        Find Your
                        <span className={s.textGradient}>
                            {" "}Perfect{" "}
                        </span>
                        Next Chapter.
                    </h1>

                    <p className={s.heroSubtitle}>
                        Discover your dream home with us.
                        Browse our extensive listings and
                        find the perfect property for you.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className={s.searchForm}
                    >
                        <div className={s.searchField}>
                            <div className={s.textPrimary}>
                                <HiLocationMarker size={26} />
                            </div>

                            <div className={s.flexCol}>
                                <label className={s.labelSmall}>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    placeholder="Where are you looking?"
                                    className={s.inputTransparent}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className={s.searchDivider}></div>
                        <div className={s.searchField}>
                            <div className={s.textPrimary}>
                                <HiHome size={26} />
                                <div className={s.flexCol}>
                                    <label className={s.labelSmall}>Property Type</label>
                                    <select
                                        value={propertyType}
                                        onChange={(e) => setPropertyType(e.target.value)}
                                        className={`${s.inputTransparent} cursor-pointer`}
                                    >
                                        <option value="Select Type">Select Type</option>
                                        <option value="flat">Flat/Apartment</option>
                                        <option value="villa">Villa/House</option>
                                        <option value="penthouse">Penthouse</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={s.searchButton}
                        >
                            <HiSearch size={22} /> Search
                        </button>
                    </form>
                    {/* stats  */}
                    <div className={s.statsContainer}>
                        <div className={s.statItemFlex}>
                            <h3 className={s.statNumber}>12k+</h3>
                            <p className={s.statLabel}>Ready Properties</p>
                        </div>
                        <div className={s.statItemBorder}>
                            <h3 className={s.statNumber}>8k+</h3>
                            <p className={s.statLabel}>Verified Owners</p>
                        </div>
                        <div className={s.statItemBorder}>
                            <h3 className={s.statNumber}>4.9/5</h3>
                            <p className={s.statLabel}>User Rating</p>
                        </div>
                        <div className={s.statItemBorder}>
                            <h3 className={s.statNumber}>500+</h3>
                            <p className={s.statLabel}>Cities Covered</p>
                        </div>
                    </div>
                </div>

                {/* hero image */}
                <div className={s.heroImageContainer}>
                    <div className={s.imageWrapper}>
                        <img
                            src={banner}
                            alt="banner"
                            className={s.heroImage}
                        />
                        <div className={s.verifiedBadge}>
                            <div className={s.badgeIconWrapper}>
                                <HiShieldCheck size={24} className=" text-primary" />
                            </div>
                            <div>
                                <h4 className={s.badgeTitle}>Verified Listings</h4>
                                <p className={s.badgeText}>Inspected by our professional team</p>
                            </div>
                            <span className={s.preApproved}>Pre-approved</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* categories section */}
            <section className={s.categorySection}>
                <div className={s.container}>
                    <div className={s.categoryHeader}>
                        <div className={s.categoryHeaderText}>
                            <h2 className={s.categoryTitle}>Explore by Category</h2>
                            <p className={s.categoryDescription}>
                                Browse our wide range of properties across different categories
                            </p>
                        </div>
                    </div>
                    <div className={s.categoryGrid}>
                        {categories.map((cat, idx) => (
                            <div
                                key={idx}
                                className={s.categoryCard}
                                onClick={() => navigate(`/properties?type=${cat.type}`)}
                            >
                                <div className={s.categoryIconwrapper}>{cat.icon}</div>
                                <h3 className={s.categoryName}>{cat.name}</h3>
                                <p className={s.categoryCount}>{cat.count.toLocaleString()} Properties</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* features section */}
            <section className={s.featuresSection}>
                <div className={s.featuresContainer}>
                    <div className={s.featuresList}>
                        {features.map((f, idx) => (
                            <div key={idx} className={s.featureCard} style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className={s.featureIconWrapper}>{f.icon}</div>
                                <h3 className={s.featureTitle}>{f.title}</h3>
                                <p className={s.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className={s.featuresContent}>
                        <h2 className={s.featuresHeading}>Why Choose Us?</h2>
                        <p className={s.featuresSubtext}>
                            We've reinvented the property search experience from the ground
                            up. By focusing on transparency, technological precision, and
                            user-centric design, we help you find not just a house, but a
                            home.
                        </p>

                        <ul className={s.featuresListItems}>
                            {[
                                "Direct connection with certified agents",
                                "Real-time market valuation data",
                                "Secure document management system",
                                "24/7 Premium customer support",
                            ].map((item, idx) => (
                                <li key={idx} className={s.listItem}>
                                    <HiLightningBolt className="text-primary" />
                                    {item}
                                </li>

                            ))}
                        </ul>
                        <a href="#process" className={s.learnMoreLink}>
                            Learn More About Our Process &rarr;
                        </a>
                    </div>
                </div>
            </section>

            {/* how it works section */}
            <section id="process" className={s.processSection}>
                <div className={s.container}>
                    <div className={s.processHeader}>
                        <span className={s.proccessBadge}>How It Works</span>
                        <h2 className={s.processTitle}>
                            Our Seamless <span className={s.textGradient}>Process</span>
                        </h2>
                        <p className={s.processSubtitle}>
                            Discover how our innovative approach makes property searching effortless and efficient.
                        </p>
                    </div>

                    <div className={s.processGrid}>
                        {[
                            {
                                step: "01",
                                title: "Smart Search",
                                desc: "Leverage our AI-driven Smart Search algorithms to find the best property matches tailored to your specific preferences.",
                                icon: <HiLightningBolt size={32} />,
                            },
                            {
                                step: "02",
                                title: "Virtual Tours",
                                desc: "Experience your future home from anywhere with our high-definition 3D virtual tours and immersive walkthroughs.",
                                icon: <HiVideoCamera size={32} />,
                            },
                            {
                                step: "03",
                                title: "Verified Trust",
                                desc: "Every listing is strictly audited for ownership and condition, ensuring your peace of mind and a secure transaction.",
                                icon: <HiShieldCheck size={32} />,
                            },
                        ].map((p, idx) => (
                            <div key={idx} className={s.processCard}>
                                <div className={s.stepNumber}>{p.step}</div>
                                <div className={s.processIconWrapper}>{p.icon}</div>
                                <h3 className={s.processCardTitle}>{p.title}</h3>
                                <p className={s.processCardDesc}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* feature collection section */}
            <section className={s.featuredSection}>
                <div className={s.container}>
                    <div className={s.featuredHeader}>
                        <span className={s.featuredBadge}>Handpicked For You</span>
                        <h2 className={s.featuredTitle}>
                            Featured Properties
                        </h2>
                        <p className={s.featuredSubtitle}>
                            Discover the powerful tools and features that make our platform stand out.
                        </p>

                    </div>
                    {loading ? (
                        <div className={s.loadingContainer}>
                            <div className={s.loader}></div>
                        </div>
                    ) : error ? (
                        <div className={s.errorContainer}>
                            <p className={s.errorMessage}>{error}</p>
                        </div>
                    ) : (
                        <div className={s.propertiesGrid}>
                            {properties
                                .filter((p) => p)
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 6)
                                .map((property) => (
                                    <PropertyCard
                                        key={property._id}
                                        property={property}
                                        isWishlisted={wishlistIds.includes(String(property._id))}
                                        onToggleWishlist={handleToggleWishlist}
                                    />
                                ))}
                        </div>
                    )}

                    <div className={s.discoverButton}>
                        <button 
                        onClick={() => navigate("/properties")}
                        className={s.discoverButton}
                        >
                            Discover More Properties
                        </button>
                    </div>
                </div>
            </section>

            {/* footer */}
            <footer className={s.footer}>
                <div className={s.container}>
                    <div className={s.footerMainGrid}>
                        <div className={s.footerBrand}>
                            <div className={s.brandLogo}>
                                <div className={s.brandIcon}>RE</div>
                                    RealEstate
                                
                            </div>
                            <p className={s.brandDesc}>
                                Your trusted partner in real estate.
                            </p>

                            <div className={s.socialIcons}>
                                {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
                                    (Icon, idx) => (
                                        <a href="#" key={idx} className={s.socialIcon} target="_blank" rel="noopener noreferrer">
                                            <Icon size={20} />
                                        </a>
                                    ),
                                )}
                            </div>
                    </div>
                        </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;