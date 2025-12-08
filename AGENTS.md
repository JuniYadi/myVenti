# AGENTS.md

## Development Commands
- `npm install` - Install dependencies
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device  
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality checks
- `npm run mcp` - Start spec workflow dashboard

## Code Style Guidelines

### Imports & Structure
- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Group imports: React/React Native → third-party → local components → types → utils
- Platform-specific files use `.ios.tsx` extension for iOS variants

### TypeScript & Types
- Strict mode enabled - all types must be properly defined
- Use interfaces for object shapes, types for unions/primitives
- Form data types use string values for input fields
- Export all types from `types/data.ts` for consistency

### Component Patterns
- Use `ThemedText` and `ThemedView` for automatic theme styling
- Component props extend native props (e.g., `TextProps & { custom?: string }`)
- Platform-specific implementations in separate `.ios.tsx` files
- Use `useColorScheme()` hook for theme detection

### Naming Conventions
- Components: PascalCase (e.g., `FuelEntryCard`, `ServiceForm`)
- Files: kebab-case for utilities, PascalCase for components
- Constants: UPPER_SNAKE_CASE in `constants/` directory
- Hooks: camelCase with `use-` prefix (e.g., `use-theme-color.ts`)

### Theme & Styling
- All colors from `constants/theme.ts` with light/dark variants
- Use `Spacing` and `Typography` constants for consistent sizing
- Avoid hardcoded colors/values - use theme system
- Platform-specific fonts defined in `Fonts` constant

### Error Handling
- Use TypeScript for compile-time safety
- Form validation with proper error messages
- Firebase error handling with user-friendly messages