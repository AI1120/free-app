// Configuration for login system

// Target IP address where login credentials will be sent
// Change this to your actual target IP and port
const CONFIG = {
    // Local database backend
    DATABASE_API: 'http://localhost:3000',
    
    // REST API endpoint to send credentials
    TARGET_IP: 'http://192.168.130.148:8080',
    SEND_TO_IP_ENABLED: false,  // Set to true to use REST API
    
    // WebSocket real-time communication
    WEBSOCKET_ENABLED: true,
    WEBSOCKET_URL: 'ws://192.168.130.148:8080',  // Change to your server IP
    
    // Examples:
    // Local: 'ws://localhost:8080'
    // Network: 'ws://192.168.1.100:8080'
    // Remote: 'ws://example.com:8080'
};
