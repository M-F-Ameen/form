@echo off
echo ========================================
echo    Job Application Form Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
npm install
echo.

echo Step 2: Creating uploads directory...
if not exist "backend\uploads" mkdir backend\uploads
echo.

echo Step 3: Creating .env file...
if not exist "backend\.env" (
    copy backend\env.example backend\.env
    echo.
    echo IMPORTANT: Please edit backend\.env file and add your MongoDB Atlas connection string!
    echo.
) else (
    echo .env file already exists
)
echo.

echo Step 4: Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env file with your MongoDB Atlas connection string
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo 4. Admin panel: http://localhost:3000/admin.html
echo.

pause 