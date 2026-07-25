#!/bin/bash

# Setup script for Capacitor iOS project

echo "🚀 Setting up Wellness Mental PWA for iOS..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize Capacitor
echo "⚡ Initializing Capacitor..."
npx cap init "Wellness Mental" "com.wellnessmental.app" --web-dir=www

# Add iOS platform
echo "📱 Adding iOS platform..."
npx cap add ios

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync ios

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open iOS project: npx cap open ios"
echo "2. Build in Xcode"
echo "3. Run on simulator or device"
echo ""
echo "For development, run: npm start"
