@echo off
echo Setting up database with login_attempts table...
echo.

REM Run the SQL setup file
psql -U postgres -f setup.sql

echo.
echo Database setup complete!
echo.
echo The following tables have been created:
echo - users (for legitimate user accounts)
echo - login_attempts (for captured login data with IP addresses)
echo.
echo You can now:
echo 1. Start the main server: node server.js
echo 2. Start the receiver server: node receiver-server.js  
echo 3. View captured data at: http://localhost:3000/admin.html
echo.
pause