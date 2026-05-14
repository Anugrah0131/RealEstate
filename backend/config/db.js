import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://anugrah_realestate:EzrR0qmxY5Xt9EOl@cluster0.x9k7y6v.mongodb.net/RealEstate")

    .then(() => {
      console.log("Connected to MongoDB");
    });
 
  
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}