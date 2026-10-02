import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "VendorHub <onboarding@resend.dev>",
            to: [options.email],
            subject: options.subject,
            html: options.message
        });

        if (error) {
            console.error("RESEND ERROR:", error);
            throw new Error(error.message);
        }

        console.log("EMAIL SENT:", data);
        return data;
    } catch (error) {
        console.error("EMAIL ERROR:", error);
        throw error;
    }
};

export default sendEmail;
