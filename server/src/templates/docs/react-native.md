# REACT NATIVE APP BEST PRACTICES

## Coding Standards

### Component Structure

#### UI Components
- Place reusable UI components in src/components/ui/
- Place common UI components in src/components/common/
- Place screen-wise UI components in src/components/<screen-name>/
- Follow atomic design principles
- Use TypeScript for type safety
- Use React Navigation structure
- Keep screens minimal, delegate to components
- Keep code modular and clean
- Handle loading and error states
- State Management with Zustand
- Use React hooks for local state
- Implement global states in src/stores/
- Follow immutable state patterns

#### API Integration
- Define type-safe API clients in services/
- Use Axios ApiClient for API integration
- Store tokens in async-storage and embed in headers
- Use environment variables for endpoints
- Handle errors consistently

#### Best Practices
- Use TypeScript
- Define types in src/types/ directory
- Use strict type checking
- Avoid any type usage

#### Styling
- Use NativeWind and Tailwind CSS for styling
- Follow component-based styling
- Maintain consistent theme variables in tailwind.config.js

#### Other Best Practices
- Use async-storage for minimal persistent data
- Use safe-area-context and safe-area-view for safe area handling
- Use FlashList for high-performance lists
- Use Bottom Sheet for modal interactions
- Place all navigation logic in src/navigation/ directory
- Place all utility functions in src/utils/ directory
- Place all constants in src/constants/ directory
- Follow a reusable utility based approach
- Use React-Native Reanimated for Animations
- Use responsive layout for different screen-sizes
- Use FastImage for performant images
- Show loading states in images and videos
- Use Shimmer Placeholders for loading states
- Use haptics for feedback
- Use splash screen while loading app and validating tokens
- Notify user when network gets disconnected
- Use expo to manage device level permissions and Handle permissions carefully – Only request what’s needed.
- Avoid inline styles 
- Lazy load screens/components 
- Use Pagination to optimize app
- Minimize re-renders  Use React.memo, useCallback, useMemo
- Use secure storage – For sensitive data, use expo-secure-store
- Optimize assets – Compress images & use expo-asset
- Use .env with EXPO_PUBLIC_ prefix for environment variables
- Handle errors globally 


#### Development Workflow
Environment Setup

Install dependencies:

- Use expo packages whenever available - npx expo install
- Use npm for package management
- keep packages and dependencies updated – Use expo doctor, npx expo install.

Running the Application

Development mode (Expo Go App):
`npm run start`

Clear Cache and Start

`npm run start -- --reset-cache`

Generate Native Projects (Android & iOS Directories)

`npx expo prebuild`

Regenerate Native Projects (Clean Android & iOS Directories)

`npx expo prebuild --clean`

Auto Update Dependencies

`npm install expo@latest && npx expo install --fix`

Run Android Emulator/Device

`npx expo run:android`

Run Android Emulator/Device in Release Mode

`npx expo run:android --variant release`

Create Release APK file
` ./gradlew assembleRelease`

#### Code Quality
- Follow ESLint and Prettier configurations
- Use pre-commit hooks for code formatting
- Follow conventional commits
- API Guidelines
- Backend Endpoints
- Use versioning when needed
- Follow RESTful conventions
- Error Handling
- Use appropriate HTTP status codes
- Include detailed error messages
- Handle validation errors consistently
- Security Considerations
- Authentication
- JWT-based authentication
- Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- Performance Guidelines
- Backend
- Use async operations where appropriate
- Implement caching strategies
- Optimize database queries
- Frontend
- Implement code splitting
- Optimize image loading
- Use client-side caching


#### Testing
- Implement Jest for unit testing
- Use React Native Testing Library for component testing
- Write E2E tests using Detox
- Maintain test coverage above 80%
- Mock external dependencies in tests

#### Performance Optimization
- Use hermes engine for better performance
- Implement virtualized lists for large datasets
- Monitor and optimize JS bundle size
- Use expo-image for optimized image loading
- Implement proper keyboard handling

#### Accessibility
- Add proper accessibility labels
- Support dynamic text sizes
- Implement proper color contrast
- Support screen readers
- Test with VoiceOver and TalkBack

#### Error Boundaries
- Implement custom error boundaries
- Use error reporting services (e.g., Sentry)
- Handle crashes gracefully
- Implement offline error logging

#### Security
- Implement certificate pinning
- Use proper key storage
- Implement proper session management
- Handle deep linking securely
- Implement rate limiting
- Use proper app signing

#### Monitoring
- Implement analytics tracking
- Setup crash reporting
- Monitor app performance
- Track user engagement
- Implement proper logging

