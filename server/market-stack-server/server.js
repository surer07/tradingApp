const express = require('express')
const {formatForClient} = require('./helpers')
const cors = require('cors')
const app = express()

app.set('trust proxy', true)

require('dotenv').config()

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.get('/stocks/tickers', async (req, res) => {
    try {
        const URL = `${process.env.MARKETSTACK_URL}/tickers?access_key=${process.env.MARKETSTACK_KEY}`;
        console.log("Attempting to fetch from URL:", URL);
        const response = await fetch(URL);
        const json = await response.json();
        if (!json || !json.data) {
            console.error("--- MARKETSTACK DETECTED ERROR ---", json);
            return res.status(400).json({
                error: "Marketstack did not return valid data structure",
                rawResponse: json
            });
        }
        const formattedData = formatForClient(json.data);
        res.json(formattedData);    
    } catch (error) {
        console.error("Network or parsing error in /stocks/tickers:", error);
        res.status(500).json({ error: "Internal Server Error connecting to Marketstack" });
    }
});

app.post('/stocks/tickers/info', async (req, res) => {
    const ticker = req.body.ticker
    const URL =  `${process.env.MARKETSTACK_URL}/eod?access_key=${process.env.MARKETSTACK_KEY}&symbols=${ticker}`
    const response = await fetch(URL)
    const json = await response.json()
    res.json({"stockInfo": json})
})

app.listen(process.env.PORT, () => {
        console.log('connected to db and listening on port ', process.env.PORT)
})