const PORT = 9005;
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;

app.post('/completions', async (req, res) => {
    // Adding the tech dev instruction to the user's input
    const modifiedMessages = req.body.messages.map((message) => {
        if (message.role === "user") {
            return {
                ...message,
                content: "Bunu bir tech dev olarak yanıtla. " + message.content,

            };
        }
        return message;
    });

    const options = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // Switching to a faster model
            messages: modifiedMessages, // Use the modified messages with the tech dev instruction
            max_tokens: 1000,
        }),
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        res.send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while processing the request.");
    }
});

