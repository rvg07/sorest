import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
const resultEnv = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (resultEnv.error) {
    console.error('[Proxy] Error loading .env file:', resultEnv.error);
    process.exit(1);
} else {
    console.log('[Proxy] .env file loaded successfully.');
}

const app = express();
const LISTEN_ADDRESS = process.env.LISTEN_ADDRESS || 'localhost';
const PORT = process.env.PROXY_PORT || 3001;
app.use(express.json());

const allowedOriginsString = process.env.ALLOWED_ORIGINS;
let allowedOrigins;

console.log(`[Proxy] ALLOWED_ORIGINS from .env: ${allowedOriginsString}`); // Added tag for clarity

if (process.env.NODE_ENV === 'development') {
    const frontEndDevOrigin = 'http://localhost:5173';
    allowedOrigins = [frontEndDevOrigin];
    console.log(`[Proxy] Development Mode: Allowing CORS for FRONTEND origin: ${frontEndDevOrigin}`);
} else if (allowedOriginsString) {
    allowedOrigins = allowedOriginsString.split(',').map(origin => origin.trim());
    console.log(`[Proxy] Production Mode: Allowing CORS for FRONTEND origins: ${allowedOrigins.join(', ')}`);
} else {
    allowedOrigins = [];
    console.warn('[Proxy] Production Mode: No ALLOWED_ORIGINS environment variable set. CORS is disabled.');
}

const corsOptions = {
    origin: (origin, callback) => {
        console.log(origin)
        console.log(allowedOrigins)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`[Proxy] Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));

// --- Proxy Endpoint ---
app.post('/proxy-request', async (req, res) => {
    const { targetUrl, method, headers, data } = req.body;

    console.log(`[Proxy] --> Received request for: ${method} ${targetUrl}`);

    if (!targetUrl || !method) {
        console.error('[Proxy] Missing targetUrl or method.');
        return res.status(400).json({
            error: true,
            message: 'Proxy request requires "targetUrl" and "method" in the JSON body.'
        });
    }

    try {
        const headersToForward = { ...headers };
        const headersToRemove = ['host', 'connection', 'content-length', 'origin', 'referer', 'user-agent'];
        headersToRemove.forEach(h => delete headersToForward[h]);

        console.log(`[Proxy] Making request to target with method: ${method}`);
        const response = await axios({
            method: method,
            url: targetUrl,
            headers: {
                ...headersToForward
            },
            data: data,
            timeout: 30000,
            responseType: 'text',
            transformResponse: [(d) => d],
            validateStatus: (status) => status >= 100 && status < 600,
        });

        console.log(`[Proxy] <-- Target response status: ${response.status}`);

        const forwardedHeaders = {};
        for (const key in response.headers) {
            if (Object.prototype.hasOwnProperty.call(response.headers, key) &&
                !['content-encoding', 'transfer-encoding', 'connection', 'strict-transport-security', 'content-security-policy', 'set-cookie'].includes(key.toLowerCase())) {
                forwardedHeaders[key] = response.headers[key];
            }
        }

        res.status(200).json({
            status: response.status,
            statusText: response.statusText,
            headers: forwardedHeaders,
            data: response.data,
            error: response.status >= 400,
        });

    } catch (error) {
        console.error('[Proxy] Error during target request:', error.message);
        const axiosError = error;
        if (axiosError.response) {
            res.status(502).json({ error: true, status: axiosError.response.status, message: `Proxy Target Error (${axiosError.response.status})` });
        } else if (axiosError.request) {
            res.status(504).json({ error: true, status: null, message: 'Proxy Target Timeout or Unreachable' });
        } else {
            res.status(500).json({ error: true, status: null, message: `Proxy Internal Error: ${axiosError.message}` });
        }
    }
});

app.listen(PORT, LISTEN_ADDRESS, () => {
    console.log(`Backend Proxy Server listening on http://${LISTEN_ADDRESS}:${PORT}`);
});