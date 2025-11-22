#!/bin/bash

echo "========================================"
echo "Excel to API - Production Startup"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "WARNING: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "Please edit .env file with your production settings before running in production!"
    echo ""
    read -p "Press enter to continue..."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting server in production mode..."
echo ""
npm run prod
