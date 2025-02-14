const twilio = require('twilio');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Store user state (e.g., what option they selected)
let userState = {};

app.post('/api/webhook', async (req, res) => {
    const incomingMessage = req.body.Body.toLowerCase();
    const from = req.body.From;

    if (!userState[from]) {
        // Initial message
        if (incomingMessage === 'hi' || incomingMessage === 'hello' || incomingMessage === 'hey') {
            userState[from] = { step: 'initial' };
            sendMessage(from, 'Hello, welcome to FindApp! What are you looking for?\nA] WORKING PROFESSIONALS\nB] WORK');
        }
    } else if (userState[from].step === 'initial') {
        // Handle user's choice
        if (incomingMessage === 'a') {
            userState[from] = { step: 'professionals', choice: 'A' };
            sendMessage(from, 'You selected A: WORKING PROFESSIONALS. Please provide the location (e.g., "Bengaluru").');
        } else if (incomingMessage === 'b') {
            userState[from] = { step: 'work', choice: 'B' };
            sendMessage(from, 'You selected B: WORK. Please provide the location (e.g., "Udupi").');
        } else {
            sendMessage(from, 'Invalid option. Please select A or B.');
        }
    } else if (userState[from].step === 'professionals' || userState[from].step === 'work') {
        if (!userState[from].location) {
            // Collect location
            userState[from].location = incomingMessage;
            sendMessage(from, 'Got it! Now, please provide the title (e.g., "electrician").');
        } else if (!userState[from].title) {
            // Collect title
            userState[from].title = incomingMessage;

            // Generate link
            let link;
            if (userState[from].choice === 'A') {
                link = `https://www.findapp.com/gig/giworkerspool?title=${userState[from].title}&location=${userState[from].location}`;
            } else if (userState[from].choice === 'B') {
                link = `https://www.findapp.com/gigs?title=${userState[from].title}&location=${userState[from].location}`;
            }

            // Send link
            sendMessage(from, `Here’s your link: ${link}`);

            // Clear user state
            delete userState[from];
        }
    }

    res.status(200).end();
});

function sendMessage(to, message) {
    client.messages.create({
        body: message,
        from: 'whatsapp:+14155238886', // Twilio WhatsApp Sandbox number
        to: to
    });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the Express app as a serverless function
module.exports = app;


// const express = require('express');
// const twilio = require('twilio');
// const dotenv = require('dotenv');

// dotenv.config();
// const app = express();
// app.use(express.urlencoded({ extended: true }));

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);


// let userState = {};

// app.post('/', async (req, res) => {
//     const incomingMessage = req.body.Body.toLowerCase();
//     const from = req.body.From;

//     if (!userState[from]) {
//         // Initial message
//         if (incomingMessage === 'hi' || incomingMessage === 'hello') {
//             userState[from] = { step: 'initial' };
//             sendMessage(from, 'Hello, welcome to FindApp! What are you looking for?\nA] WORKING PROFESSIONALS\nB] WORK');
//         }
//     } else if (userState[from].step === 'initial') {
//         // Handle user's choice
//         if (incomingMessage === 'a') {
//             userState[from] = { step: 'professionals', choice: 'A' };
//             sendMessage(from, 'You selected A: WORKING PROFESSIONALS. Please provide the location (e.g., "Bengaluru").');
//         } else if (incomingMessage === 'b') {
//             userState[from] = { step: 'work', choice: 'B' };
//             sendMessage(from, 'You selected B: WORK. Please provide the location (e.g., "Udupi").');
//         } else {
//             sendMessage(from, 'Invalid option. Please select A or B.');
//         }
//     } else if (userState[from].step === 'professionals' || userState[from].step === 'work') {
//         if (!userState[from].location) {
//             // Collect location
//             userState[from].location = incomingMessage;
//             sendMessage(from, 'Got it! Now, please provide the title (e.g., "electrician").');
//         } else if (!userState[from].title) {
//             // Collect title
//             userState[from].title = incomingMessage;

//             // Generate link
//             let link;
//             if (userState[from].choice === 'A') {
//                 link = `https://www.findapp.com/gig/giworkerspool?title=${userState[from].title}&location=${userState[from].location}`;
//             } else if (userState[from].choice === 'B') {
//                 link = `https://www.findapp.com/gigs?title=${userState[from].title}&location=${userState[from].location}`;
//             }

//             // Send link
//             sendMessage(from, `Here’s your link: ${link}`);

//             // Clear user state
//             delete userState[from];
//         }
//     }

//     res.status(200).end();
// });

// function sendMessage(to, message) {
//     client.messages.create({
//         body: message,
//         from: 'whatsapp:+14155238886', // Your Twilio WhatsApp Sandbox number
//         to: to
//     });
// }

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
