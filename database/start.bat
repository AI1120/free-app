@echo off
echo ========================================
echo  Freelancer Login Backend Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Starting server...
echo.
node server-online.js

pause
