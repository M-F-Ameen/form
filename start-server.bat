@echo off
echo Starting Job Application Server...
echo.
echo MongoDB Connection: Checking...
echo.

cd /d "%~dp0"
node backend/minimal-server.js

pause 