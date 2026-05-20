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
                    "api-key": BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        const result = response.data;

        if (response.status >= 200 && response.status < 300) {
            console.log("Email sent successfully:", result);
            return result;
        } else {
            console.error("Email sending failed:", result);
            throw new Error(result.message || "Failed to send email");
        }
       
    } catch (error) {
        console.error(
            "Email sending failed:",
            error.response?.data || error.message
        );

        throw new Error("Failed to send email");
    }
};

export default sendEmail;