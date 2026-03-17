@echo off
echo Starting Online Server...
echo.
echo Make sure you have:
echo 1. Created a .env file with your DATABASE_URL
echo 2. Set up your online database (Neon, Supabase, etc.)
echo.
echo Server will start on http://localhost:3000
echo Admin panel: http://localhost:3000/admin.html
echo.
cd /d "%~dp0database"
node server-online.js
pause