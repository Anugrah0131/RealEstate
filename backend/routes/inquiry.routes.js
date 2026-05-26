import express from 'express';

import {
    sendInquiry,
    getInquiriesForSeller,
    getInquiriesForBuyer,
    getInquiry,
    markAsRead
} from '../controllers/inquiry.controller.js';

import {
    protect,
    authorize
} from '../middlewares/auth.middleware.js';

const inquiryRouter = express.Router();


// Buyer sends inquiry
inquiryRouter.post(
    '/',
    protect,
    authorize('buyer'),
    sendInquiry
);


// Seller views received inquiries
inquiryRouter.get(
    '/seller',
    protect,
    authorize('seller'),
    getInquiriesForSeller
);


// Buyer views own inquiries
inquiryRouter.get(
    '/buyer',
    protect,
    authorize('buyer'),
    getInquiriesForBuyer
);


// Seller marks inquiry as read
inquiryRouter.patch(
    '/:id/read',
    protect,
    authorize('seller'),
    markAsRead
);


// IMPORTANT:
// Dynamic route MUST BE LAST
inquiryRouter.get(
    '/:id',
    protect,
    authorize('seller', 'buyer'),
    getInquiry
);

export default inquiryRouter;