import dotenv from "dotenv";
import Groq from "groq-sdk";
import Express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

dotenv.config();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = Express();

app.use(cors({
    origin: 'https://ai-mailing-system.onrender.com/', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));
app.use(Express.json());

// Function to create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "adityaakanfade@gmail.com",
        pass: "zkaq dmst edgn pyrf"
    }
});

app.post("/generate/response", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const response = chatCompletion.choices[0]?.message?.content || "No response received.";

        const [, , ...emailParts] = response.split("\n");
        const email = emailParts.join("\n");
        res.json({ email });
    } catch (error) {
        console.error("Error during chat completion:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

app.post('/send/email', async (req, res) => {
    const { receiverEmail, placeholderEmail } = req.body;

    const [subject, ...messageParts] = placeholderEmail.split("\n");

    const message = messageParts.join("\n");

    const mailOptions = {
        from: "adityaakanfade@gmail.com",     // Sender's email
        to: receiverEmail,     // Recipient's email
        subject: subject,      // Subject of the email
        text: message          // Email body text
    };

    // Sending the email using nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
            return res.status(500).json({ message: 'Error sending email', error });
        }
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'Email sent successfully', info });
    });
});

app.listen(5000, () => {
    console.log("Express server is running on port 5000!")
})
