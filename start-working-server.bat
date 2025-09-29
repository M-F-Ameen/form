@echo off
echo Starting Job Application Server...
echo.
echo This server will:
echo - Serve the job application form
echo - Handle form submissions (without file upload for now)
echo - Serve the admin panel
echo.
echo URLs:
echo - Job Form: http://localhost:3000
echo - Admin Panel: http://localhost:3000/admin
echo - API Test: http://localhost:3000/api/test
echo.

cd /d "%~dp0"
node backend/working-server.js

pause 