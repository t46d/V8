#!/bin/bash
cd "$(dirname "$0")"
echo "Starting VeXachat..."
echo "1. Open http://localhost:8000"
echo "2. Or run: python3 server.py"
echo "3. For Firebase: firebase emulators:start"
echo ""
echo "Choose option:"
echo "1) Start HTTP Server"
echo "2) Start Firebase Emulators"
echo "3) Open project folder"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        python3 server.py
        ;;
    2)
        if command -v firebase &> /dev/null; then
            firebase emulators:start
        else
            echo "Firebase CLI not found. Installing..."
            npm install -g firebase-tools
            firebase emulators:start
        fi
        ;;
    3)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open .
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open .
        elif [[ "$OSTYPE" == "msys" ]]; then
            explorer .
        fi
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
