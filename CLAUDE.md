# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native application called "myVenti" that uses:
- **Expo SDK ~54** with the new architecture enabled
- **Expo Router** for file-based routing with typed routes enabled
- **React Native 0.81.5** with React 19.1.0
- **TypeScript** with strict mode enabled
- **Tab navigation** using expo-router's Tabs layout
- **Dark/Light theme support** with automatic system preference detection

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm start` or `npx expo start` - Start development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Project Management
- `npm run reset-project` - Moves current app to app-example and creates blank app directory
- `npm run mcp` - Starts spec workflow dashboard for specification management

## Architecture & File Structure

### Routing Structure
- **File-based routing** using Expo Router with typed routes experiment enabled
- Root layout: `app/_layout.tsx` - Contains Stack navigation with theme provider
- Tab layout: `app/(tabs)/_layout.tsx` - Bottom tab navigation with Home and Explore tabs
- Modal: `app/modal.tsx` - Modal screen presentation

### Key Directories
- `app/` - Main application screens using file-based routing
- `app/(tabs)/` - Tab-based navigation screens
- `components/` - Reusable UI components
- `components/ui/` - Platform-specific UI components (iOS variants)
- `constants/` - App constants including theme colors and fonts
- `hooks/` - Custom React hooks including platform-specific variants
- `assets/` - Images, icons, and static assets

### Component System
- **Themed Components**: `ThemedText` and `ThemedView` for automatic theme styling
- **Platform-specific**: Separate .ios.tsx files for iOS-specific implementations
- **Interactive Components**: Haptic feedback, collapsible sections, parallax scrolling

### Theming System
- **Color Scheme Detection**: Uses `useColorScheme` hook for automatic dark/light mode
- **Theme Colors**: Defined in `constants/theme.ts` with consistent naming
- **Typography**: Platform-specific font definitions (system-ui for iOS, system fonts for web/Android)
- **Navigation Integration**: React Navigation themes automatically sync with app theme

## Configuration Files

- **app.json**: Expo configuration with new architecture enabled, typed routes, and React Compiler experiment
- **tsconfig.json**: TypeScript configuration with strict mode and path aliases (@/*)
- **eslint.config.js**: ESLint configuration using Expo's flat config preset

## Development Notes

### Target Platforms
- iOS (with tablet support)
- Android (with adaptive icons and edge-to-edge)
- Web (static output)

### Key Dependencies
- Expo Router for navigation
- React Native Reanimated for animations
- Expo Symbols for SF Symbols (iOS) and equivalent icons
- Expo Image for optimized image handling

### Branch Requirement
Always create a new branch before making changes as per user requirements.