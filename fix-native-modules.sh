#!/bin/bash

echo "🔧 Fixing native modules for myVenti app..."

# Clear all caches
echo "📦 Clearing npm cache..."
npm cache clean --force

echo "🧹 Clearing Expo cache..."
npx expo start --clear

echo "🗑️ Removing node_modules..."
rm -rf node_modules

echo "📱 Clearing Expo development build cache..."
rm -rf .expo

echo "📦 Reinstalling dependencies..."
npm install

echo "🔨 Running Expo prebuild to regenerate native code..."
npx expo prebuild --clean

echo "✅ Native modules fix complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm start' to start the development server"
echo "2. If still having issues, try 'npm run android' or 'npm run ios'"
echo "3. For development builds, run 'npm run build:a:dev'"