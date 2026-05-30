import { text } from "express";
import mongoose from "mongoose";
import Property from "./property.model.js";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    Image: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// chat schema
const chatSchema = new mongoose.Schema({
    Property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: false
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: [messageSchema],
},{
   timestamps: true
}  
 );

 const Chat = mongoose.model("Chat", chatSchema);
 export default Chat;
