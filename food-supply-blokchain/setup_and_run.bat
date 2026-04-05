@echo off
setlocal EnableDelayedExpansion

echo ===================================================
echo   Food Supply Blockchain - Setup ^& Run Script
echo ===================================================
echo.
echo This script will open VS Code terminals for each service
echo.

:: Get the project root directory
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Create VS Code tasks configuration for running the services
if not exist ".vscode" mkdir ".vscode"

:: Create tasks.json for VS Code terminal integration
(
echo {
echo     "version": "2.0.0",
echo     "tasks": [
echo         {
echo             "label": "1. Backend Server",
echo             "type": "shell",
echo             "command": "npm start",
echo             "options": {
echo                 "cwd": "${workspaceFolder}/backend"
echo             },
echo             "isBackground": true,
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated",
echo                 "group": "services"
echo             }
echo         },
echo         {
echo             "label": "2. Next.js Frontend",
echo             "type": "shell",
echo             "command": "npm run dev",
echo             "options": {
echo                 "cwd": "${workspaceFolder}"
echo             },
echo             "isBackground": true,
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated",
echo                 "group": "services"
echo             }
echo         },
echo         {
echo             "label": "Start All Services",
echo             "dependsOn": [
echo                 "1. Backend Server",
echo                 "2. Next.js Frontend"
echo             ],
echo             "dependsOrder": "parallel",
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always"
echo             },
echo             "group": {
echo                 "kind": "build",
echo                 "isDefault": true
echo             }
echo         },
echo         {
echo             "label": "Install Dependencies",
echo             "type": "shell",
echo             "command": "echo Installing Backend deps... ^&^& cd backend ^&^& npm install ^&^& echo Installing Frontend deps... ^&^& cd .. ^&^& npm install ^&^& echo All dependencies installed!",
echo             "options": {
echo                 "cwd": "${workspaceFolder}"
echo             },
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated"
echo             }
echo         }
echo     ]
echo }
) > ".vscode\tasks.json"

echo [OK] VS Code tasks.json created!
echo.

:: Check if code command is available
where code >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] 'code' command not found in PATH.
    echo    Please ensure VS Code is installed and added to PATH.
    echo.
    pause
    exit /b 1
)

:: 1. Check and install dependencies if needed
echo [1/3] Checking dependencies...

:: Backend dependencies
if not exist "backend\node_modules" (
    echo Installing Backend dependencies...
    cd backend
    call npm install
    cd ..
)

:: Frontend dependencies
if not exist "node_modules" (
    echo Installing Frontend dependencies...
    call npm install
)

echo.
echo [2/3] Opening VS Code...

:: Open VS Code in the project folder
code "%PROJECT_ROOT%"

echo.
echo [3/3] Ready to start services...
echo.

echo ===================================================
echo.
echo   [OK] VS Code is now open with your project!
echo.
echo   PREREQUISITES:
echo   -----------------------------------------------------
echo   * MongoDB must be running locally or via Atlas
echo     Local: mongod --dbpath C:\data\db
echo     Atlas: Update MONGO_URI in backend\.env
echo.
echo   TO START ALL SERVICES:
echo   -----------------------------------------------------
echo   Option 1 (Recommended):
echo     Press: Ctrl+Shift+P
echo     Type:  "Tasks: Run Task"
echo     Select: "Start All Services"
echo.
echo   Option 2 (Keyboard shortcut):
echo     Press: Ctrl+Shift+B
echo.
echo   Option 3 (Individual terminals):
echo     Press: Ctrl+Shift+` (backtick) to open new terminal
echo.
echo     Terminal 1 - Backend:
echo       cd backend ^&^& npm start
echo.
echo     Terminal 2 - Frontend:
echo       npm run dev
echo.
echo   PORTS:
echo     * Backend API:  http://localhost:5000
echo     * Frontend:     http://localhost:3000
echo.
echo   DATABASE:
echo     * MongoDB:      mongodb://localhost:27017/foodtrace
echo.
echo ===================================================
echo.
pause
