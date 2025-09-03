const express = require('express');
const app = express();

// Simple health endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Basic server is working!',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 5002
    });
});

// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint working!',
        endpoints: [
            'GET /health',
            'GET /test'
        ]
    });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`🚀 Basic test server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`🔗 Test: http://localhost:${PORT}/test`);
});
