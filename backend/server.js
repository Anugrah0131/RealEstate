import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import authRouter from './routes/auth.routes.js'
import { connectDB } from './config/db.js'
import userRouter from './routes/user.routes.js'
import propertyRouter from './routes/property.routes.js'
import inquiryRouter from './routes/inquiry.routes.js'
import wishlistRouter from './routes/wishlist.routes.js'
import contactRouter from './routes/contact.routes.js'
import adminRouter from './routes/admin.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

//DB
connectDB();

//Middlewares
app.use(cors())
app.use(express.json())

//Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);

app.get("/", (req, res) => {
    res.send("API WORKING");
})  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})                  