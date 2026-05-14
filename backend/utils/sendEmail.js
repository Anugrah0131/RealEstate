import axios from "axios";

const sendEmail = async (options) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();

        if (!BREVO_API_KEY) {
            console.error("Missing BREVO_API_KEY in .env file");
            throw new Error("Missing email API key");
        }

        const data = {
            sender: {
                name: "Real Estate",
                email: process.env.EMAIL_USER,
            },
            to: [
                {
                    email: options.email,
                },
            ],
            subject: options.subject,
            htmlContent: options.message,
        };

        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": BREVO_API_KEY,
                },
            }
        );

        console.log("Email sent successfully:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Email sending failed:",
            error.response?.data || error.message
        );

        throw new Error("Failed to send email");
    }
};

export default sendEmail;