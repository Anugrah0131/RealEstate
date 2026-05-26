import mongoose from "mongoose";
import User from "./user.model";
import Property from "./property.model";

const wishlistSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    Property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property"
    }
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;