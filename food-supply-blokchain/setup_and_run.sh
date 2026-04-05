#!/bin/bash

echo "==================================================="
echo "  Food Supply Blockchain - Setup & Run Script"
echo "==================================================="
echo ""
echo "This script will open VS Code terminals for each service"
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Create VS Code tasks configuration for running the services
mkdir -p "$PROJECT_ROOT/.vscode"

# Create tasks.json for VS Code terminal integration
cat > "$PROJECT_ROOT/.vscode/tasks.json" << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "1. Blockchain Node (Ganache)",
            "type": "shell",
            "command": "npm run start-node",
            "options": {
                "cwd": "${workspaceFolder}/blockchain"
            },
            "isBackground": true,
            "problemMatcher": {
                "pattern": {
                    "regexp": "^RPC Listening on.*"
                },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": ".*",
                    "endsPattern": ".*RPC Listening on.*"
                }
            },
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "2. Deploy Smart Contracts",
            "type": "shell",
            "command": "npx hardhat run scripts/deploy.js --network localhost",
            "options": {
                "cwd": "${workspaceFolder}/blockchain"
            },
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "shared",
                "group": "build"
            },
            "dependsOn": ["1. Blockchain Node (Ganache)"]
        },
        {
            "label": "3. Backend Server",
            "type": "shell",
            "command": "npm start",
            "options": {
                "cwd": "${workspaceFolder}/backend"
            },
            "isBackground": true,
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "4. Next.js Frontend",
            "type": "shell",
            "command": "npm run dev",
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "isBackground": true,
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "Start All Services",
            "dependsOn": [
                "1. Blockchain Node (Ganache)",
                "3. Backend Server",
                "4. Next.js Frontend"
            ],
            "dependsOrder": "parallel",
            "problemMatcher": [],
            "presentation": {
                "reveal": "always"
            },
            "group": {
                "kind": "build",
                "isDefault": true
            }
        },
        {
            "label": "Install All Dependencies",
            "type": "shell",
            "command": "echo 'Installing Blockchain deps...' && cd blockchain && npm install && echo 'Installing Backend deps...' && cd ../backend && npm install && echo 'Installing Frontend deps...' && cd .. && npm install && echo 'All dependencies installed!'",
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated"
            }
        }
    ]
}
EOF

echo "✅ VS Code tasks.json created!"
echo ""

# Check if code command is available
if ! command -v code &> /dev/null; then
    echo "⚠️  'code' command not found. Please install VS Code Shell Command:"
    echo "   1. Open VS Code"
    echo "   2. Press Cmd+Shift+P"
    echo "   3. Type 'Shell Command: Install 'code' command in PATH'"
    echo ""
    echo "After installing, you can run services manually with:"
    echo "   VS Code: Terminal > Run Task > Start All Services"
    echo ""
    exit 1
fi

# 1. Check and install dependencies if needed
echo "[1/3] Checking dependencies..."

# Blockchain dependencies
if [ ! -d "$PROJECT_ROOT/blockchain/node_modules" ]; then
    echo "Installing Blockchain dependencies..."
    cd "$PROJECT_ROOT/blockchain" && npm install
fi

# Backend dependencies
if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo "Installing Backend dependencies..."
    cd "$PROJECT_ROOT/backend" && npm install
fi

# Frontend dependencies
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd "$PROJECT_ROOT" && npm install
fi

cd "$PROJECT_ROOT"

echo ""
echo "[2/3] Opening VS Code..."

# Open VS Code in the project folder
code "$PROJECT_ROOT"

echo ""
echo "[3/3] Ready to start services..."
echo ""

echo "==================================================="
echo ""
echo "  ✅ VS Code is now open with your project!"
echo ""
echo "  PREREQUISITES:"
echo "  ─────────────────────────────────────────────────"
echo "  • MongoDB must be running locally or via Atlas"
echo "    Local: mongod --dbpath /path/to/data"
echo "    Atlas: Update MONGO_URI in backend/.env"
echo ""
echo "  TO START ALL SERVICES:"
echo "  ─────────────────────────────────────────────────"
echo "  Option 1 (Recommended):"
echo "    Press: Cmd+Shift+P"
echo "    Type:  'Tasks: Run Task'"
echo "    Select: 'Start All Services'"
echo ""
echo "  Option 2 (Keyboard shortcut):"
echo "    Press: Cmd+Shift+B"
echo ""
echo "  Option 3 (Individual terminals):"
echo "    Press: Ctrl+Shift+\` (backtick) to open new terminal"
echo ""
echo "    Terminal 1 - Blockchain (Ganache):"
echo "      cd blockchain && npm run start-node"
echo ""
echo "    Terminal 2 - Deploy Contracts:"
echo "      cd blockchain && npx hardhat run scripts/deploy.js --network localhost"
echo ""
echo "    Terminal 3 - Backend:"
echo "      cd backend && npm start"
echo ""
echo "    Terminal 4 - Frontend:"
echo "      npm run dev"
echo ""
echo "  PORTS:"
echo "    • Blockchain:   http://localhost:7545 (Chain ID 1337)"
echo "    • Backend API:  http://localhost:5001"
echo "    • Frontend:     http://localhost:3000"
echo ""
echo "  DATABASE:"
echo "    • MongoDB:      mongodb://localhost:27017/foodtrace"
echo ""
echo "==================================================="
