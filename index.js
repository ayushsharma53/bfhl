const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "ayush1146.be23@chitkarauniversity.edu.in";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Helper Functions
const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const getGCD = (a, b) => (!b ? a : getGCD(b, a % b));
const getLCM = (a, b) => (a * b) / getGCD(a, b);

app.get('/health', (req, res) => {
    res.status(200).json({
        "is_success": true,
        "official_email": OFFICIAL_EMAIL
    });
});

app.post('/bfhl', async (req, res) => {
    try {
        const keys = Object.keys(req.body);

        if (keys.length !== 1) {
            return res.status(400).json({ "is_success": false, "error": "Exactly one functional key required" });
        }

        const key = keys[0];
        const input = req.body[key];
        let resultData;

        switch (key) {
            case 'fibonacci': 
                const n = parseInt(input);
                if (isNaN(n) || n < 0) throw new Error("Invalid integer for Fibonacci");
                resultData = [0, 1];
                for (let i = 2; i < n; i++) {
                    resultData.push(resultData[i - 1] + resultData[i - 2]);
                }
                resultData = resultData.slice(0, n);
                break;

            case 'prime': 
                if (!Array.isArray(input)) throw new Error("Input must be an array");
                resultData = input.filter(num => isPrime(Number(num)));
                break;

            case 'lcm': 
                if (!Array.isArray(input) || input.length < 2) throw new Error("Array of at least 2 numbers required");
                resultData = input.reduce((acc, val) => getLCM(acc, val));
                break;

            case 'hcf': 
                if (!Array.isArray(input) || input.length < 2) throw new Error("Array of at least 2 numbers required");
                resultData = input.reduce((acc, val) => getGCD(acc, val));
                break;

            case 'AI': 
                const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});
                // console.log("Key loaded:", process.env.GEMINI_API_KEY)
                const prompt = `${input}. Respond with only a single word.`;
                const aiResult = await model.generateContent(prompt);
                resultData = aiResult.response.text().trim().replace(/[^\w]/g, '');
                break;

            default:
                return res.status(400).json({ "is_success": false, "error": "Invalid key" });
        }

        res.status(200).json({
            "is_success": true,
            "official_email": OFFICIAL_EMAIL,
            "data": resultData
        });

    } catch (error) {
        res.status(400).json({
            "is_success": false,
            "error": error.message
        });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));